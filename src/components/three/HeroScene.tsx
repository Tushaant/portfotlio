"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function NeuralNodes({ count = 48 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05 + mouse.x * 0.2;
    ref.current.rotation.x = mouse.y * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#38F8FF"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

function Links() {
  const geo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 36; i++) {
      points.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#4F8BFF" transparent opacity={0.25} />
    </lineSegments>
  );
}

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.12;
    ref.current.position.x = mouse.x * 0.4;
    ref.current.position.y = mouse.y * 0.25;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref} position={[2.2, 0.2, -1]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color="#08111F"
          emissive="#4F8BFF"
          emissiveIntensity={0.55}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
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
    <Float speed={2} floatIntensity={1.2}>
      <mesh position={position} rotation={[0.4, 0.6, 0.2]}>
        <boxGeometry args={[0.55, 0.08, 0.9]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#05060B"]} />
      <fog attach="fog" args={["#05060B", 6, 18]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 2]} intensity={1.4} color="#38F8FF" />
      <pointLight position={[-4, -2, 1]} intensity={0.9} color="#8A5CFF" />
      <Stars radius={60} depth={40} count={1800} factor={3} saturation={0} fade speed={0.6} />
      <NeuralNodes />
      <Links />
      <Globe />
      <HoloChip position={[-2.6, 1.1, 0.5]} color="#38F8FF" />
      <HoloChip position={[-1.8, -1.2, 1]} color="#F23FFF" />
      <HoloChip position={[0.4, 1.6, -0.5]} color="#00F5A0" />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05060B]/30 via-transparent to-[#05060B]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#05060B_80%)]" />
    </div>
  );
}
