"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useUIStore } from "@/store/ui-store";

type Theme = "dark" | "light";

const THEMES = {
  dark: {
    bg: "#05060B",
    node: "#38F8FF",
    link: "#4F8BFF",
    globeEmissive: "#4F8BFF",
    globeColor: "#08111F",
    lightA: "#38F8FF",
    lightB: "#8A5CFF",
    chips: ["#38F8FF", "#F23FFF", "#00F5A0"] as string[],
    fog: "#05060B",
    ambient: 0.35,
  },
  light: {
    bg: "#FFF9F0",
    node: "#D4AF37",
    link: "#F5D76E",
    globeEmissive: "#C9A227",
    globeColor: "#FFF4E0",
    lightA: "#FFE9A8",
    lightB: "#FFD700",
    chips: ["#FFD700", "#FFF8DC", "#E8C547"] as string[],
    fog: "#FFF9F0",
    ambient: 0.75,
  },
};

function NeuralNodes({
  count = 64,
  color,
}: {
  count?: number;
  color: string;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.06 + mouse.x * 0.25;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.08 + mouse.y * 0.18;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

function Links({ color }: { color: string }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 52; i++) {
      points.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.03;
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.15) * 0.05;
  });

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.28} />
    </lineSegments>
  );
}

function Globe({ color, emissive }: { color: string; emissive: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.14;
    ref.current.rotation.x = clock.getElapsedTime() * 0.04;
    ref.current.position.x = 2.4 + mouse.x * 0.5;
    ref.current.position.y = 0.15 + mouse.y * 0.3;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.7}>
      <mesh ref={ref} position={[2.4, 0.15, -1]}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.65}
          wireframe
          transparent
          opacity={0.75}
        />
      </mesh>
    </Float>
  );
}

function TorusRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.25;
    ref.current.rotation.y = clock.getElapsedTime() * 0.18;
  });
  return (
    <mesh ref={ref} position={[-2.2, 0.4, -1.5]}>
      <torusGeometry args={[1.1, 0.03, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        metalness={0.9}
        roughness={0.15}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function HoloChip({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <Float speed={2.2} floatIntensity={1.4}>
      <mesh position={position} rotation={[0.4, 0.6, 0.2]}>
        <boxGeometry args={[0.6, 0.08, 0.95]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.85}
          roughness={0.15}
          transparent
          opacity={0.88}
        />
      </mesh>
    </Float>
  );
}

function DataOrbits({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.2;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0.4 + i * 0.3, i * 0.7, 0]}>
          <torusGeometry args={[1.8 + i * 0.35, 0.008, 8, 80]} />
          <meshBasicMaterial color={color} transparent opacity={0.25 - i * 0.05} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ theme }: { theme: Theme }) {
  const t = THEMES[theme];
  return (
    <>
      <color attach="background" args={[t.bg]} />
      <fog attach="fog" args={[t.fog, 7, 20]} />
      <ambientLight intensity={t.ambient} />
      <pointLight position={[5, 4, 3]} intensity={theme === "light" ? 2.2 : 1.5} color={t.lightA} />
      <pointLight position={[-5, -2, 2]} intensity={theme === "light" ? 1.6 : 1} color={t.lightB} />
      <pointLight position={[0, 5, -2]} intensity={0.8} color={theme === "light" ? "#FFFFFF" : "#38F8FF"} />
      {theme === "dark" ? (
        <Stars radius={70} depth={45} count={2200} factor={3.2} saturation={0} fade speed={0.7} />
      ) : (
        <Stars radius={70} depth={45} count={900} factor={2.2} saturation={0.4} fade speed={0.4} />
      )}
      <NeuralNodes color={t.node} />
      <Links color={t.link} />
      <Globe color={t.globeColor} emissive={t.globeEmissive} />
      <TorusRing color={t.chips[0]} />
      <DataOrbits color={t.node} />
      <HoloChip position={[-2.8, 1.2, 0.6]} color={t.chips[0]} />
      <HoloChip position={[-1.6, -1.3, 1.1]} color={t.chips[1]} />
      <HoloChip position={[0.5, 1.7, -0.4]} color={t.chips[2]} />
      <HoloChip position={[1.8, -1.0, 0.8]} color={t.chips[0]} />
    </>
  );
}

/** Full-viewport 3D command-center atmosphere used globally. */
export function MotionScene({ className = "" }: { className?: string }) {
  const theme = useUIStore((s) => s.hologramMode);
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 7.2], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene theme={theme} />
      </Canvas>
    </div>
  );
}

/** @deprecated use MotionScene — kept for hero import compatibility */
export function HeroScene() {
  return <MotionScene className="-z-10" />;
}
