"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Sprite,
  type Group,
  type Mesh,
  type Points,
  type PointsMaterial,
} from "three";

type SpectrumState = "idle" | "listening" | "thinking" | "speaking";

const PALETTE: Record<SpectrumState, [string, string]> = {
  idle: ["#8b5cf6", "#c4b5fd"],
  listening: ["#22d3ee", "#5eead4"],
  thinking: ["#7c3aed", "#818cf8"],
  speaking: ["#e879f9", "#22d3ee"],
};

const BARS = 48;
const PARTICLES = 72;

export function resolveSpectrumState(state: string): SpectrumState {
  if (state === "listening" || state === "interrupted") return "listening";
  if (state === "thinking") return "thinking";
  if (state === "speaking") return "speaking";
  return "idle";
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new CanvasTexture(canvas);
  const glow = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  glow.addColorStop(0, "rgba(255,255,255,0.95)");
  glow.addColorStop(0.35, "rgba(255,255,255,0.28)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function SpectrumScene({
  stateRef,
  levelRef,
  reduce,
}: {
  stateRef: RefObject<string>;
  levelRef: RefObject<number>;
  reduce: boolean;
}) {
  const rig = useRef<Group>(null);
  const bars = useRef<InstancedMesh>(null);
  const particles = useRef<Points>(null);
  const sphere = useRef<Mesh>(null);
  const halo = useRef<Sprite>(null);
  const rings = useRef<Group>(null);
  const primary = useMemo(() => new Color(PALETTE.idle[0]), []);
  const secondary = useMemo(() => new Color(PALETTE.idle[1]), []);
  const nextPrimary = useMemo(() => new Color(), []);
  const nextSecondary = useMemo(() => new Color(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const barColor = useMemo(() => new Color(), []);
  const barGeometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const barMaterial = useMemo(
    () => new MeshBasicMaterial({ toneMapped: false, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.92 }),
    [],
  );
  const particleGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(PARTICLES * 3), 3));
    return geometry;
  }, []);
  const seeds = useMemo(
    () => Array.from({ length: PARTICLES }, (_, index) => ({ angle: (index / PARTICLES) * Math.PI * 2, radius: 0.95 + (index % 5) * 0.08, lift: ((index * 17) % 10) / 28 })),
    [],
  );
  const spriteMap = useMemo(() => glowTexture(), []);

  useFrame(({ clock }, dt) => {
    const key = resolveSpectrumState(stateRef.current);
    const level = key === "listening" ? levelRef.current : 0;
    const time = clock.elapsedTime;
    const rate = reduce ? 0.22 : 1;
    nextPrimary.set(PALETTE[key][0]);
    nextSecondary.set(PALETTE[key][1]);
    primary.lerp(nextPrimary, 1 - Math.exp(-dt * 5));
    secondary.lerp(nextSecondary, 1 - Math.exp(-dt * 5));

    const speech =
      key === "speaking" ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 7.2)) * (0.65 + 0.35 * Math.sin(time * 2.6)) : 0;
    const energy = key === "listening" ? 0.22 + level * 0.9 : key === "speaking" ? speech : key === "thinking" ? 0.18 : 0.08;

    if (rig.current) rig.current.rotation.y += dt * (key === "thinking" ? 0.15 : 0.08) * rate;
    if (rings.current) {
      rings.current.rotation.y -= dt * (0.12 + energy * 0.2) * rate;
      let ringIndex = 0;
      rings.current.traverse((node) => {
        const material = (node as Mesh).material as MeshBasicMaterial | undefined;
        if (!material?.color) return;
        material.color.copy(ringIndex === 1 ? secondary : primary);
        ringIndex += 1;
      });
    }
    if (halo.current) {
      halo.current.material.color.copy(primary);
      halo.current.material.opacity = 0.28 + energy * 0.35;
      halo.current.scale.setScalar(2.3 + energy * 0.45);
    }
    if (sphere.current) {
      const show = key === "thinking";
      sphere.current.visible = show;
      sphere.current.scale.setScalar(0.34 + Math.sin(time * 1.4) * 0.02);
      const material = sphere.current.material as MeshBasicMaterial;
      material.opacity = show ? 0.95 : 0;
      material.color.copy(secondary);
      sphere.current.rotation.y += dt * 0.35 * rate;
    }
    if (bars.current) {
      for (let index = 0; index < BARS; index += 1) {
        const angle = (index / BARS) * Math.PI * 2;
        const wave = 0.5 + 0.5 * Math.sin(time * (key === "speaking" ? 6.4 : 1.6) * rate + index * 0.62);
        const ripple = 0.5 + 0.5 * Math.sin(time * 2.1 * rate + index * 0.31);
        const peak = key === "idle" ? 0.08 : key === "thinking" ? 0.05 : 0.15 + energy * (0.55 + wave * 0.85);
        const height = 0.035 + peak * (0.35 + ripple * 0.65);
        dummy.position.set(Math.cos(angle) * 0.72, height / 2, Math.sin(angle) * 0.72);
        dummy.scale.set(0.028, height, 0.028);
        dummy.rotation.set(0, -angle, 0);
        dummy.updateMatrix();
        bars.current.setMatrixAt(index, dummy.matrix);
        barColor.copy(primary).lerp(secondary, index / BARS);
        bars.current.setColorAt(index, barColor);
      }
      bars.current.instanceMatrix.needsUpdate = true;
      if (bars.current.instanceColor) bars.current.instanceColor.needsUpdate = true;
    }
    const cloud = particles.current;
    const position = cloud?.geometry.getAttribute("position");
    if (cloud && position) {
      (cloud.material as PointsMaterial).color.copy(secondary);
      for (let index = 0; index < PARTICLES; index += 1) {
        const seed = seeds[index];
        const spin = seed.angle + time * (key === "thinking" ? -0.35 : 0.18) * rate;
        const inward = key === "thinking" ? 0.55 + 0.28 * (0.5 + 0.5 * Math.sin(time * 1.3 + index)) : 1;
        const radius = seed.radius * inward * (key === "listening" ? 1 + level * 0.08 : 1);
        position.setXYZ(index, Math.cos(spin) * radius, seed.lift + Math.sin(time * rate + index) * 0.04, Math.sin(spin) * radius);
      }
      position.needsUpdate = true;
    }
  });

  return (
    <group ref={rig} rotation={[0.62, 0, 0]}>
      <sprite ref={halo} position={[0, 0.05, 0]} scale={2.4}>
        <spriteMaterial map={spriteMap} color={PALETTE.idle[0]} transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} />
      </sprite>
      <group ref={rings}>
        {[0.55, 0.78, 1.02].map((radius, index) => (
          <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.008 + index * 0.002, 12, 80]} />
            <meshBasicMaterial color={index === 1 ? secondary : primary} transparent opacity={0.55 - index * 0.1} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={bars} args={[barGeometry, barMaterial, BARS]} />
      <points ref={particles} geometry={particleGeometry}>
        <pointsMaterial color={PALETTE.idle[1]} size={0.035} transparent opacity={0.85} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
      </points>
      <mesh ref={sphere}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={PALETTE.thinking[1]} wireframe transparent opacity={0} />
      </mesh>
    </group>
  );
}

function SpectrumFallback({ visual }: { visual: SpectrumState }) {
  const tones: Record<SpectrumState, string> = {
    idle: "from-violet-500/70 to-fuchsia-400/30",
    listening: "from-cyan-300 to-teal-300/40",
    thinking: "from-violet-400 to-indigo-400/40",
    speaking: "from-fuchsia-400 to-cyan-300/50",
  };
  return (
    <div className={`relative h-full w-full bg-gradient-to-t ${tones[visual]}`} aria-hidden>
      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
      <span className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      {visual === "thinking" ? <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" /> : null}
    </div>
  );
}

export function HolographicSpectrum({
  state,
  level = 0,
  label,
}: {
  state: string;
  level?: number;
  label: string;
}) {
  const stateRef = useRef(state);
  const levelRef = useRef(level);
  stateRef.current = state;
  levelRef.current = level;
  const visual = resolveSpectrumState(state);
  const [webgl, setWebgl] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setWebgl(canUseWebGL());
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="flex w-full flex-col items-center" data-spectrum-state={visual}>
      <div className="relative h-[168px] w-[220px] overflow-hidden rounded-[2rem] bg-[#070712] shadow-[0_0_36px_rgba(139,92,246,0.28)] sm:h-[188px] sm:w-[250px]">
        {webgl ? (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 1.35, 2.15], fov: 34 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            frameloop={reduce ? "demand" : "always"}
            onCreated={({ gl, camera }) => {
              gl.setClearColor(0x000000, 0);
              camera.lookAt(0, 0.02, 0);
            }}
          >
            <SpectrumScene stateRef={stateRef} levelRef={levelRef} reduce={reduce} />
          </Canvas>
        ) : (
          <SpectrumFallback visual={visual} />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-full border border-violet-300/25 bg-[#12081f] py-1 pl-1 pr-3">
        <Image src="/profile/tushant.jpg" alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
        <p className="text-sm text-[#f5f3ff]" aria-live="polite" data-voice-status>
          {label}
        </p>
      </div>
    </div>
  );
}
