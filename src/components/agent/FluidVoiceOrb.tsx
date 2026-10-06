"use client";

import { useEffect, useRef } from "react";
import { resolveOrbState, VOICE_ORB_STATES, type VoiceOrbPalette } from "@/lib/voice-orb-states";

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = hex.replace("#", "");
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function rgba(c: Rgb, alpha: number) {
  return `rgba(${c[0].toFixed(0)}, ${c[1].toFixed(0)}, ${c[2].toFixed(0)}, ${alpha})`;
}

function samplePalette(colors: Rgb[], turn: number): Rgb {
  const wrapped = ((turn % 1) + 1) % 1;
  const scaled = wrapped * colors.length;
  const index = Math.floor(scaled) % colors.length;
  const next = (index + 1) % colors.length;
  return mixRgb(colors[index], colors[next], scaled - Math.floor(scaled));
}

const SIZE = 220;
const POINTS = 140;

export function FluidVoiceOrb({
  state,
  level = 0,
  label,
}: {
  state: string;
  level?: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const levelRef = useRef(level);
  stateRef.current = state;
  levelRef.current = level;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frame = 0;
    let last = performance.now();
    let time = 0;
    let smoothDrive = 0;
    const visual = resolveOrbState(stateRef.current);
    let colors = VOICE_ORB_STATES[visual].colors.map(hexToRgb);
    let amplitude = VOICE_ORB_STATES[visual].amplitude;
    let speed = VOICE_ORB_STATES[visual].speed;
    let glow = VOICE_ORB_STATES[visual].glow;
    let pulse = VOICE_ORB_STATES[visual].pulse;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const targetKey = resolveOrbState(stateRef.current);
      const target: VoiceOrbPalette = VOICE_ORB_STATES[targetKey];
      const blend = 1 - Math.exp(-dt / 0.24);
      const targetColors = target.colors.map(hexToRgb);
      colors = colors.map((color, index) => mixRgb(color, targetColors[index], blend));
      amplitude = mix(amplitude, target.amplitude, blend);
      speed = mix(speed, reduce ? target.speed * 0.35 : target.speed, blend);
      glow = mix(glow, target.glow, blend);
      pulse = mix(pulse, target.pulse, blend);

      const mic = targetKey === "listening" ? levelRef.current : 0;
      const speech =
        targetKey === "speaking"
          ? 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(time * 2.4)) * (0.55 + 0.45 * Math.sin(time * 5.3 + 1.2))
          : 0;
      const driveTarget = targetKey === "speaking" ? speech : targetKey === "listening" ? mic * 0.55 : 0;
      smoothDrive = smoothDrive + (driveTarget - smoothDrive) * (1 - Math.exp(-dt / 0.18));
      time += dt * (reduce ? 0.35 : speed * 1.35);

      const breathe = 1 + Math.sin(time * (0.7 + pulse)) * pulse * 0.045;
      const energy = (0.72 + smoothDrive * 0.85) * breathe;
      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const base = 68;

      const point = (turn: number, layer: number) => {
        const angle = turn * Math.PI * 2;
        const wobble =
          Math.sin(angle * 2 + time * 1.15 + layer) * 0.52 +
          Math.sin(angle * 3 - time * 0.72 + layer * 1.7) * 0.34 +
          Math.sin(angle * 5 + time * 1.55 + layer * 0.4) * 0.2 +
          Math.sin(angle * 7 - time * 0.48) * 0.1;
        const radius = base * breathe + wobble * base * amplitude * energy * 1.45;
        return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
      };

      const trace = (layer: number) => {
        ctx.beginPath();
        let prev = point(0, layer);
        ctx.moveTo(prev[0], prev[1]);
        for (let i = 1; i <= POINTS; i += 1) {
          const curr = point(i / POINTS, layer);
          const mx = (prev[0] + curr[0]) / 2;
          const my = (prev[1] + curr[1]) / 2;
          ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
          prev = curr;
        }
        ctx.closePath();
      };

      ctx.clearRect(0, 0, SIZE, SIZE);
      const glowColor = colors[0];
      const haze = ctx.createRadialGradient(cx, cy, 18, cx, cy, 108);
      haze.addColorStop(0, rgba(glowColor, 0.04 + glow * 0.07));
      haze.addColorStop(0.5, rgba(colors[2], glow * 0.14));
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.arc(cx, cy, 104, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 18 + smoothDrive * 8;
      ctx.strokeStyle = rgba(glowColor, 0.45);
      ctx.shadowColor = rgba(colors[1], 0.95);
      ctx.shadowBlur = 26 + glow * 10;
      ctx.globalAlpha = 0.28 + glow * 0.4;
      trace(0.35);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 5.5 + smoothDrive * 3.2;
      ctx.globalAlpha = 0.96;
      for (let i = 0; i < POINTS; i += 1) {
        const t0 = i / POINTS;
        const [x0, y0] = point(t0, 0);
        const [x1, y1] = point((i + 1) / POINTS, 0);
        const color = samplePalette(colors, t0 + time * 0.04);
        ctx.strokeStyle = rgba(color, 1);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.42 + glow * 0.2;
      ctx.strokeStyle = rgba(colors[3], 0.9);
      trace(1.15);
      ctx.stroke();
      ctx.restore();

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fluid-orb"
      role="img"
      aria-label={label}
      data-voice-state={resolveOrbState(state)}
    />
  );
}
