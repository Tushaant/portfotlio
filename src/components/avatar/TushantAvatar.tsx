"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Group, Mesh, PointLight, SkinnedMesh } from "three";
import type { VoicePhase } from "@/store/ui-store";
import { avatarController, avatarPose, glowFor, stepAvatar } from "./avatar-controller";

export type TushantAvatarProps = {
  state: VoicePhase;
  audioLevel: number;
  speaking: boolean;
};

/**
 * Isolated avatar stage.
 * Set TUSHANT_MODEL_URL to "/avatar/tushant.glb" when a rigged model with
 * viseme or mouthOpen blendshapes is added. The same pose stream drives it.
 */
const TUSHANT_MODEL_URL: string | null = null;

export function TushantAvatar({ state, audioLevel, speaking }: TushantAvatarProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="h-full w-full" data-avatar-state={state} data-avatar-model={TUSHANT_MODEL_URL ? "glb" : "placeholder"}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.08, 1.85], fov: 26 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={visible && !reduceMotion ? "always" : "demand"}
      >
        <PoseBridge state={state} audioLevel={audioLevel} speaking={speaking} />
        <color attach="background" args={["#07070d"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[1.2, 1.8, 2.2]} intensity={1.5} color="#f7f4ff" />
        <RimLight />
        {TUSHANT_MODEL_URL ? <RiggedAvatar url={TUSHANT_MODEL_URL} /> : <PlaceholderBust />}
      </Canvas>
    </div>
  );
}

function PoseBridge({ state, audioLevel, speaking }: TushantAvatarProps) {
  const level = useRef(audioLevel);
  level.current = audioLevel;
  useEffect(() => {
    avatarController.setState(state);
  }, [state]);
  useFrame(({ camera, clock }, dt) => {
    camera.lookAt(0, 0.05, 0);
    if (!speaking) avatarController.setAudioLevel(level.current);
    stepAvatar(Math.min(0.05, dt), clock.elapsedTime);
  });
  return null;
}

function RimLight() {
  const light = useRef<PointLight>(null);
  useFrame(() => {
    if (!light.current) return;
    light.current.color.set(glowFor(avatarPose.state));
    light.current.intensity = 1.2 + avatarPose.drive * 3.4;
  });
  return <pointLight ref={light} position={[-0.8, 0.6, 1.6]} distance={5} />;
}

function PlaceholderBust() {
  const bust = useRef<Group>(null);
  const head = useRef<Group>(null);
  const mouth = useRef<Mesh>(null);
  const lids = useRef<Group>(null);

  useFrame(() => {
    if (bust.current) bust.current.position.y = -0.15 + avatarPose.breath;
    if (head.current) {
      head.current.rotation.x = avatarPose.headX;
      head.current.rotation.y = avatarPose.headY;
    }
    if (mouth.current) mouth.current.scale.y = 0.28 + avatarPose.mouthOpen * 1.6;
    if (lids.current) lids.current.scale.y = Math.max(0.15, 1 - avatarPose.blink);
  });

  return (
    <group ref={bust} position={[0, -0.15, 0]}>
      <mesh position={[0, -0.42, 0]}>
        <capsuleGeometry args={[0.48, 0.42, 8, 20]} />
        <meshStandardMaterial color="#1b2a4a" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.05, 0.02]}>
        <cylinderGeometry args={[0.1, 0.13, 0.16, 16]} />
        <meshStandardMaterial color="#e0c2a4" roughness={0.68} />
      </mesh>
      <group ref={head} position={[0, 0.28, 0.02]}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 24]} />
          <meshStandardMaterial color="#e4c6a8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, -0.02]} scale={[0.68, 0.3, 0.58]}>
          <sphereGeometry args={[0.3, 24, 16]} />
          <meshStandardMaterial color="#16110e" roughness={0.82} />
        </mesh>
        <mesh position={[-0.08, 0.02, 0.27]}>
          <sphereGeometry args={[0.032, 16, 12]} />
          <meshStandardMaterial color="#1c140f" roughness={0.25} />
        </mesh>
        <mesh position={[0.08, 0.02, 0.27]}>
          <sphereGeometry args={[0.032, 16, 12]} />
          <meshStandardMaterial color="#1c140f" roughness={0.25} />
        </mesh>
        <mesh position={[-0.08, 0.07, 0.24]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.07, 0.012, 0.01]} />
          <meshStandardMaterial color="#2a211c" />
        </mesh>
        <mesh position={[0.08, 0.07, 0.24]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.07, 0.012, 0.01]} />
          <meshStandardMaterial color="#2a211c" />
        </mesh>
        <mesh position={[0, -0.02, 0.28]} rotation={[1.2, 0, 0]}>
          <coneGeometry args={[0.028, 0.07, 10]} />
          <meshStandardMaterial color="#d2b193" roughness={0.7} />
        </mesh>
        <group ref={lids} position={[0, 0.055, 0.26]}>
          <mesh position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.07, 0.012, 0.012]} />
            <meshStandardMaterial color="#d2b193" />
          </mesh>
          <mesh position={[0.09, 0, 0]}>
            <boxGeometry args={[0.07, 0.012, 0.012]} />
            <meshStandardMaterial color="#d2b193" />
          </mesh>
        </group>
        <mesh ref={mouth} position={[0, -0.11, 0.26]} scale={[1, 0.28, 0.45]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshStandardMaterial color="#7a3e3e" roughness={0.48} />
        </mesh>
      </group>
    </group>
  );
}

function RiggedAvatar({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => scene.clone(true), [scene]);
  const targets = useMemo(() => collectMorphs(root), [root]);

  useFrame(() => {
    const open = avatarPose.mouthOpen;
    const blink = avatarPose.blink;
    const active = avatarPose.viseme.toLowerCase();
    for (const item of targets) {
      const influences = item.mesh.morphTargetInfluences;
      if (!influences) continue;
      if (item.kind === "blink") influences[item.index] = blink;
      else if (item.kind === "mouth") influences[item.index] = open;
      else influences[item.index] = item.name.endsWith(active) ? open : influences[item.index] * 0.82;
    }
  });

  return (
    <group position={[0, -1.15, 0]} rotation={[0, avatarPose.headY, 0]} scale={1.15}>
      <primitive object={root} />
    </group>
  );
}

type MorphKind = "mouth" | "blink" | "viseme";

function collectMorphs(root: Group) {
  const found: { mesh: SkinnedMesh; index: number; kind: MorphKind; name: string }[] = [];
  root.traverse((node) => {
    const mesh = node as SkinnedMesh;
    const dict = mesh.morphTargetDictionary;
    if (!dict || !mesh.morphTargetInfluences) return;
    for (const [name, index] of Object.entries(dict)) {
      const key = name.toLowerCase();
      if (key.includes("blink")) found.push({ mesh, index, kind: "blink", name: key });
      else if (key.includes("mouthopen") || key.includes("jawopen") || key.endsWith("_aa")) {
        found.push({ mesh, index, kind: "mouth", name: key });
      } else if (key.includes("viseme") || key.startsWith("vrc.v_")) {
        found.push({ mesh, index, kind: "viseme", name: key });
      }
    }
  });
  return found;
}
