"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { ShaderMaterial, SRGBColorSpace, type Group, type SkinnedMesh } from "three";
import type { VoicePhase } from "@/store/ui-store";
import { avatarController, avatarPose, stepAvatar } from "./avatar-controller";

export type TushantAvatarProps = {
  state: VoicePhase;
  audioLevel: number;
  speaking: boolean;
};

/**
 * Isolated avatar stage.
 * The live asset is a photorealistic cutout of Tushant's photograph, presented
 * as a chest-up bust. Set TUSHANT_MODEL_URL to a rigged .glb with viseme,
 * mouthOpen, and blink morphs to replace the portrait without changing the hero.
 */
const TUSHANT_MODEL_URL: string | null = null;
const PORTRAIT_URL = "/avatar/tushant-bust.png";

const portraitVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 displaced = position;
    displaced.z += cos((uv.x - 0.5) * 3.14159) * 0.07;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const portraitFragment = /* glsl */ `
  uniform sampler2D map;
  uniform float mouthOpen;
  uniform float blink;
  varying vec2 vUv;

  float eyeDisk(vec2 uv, vec2 center) {
    vec2 delta = (uv - center) * vec2(1.05, 2.15);
    return smoothstep(0.046, 0.014, length(delta));
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouth = vec2(0.49, 0.455);
    float mouthMask = smoothstep(0.16, 0.02, length((uv - mouth) * vec2(1.7, 3.1)));
    uv.y -= mouthOpen * 0.024 * mouthMask;
    vec4 color = texture2D(map, uv);
    float gap = smoothstep(0.07, 0.0, length((vUv - mouth) * vec2(2.6, 5.2)));
    color.rgb = mix(color.rgb, color.rgb * vec3(0.45, 0.32, 0.32), mouthOpen * gap);
    float eyes = max(eyeDisk(uv, vec2(0.385, 0.635)), eyeDisk(uv, vec2(0.585, 0.632)));
    vec3 lid = color.rgb * vec3(0.42, 0.32, 0.28);
    color.rgb = mix(color.rgb, lid, blink * eyes);
    if (color.a < 0.04) discard;
    gl_FragColor = color;
  }
`;

export function TushantAvatar({ state, audioLevel, speaking }: TushantAvatarProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const probe = document.createElement("canvas");
      setWebgl(Boolean(probe.getContext("webgl2") || probe.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className="h-full w-full"
      data-avatar-state={state}
      data-avatar-model={TUSHANT_MODEL_URL ? "glb" : webgl ? "portrait" : "image"}
    >
      {webgl ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, -0.08, 2.65], fov: 26 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          frameloop={visible && !reduceMotion ? "always" : "demand"}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <PoseBridge state={state} audioLevel={audioLevel} speaking={speaking} host={frame} />
          <ambientLight intensity={0.4} />
          <Suspense fallback={null}>
            {TUSHANT_MODEL_URL ? <RiggedAvatar url={TUSHANT_MODEL_URL} /> : <PortraitBust />}
          </Suspense>
        </Canvas>
      ) : (
        <PortraitFallback state={state} audioLevel={audioLevel} speaking={speaking} active={visible && !reduceMotion} />
      )}
    </div>
  );
}

function PoseBridge({
  state,
  audioLevel,
  speaking,
  host,
}: TushantAvatarProps & { host: RefObject<HTMLDivElement | null> }) {
  const level = useRef(audioLevel);
  level.current = audioLevel;
  useEffect(() => {
    avatarController.setState(state);
  }, [state]);
  useFrame(({ camera, clock }, dt) => {
    camera.lookAt(0, -0.16, 0);
    if (!speaking) avatarController.setAudioLevel(level.current);
    stepAvatar(Math.min(0.05, dt), clock.elapsedTime);
    const node = host.current;
    if (node) {
      node.dataset.mouth = avatarPose.mouthOpen.toFixed(2);
      node.dataset.blink = avatarPose.blink.toFixed(2);
    }
  });
  return null;
}

function PortraitBust() {
  const texture = useTexture(PORTRAIT_URL);
  const bust = useRef<Group>(null);
  const material = useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return new ShaderMaterial({
      uniforms: {
        map: { value: texture },
        mouthOpen: { value: 0 },
        blink: { value: 0 },
      },
      vertexShader: portraitVertex,
      fragmentShader: portraitFragment,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
  }, [texture]);

  useFrame(() => {
    material.uniforms.mouthOpen.value = avatarPose.mouthOpen;
    material.uniforms.blink.value = avatarPose.blink;
    if (!bust.current) return;
    bust.current.position.y = -0.22 + avatarPose.breath;
    bust.current.rotation.y = -0.16 + avatarPose.headY;
    bust.current.rotation.x = avatarPose.headX * 0.45;
  });

  return (
    <group ref={bust}>
      <mesh position={[0, -0.05, 0]} material={material}>
        <planeGeometry args={[1.42, 1.42, 24, 24]} />
      </mesh>
    </group>
  );
}

function PortraitFallback({ active, state, audioLevel, speaking }: TushantAvatarProps & { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const level = useRef(audioLevel);
  level.current = audioLevel;

  useEffect(() => {
    avatarController.setState(state);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = new Image();
    image.src = PORTRAIT_URL;
    let frame = 0;
    let running = true;

    const draw = (time: number) => {
      if (!running) return;
      if (!speaking) avatarController.setAudioLevel(level.current);
      if (active) stepAvatar(1 / 60, time / 1000);
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);
      if (image.complete && image.naturalWidth) {
        const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const x = (width - drawWidth) / 2 + avatarPose.headY * 18;
        const y = height - drawHeight + 8 + avatarPose.breath * 40;
        context.drawImage(image, x, y, drawWidth, drawHeight);
        const host = canvas.parentElement;
        if (host) {
          host.dataset.mouth = avatarPose.mouthOpen.toFixed(2);
          host.dataset.blink = avatarPose.blink.toFixed(2);
        }
      }
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };
  }, [active, speaking]);

  return <canvas ref={canvasRef} width={768} height={768} className="h-full w-full" aria-label="Tushant Sharma" />;
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
