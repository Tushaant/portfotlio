"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Sprite,
  type Group,
  type LineLoop,
  type Mesh,
  type Points,
  type PointsMaterial,
} from "three";

type SpectrumState = "idle" | "listening" | "thinking" | "speaking";

const PALETTE: Record<SpectrumState, [string, string]> = {
  idle: ["#7c3aed", "#c4b5fd"],
  listening: ["#22d3ee", "#5eead4"],
  thinking: ["#6d28d9", "#818cf8"],
  speaking: ["#e879f9", "#22d3ee"],
};

const SPIKES = 42;
const PARTICLES = 84;
const WAVE = 120;

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
  const glow = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  glow.addColorStop(0, "rgba(255,255,255,0.95)");
  glow.addColorStop(0.28, "rgba(255,255,255,0.22)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function loopGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(WAVE * 3), 3));
  return geometry;
}

function writeWave(
  geometry: BufferGeometry,
  time: number,
  radius: number,
  amplitude: number,
  lift: number,
  rate: number,
  harmonic: number,
) {
  const position = geometry.getAttribute("position");
  for (let index = 0; index < WAVE; index += 1) {
    const angle = (index / WAVE) * Math.PI * 2;
    const swell = Math.sin(angle * harmonic + time * rate) * 0.62 + Math.sin(angle * (harmonic + 2) - time * rate * 0.7) * 0.38;
    const radial = radius + swell * amplitude;
    position.setXYZ(index, Math.cos(angle) * radial, lift + Math.sin(angle * 3 + time * 0.8) * amplitude * 0.35, Math.sin(angle) * radial);
  }
  position.needsUpdate = true;
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
  const rings = useRef<Group>(null);
  const spikes = useRef<InstancedMesh>(null);
  const particles = useRef<Points>(null);
  const core = useRef<Mesh>(null);
  const halo = useRef<Sprite>(null);
  const pulse = useRef<Mesh>(null);
  const nearWave = useRef<LineLoop>(null);
  const farWave = useRef<LineLoop>(null);
  const primary = useMemo(() => new Color(PALETTE.idle[0]), []);
  const secondary = useMemo(() => new Color(PALETTE.idle[1]), []);
  const nextPrimary = useMemo(() => new Color(), []);
  const nextSecondary = useMemo(() => new Color(), []);
  const spikeColor = useMemo(() => new Color(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const nearGeometry = useMemo(() => loopGeometry(), []);
  const farGeometry = useMemo(() => loopGeometry(), []);
  const particleGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(PARTICLES * 3), 3));
    return geometry;
  }, []);
  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, index) => ({
        angle: (index / PARTICLES) * Math.PI * 2,
        radius: 0.72 + (index % 7) * 0.08,
        lift: ((index % 9) - 4) * 0.045,
        layer: index % 3,
      })),
    [],
  );
  const spriteMap = useMemo(() => glowTexture(), []);

  useFrame(({ clock }, dt) => {
    const key = resolveSpectrumState(stateRef.current);
    const level = key === "listening" ? levelRef.current : 0;
    const time = clock.elapsedTime;
    const rate = reduce ? 0.2 : 1;
    nextPrimary.set(PALETTE[key][0]);
    nextSecondary.set(PALETTE[key][1]);
    const blend = 1 - Math.exp(-dt * 4);
    primary.lerp(nextPrimary, blend);
    secondary.lerp(nextSecondary, blend);

    const speech = key === "speaking" ? 0.48 + 0.52 * (0.5 + 0.5 * Math.sin(time * 6.4)) * (0.6 + 0.4 * Math.sin(time * 2.3)) : 0;
    const energy = key === "listening" ? 0.18 + level * 0.95 : key === "speaking" ? speech : key === "thinking" ? 0.22 : 0.07;

    if (rings.current) {
      rings.current.children.forEach((child, index) => {
        child.rotation.z += dt * (index % 2 === 0 ? 0.08 : -0.05) * rate;
        const material = (child as Mesh).material as MeshBasicMaterial;
        if (material?.color) material.color.copy(index % 2 === 0 ? primary : secondary);
      });
    }
    if (halo.current) {
      halo.current.material.color.copy(primary);
      halo.current.material.opacity = 0.22 + energy * 0.28;
      halo.current.scale.setScalar(2.8 + energy * 0.35);
    }
    if (pulse.current) {
      const material = pulse.current.material as MeshBasicMaterial;
      const active = key === "listening" || key === "speaking";
      const cycle = (time * (key === "speaking" ? 0.45 : 0.28)) % 1;
      pulse.current.visible = active;
      pulse.current.scale.setScalar(0.7 + cycle * 0.85);
      material.opacity = active ? (1 - cycle) * 0.35 : 0;
      material.color.copy(secondary);
    }
    if (core.current) {
      const show = key === "thinking";
      core.current.visible = show;
      core.current.scale.setScalar(0.16 + Math.sin(time * 1.6) * 0.012);
      (core.current.material as MeshBasicMaterial).color.copy(secondary);
      core.current.rotation.y += dt * 0.25 * rate;
    }
    if (spikes.current) {
      for (let index = 0; index < SPIKES; index += 1) {
        const angle = (index / SPIKES) * Math.PI * 2;
        const uneven = 0.45 + 0.55 * Math.abs(Math.sin(index * 1.7 + time * (key === "speaking" ? 5.2 : 1.3) * rate));
        const height = key === "thinking" || key === "idle" ? 0.025 + energy * uneven * 0.22 : 0.04 + energy * uneven * 0.72;
        dummy.position.set(Math.cos(angle) * 0.92, height / 2 + 0.02, Math.sin(angle) * 0.92);
        dummy.scale.set(0.018, height, 0.018);
        dummy.updateMatrix();
        spikes.current.setMatrixAt(index, dummy.matrix);
        spikeColor.copy(primary).lerp(secondary, uneven);
        spikes.current.setColorAt(index, spikeColor);
      }
      spikes.current.instanceMatrix.needsUpdate = true;
      if (spikes.current.instanceColor) spikes.current.instanceColor.needsUpdate = true;
    }
    writeWave(nearGeometry, time, 0.62, 0.05 + energy * 0.16, 0.05, 1.4 * rate, key === "speaking" ? 5 : 3);
    writeWave(farGeometry, time, 1.08, 0.03 + energy * 0.1, -0.08, 0.8 * rate, 4);
    const nearMaterial = nearWave.current?.material as MeshBasicMaterial | undefined;
    const farMaterial = farWave.current?.material as MeshBasicMaterial | undefined;
    nearMaterial?.color.copy(secondary);
    farMaterial?.color.copy(primary);

    const cloud = particles.current;
    const position = cloud?.geometry.getAttribute("position");
    if (cloud && position) {
      (cloud.material as PointsMaterial).color.copy(secondary);
      for (let index = 0; index < PARTICLES; index += 1) {
        const seed = seeds[index];
        const spin = seed.angle + time * (0.05 + seed.layer * 0.03) * rate * (key === "thinking" ? -1 : 1);
        const breathe = key === "thinking" ? 0.28 + 0.22 * (0.5 + 0.5 * Math.sin(time * 1.1 + index)) : 1;
        const radius = seed.radius * breathe * (key === "listening" ? 1 + level * 0.06 : 1);
        const lift = seed.lift + (seed.layer - 1) * 0.12 + Math.sin(time * rate + index * 0.4) * 0.02;
        position.setXYZ(index, Math.cos(spin) * radius, lift, Math.sin(spin) * radius);
      }
      position.needsUpdate = true;
    }
  });

  return (
    <group rotation={[0.55, 0.18, 0]} scale={0.82}>
      <sprite ref={halo} scale={2.8}>
        <spriteMaterial map={spriteMap} color={PALETTE.idle[0]} transparent opacity={0.28} depthWrite={false} blending={AdditiveBlending} />
      </sprite>
      <group ref={rings}>
        {[
          [0.46, 0.16, 0.012],
          [0.7, 0.02, 0.008],
          [0.96, -0.12, 0.006],
          [1.16, -0.24, 0.004],
        ].map(([radius, lift, tube]) => (
          <mesh key={radius} position={[0, lift, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, tube, 10, 96]} />
            <meshBasicMaterial color={primary} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <ringGeometry args={[0.7, 1.15, 64]} />
        <meshBasicMaterial color={primary} transparent opacity={0.08} blending={AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
      <mesh ref={pulse} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 0.86, 64]} />
        <meshBasicMaterial color={secondary} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <lineLoop ref={nearWave} geometry={nearGeometry}>
        <lineBasicMaterial color={secondary} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
      </lineLoop>
      <lineLoop ref={farWave} geometry={farGeometry}>
        <lineBasicMaterial color={primary} transparent opacity={0.45} blending={AdditiveBlending} depthWrite={false} />
      </lineLoop>
      <instancedMesh ref={spikes} args={[undefined, undefined, SPIKES]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <points ref={particles} geometry={particleGeometry}>
        <pointsMaterial color={PALETTE.idle[1]} size={0.028} transparent opacity={0.8} depthWrite={false} blending={AdditiveBlending} sizeAttenuation />
      </points>
      <mesh ref={core} visible={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={PALETTE.thinking[1]} wireframe transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function SpectrumFallback({ visual }: { visual: SpectrumState }) {
  const ring = visual === "listening" ? "border-cyan-300/70" : visual === "speaking" ? "border-fuchsia-300/80" : "border-violet-300/70";
  return (
    <div className="relative h-full w-full" aria-hidden>
      <span className={`absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${ring}`} />
      <span className={`absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${ring} opacity-70`} />
      <span className={`absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${ring} opacity-40`} />
      {visual === "thinking" ? <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-200/80" /> : null}
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
      <div className="relative h-[240px] w-full sm:h-[320px]">
        {webgl ? (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.95, 3.45], fov: 34 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            frameloop={reduce ? "demand" : "always"}
            onCreated={({ gl, camera }) => {
              gl.setClearColor(0x000000, 0);
              camera.lookAt(0, -0.02, 0);
            }}
          >
            <SpectrumScene stateRef={stateRef} levelRef={levelRef} reduce={reduce} />
          </Canvas>
        ) : (
          <SpectrumFallback visual={visual} />
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Image src="/profile/tushant.jpg" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
        <p className="text-sm text-[#f4f4f5]" aria-live="polite" data-voice-status>
          {label}
        </p>
      </div>
    </div>
  );
}
