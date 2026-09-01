"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useUIStore } from "@/store/ui-store";

type Theme = "dark" | "light";

/** Palette: dark = Codespot black + emerald · light = white + metallic gold */
const PALETTE = {
  dark: {
    bg: "#050505",
    fog: "#050505",
    nodeCore: "#FFFFFF",
    nodeMid: "#FF3CAC",
    nodeDeep: "#8B5CF6",
    link: "#22D3EE",
    facet: "#3B82F6",
    lightA: "#FF3CAC",
    lightB: "#8B5CF6",
    ambient: 0.32,
  },
  light: {
    bg: "#FFFFFF",
    fog: "#FFFFFF",
    nodeCore: "#C5A059",
    nodeMid: "#B8860B",
    nodeDeep: "#F9E498",
    link: "#C5A059",
    facet: "#F9E498",
    lightA: "#FFFFFF",
    lightB: "#F9E498",
    ambient: 0.95,
  },
};

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Graph = {
  positions: Float32Array;
  edges: Float32Array;
  facets: Float32Array;
  count: number;
};

/** Organic neural-brain cluster (dark reference) */
function buildOrganicBrain(count = 140): Graph {
  const rand = seeded(42);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    // denser on left/center like the reference
    const biasX = rand() * 0.55 - 0.15;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 1.2 + Math.pow(rand(), 0.7) * 3.8;
    const x = Math.sin(phi) * Math.cos(theta) * r * (0.7 + biasX);
    const y = Math.sin(phi) * Math.sin(theta) * r * 0.75;
    const z = Math.cos(phi) * r * 0.55;
    pts.push(new THREE.Vector3(x - 0.8, y, z));
  }

  const positions = new Float32Array(count * 3);
  pts.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  });

  // nearest-neighbor connections
  const edgeVerts: number[] = [];
  const k = 4;
  for (let i = 0; i < count; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      dists.push({ j, d: pts[i].distanceTo(pts[j]) });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let n = 0; n < k; n++) {
      const j = dists[n].j;
      if (i < j || dists[n].d < 2.4) {
        edgeVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
  }
  const edges = new Float32Array(edgeVerts);

  // translucent triangular facets among close triplets
  const facetVerts: number[] = [];
  for (let i = 0; i < count; i += 3) {
    const a = pts[i];
    const near: number[] = [];
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      if (a.distanceTo(pts[j]) < 1.65) near.push(j);
    }
    if (near.length >= 2) {
      const b = pts[near[0]];
      const c = pts[near[1]];
      facetVerts.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    }
  }
  const facets = new Float32Array(facetVerts);

  return { positions, edges, facets, count };
}

/** Radial gold circuit / neural star (light reference) */
function buildCircuitBrain(rings = 6, perRing = 18): Graph {
  const rand = seeded(99);
  const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
  for (let r = 1; r <= rings; r++) {
    const radius = 0.7 + r * 0.72;
    const n = perRing + r * 2;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + r * 0.12;
      // PCB-like slight octagonal snap
      const snap = Math.round(ang / (Math.PI / 4)) * (Math.PI / 4);
      const mix = 0.65;
      const a = ang * (1 - mix) + snap * mix;
      const jitter = (rand() - 0.5) * 0.12;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * (radius + jitter),
          Math.sin(a) * (radius + jitter),
          (rand() - 0.5) * 0.35,
        ),
      );
    }
  }

  const count = pts.length;
  const positions = new Float32Array(count * 3);
  pts.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  });

  const edgeVerts: number[] = [];
  // spokes from center + ring links + radial jumps
  for (let i = 1; i < count; i++) {
    // connect toward center / previous ring
    let best = 0;
    let bestD = Infinity;
    for (let j = 0; j < i; j++) {
      const d = pts[i].distanceTo(pts[j]);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    edgeVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[best].x, pts[best].y, pts[best].z);

    // neighbor on similar radius
    for (let j = i + 1; j < Math.min(i + 4, count); j++) {
      if (pts[i].distanceTo(pts[j]) < 1.1) {
        edgeVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
  }
  const edges = new Float32Array(edgeVerts);
  return { positions, edges, facets: new Float32Array(0), count };
}

function PulseDots({
  edges,
  color,
  speed = 1,
}: {
  edges: Float32Array;
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const count = Math.min(48, Math.floor(edges.length / 6));
  const base = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const e = (i * 6) % (edges.length - 5);
      arr[i * 3] = edges[e];
      arr[i * 3 + 1] = edges[e + 1];
      arr[i * 3 + 2] = edges[e + 2];
    }
    return { arr, indices: Array.from({ length: count }, (_, i) => (i * 6) % (edges.length - 5)) };
  }, [edges, count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime() * speed;
    for (let i = 0; i < count; i++) {
      const e = base.indices[i];
      const u = (t * 0.35 + i * 0.17) % 1;
      pos.setXYZ(
        i,
        THREE.MathUtils.lerp(edges[e], edges[e + 3], u),
        THREE.MathUtils.lerp(edges[e + 1], edges[e + 4], u),
        THREE.MathUtils.lerp(edges[e + 2], edges[e + 5], u),
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base.arr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color={color}
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function NeuralGraph({ theme }: { theme: Theme }) {
  const group = useRef<THREE.Group>(null);
  const p = PALETTE[theme];
  const graph = useMemo(
    () => (theme === "dark" ? buildOrganicBrain(150) : buildCircuitBrain(6, 16)),
    [theme],
  );

  useFrame(({ clock, mouse }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.08 + mouse.x * 0.35;
    group.current.rotation.x = Math.sin(t * 0.22) * 0.12 + mouse.y * 0.2;
    const breathe = 1 + Math.sin(t * 0.6) * 0.025;
    group.current.scale.setScalar(breathe);
  });

  return (
    <group ref={group} position={theme === "light" ? [0, 0.1, 0] : [0.4, 0, 0]}>
      {/* Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[graph.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={theme === "dark" ? 0.065 : 0.055}
          color={p.nodeCore}
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Secondary hotter nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[graph.positions.slice(0, Math.floor(graph.count / 2) * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={theme === "dark" ? 0.11 : 0.08}
          color={p.nodeMid}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Connections node → node */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[graph.edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={p.link}
          transparent
          opacity={theme === "dark" ? 0.42 : 0.55}
          depthWrite={false}
        />
      </lineSegments>

      {/* Dark-mode crystalline facets */}
      {theme === "dark" && graph.facets.length > 0 && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[graph.facets, 3]} />
          </bufferGeometry>
          <meshBasicMaterial
            color={p.facet}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      <PulseDots edges={graph.edges} color={p.nodeCore} speed={theme === "light" ? 1.2 : 0.9} />

      {/* Light-mode AI core chip */}
      {theme === "light" && (
        <group>
          <mesh position={[0, 0, 0.15]}>
            <planeGeometry args={[1.15, 1.15]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#F9E498"
              emissiveIntensity={0.35}
              metalness={0.2}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 0, 0.16]}>
            <planeGeometry args={[1.05, 1.05]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* gold rim */}
          <mesh position={[0, 0, 0.14]} rotation={[0, 0, Math.PI / 4]}>
            <ringGeometry args={[0.78, 0.82, 4]} />
            <meshBasicMaterial color="#C5A059" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Scene({ theme }: { theme: Theme }) {
  const p = PALETTE[theme];
  return (
    <>
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.fog, theme === "dark" ? 8 : 10, theme === "dark" ? 18 : 22]} />
      <ambientLight intensity={p.ambient} />
      <pointLight position={[4, 3, 4]} intensity={theme === "dark" ? 2.2 : 1.4} color={p.lightA} />
      <pointLight position={[-4, -2, 2]} intensity={theme === "dark" ? 1.4 : 0.9} color={p.lightB} />
      <pointLight position={[0, 0, 5]} intensity={theme === "dark" ? 0.6 : 1.2} color="#FFFFFF" />
      <NeuralGraph theme={theme} />
    </>
  );
}

export function MotionScene({ className = "" }: { className?: string }) {
  const theme = useUIStore((s) => s.hologramMode);
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene theme={theme} />
      </Canvas>
    </div>
  );
}

export function HeroScene() {
  return <MotionScene className="-z-10" />;
}
