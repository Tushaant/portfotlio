"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/store/ui-store";

const MotionScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.MotionScene),
  { ssr: false, loading: () => null },
);

/**
 * Site-wide living background — same motion language as the hero banner,
 * fixed behind all content, theme-aware (cyber dark / white-gold light).
 */
export function GlobalMotionBackground() {
  const theme = useUIStore((s) => s.hologramMode);
  const light = theme === "light";

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      aria-hidden
    >
      {/* 3D neural / globe layer */}
      <div className="absolute inset-0 opacity-90">
        <MotionScene />
      </div>

      {/* Animated aurora / gradient wash */}
      <div
        className={`absolute inset-0 aurora-layer ${light ? "aurora-gold" : "aurora-cyber"}`}
      />

      {/* Soft floating orbs */}
      <div className={`orb orb-a ${light ? "orb-gold" : "orb-cyan"}`} />
      <div className={`orb orb-b ${light ? "orb-champagne" : "orb-purple"}`} />
      <div className={`orb orb-c ${light ? "orb-shine" : "orb-blue"}`} />

      {/* Data-stream scan */}
      <div className={`data-veil ${light ? "data-veil-gold" : "data-veil-cyber"}`} />

      {/* Grid */}
      <div className={`absolute inset-0 grid-bg ${light ? "grid-gold" : ""}`} />

      {/* Readability vignette */}
      <div
        className={`absolute inset-0 ${
          light
            ? "bg-[radial-gradient(ellipse_at_center,rgba(255,249,240,0.15)_0%,rgba(255,249,240,0.72)_70%,rgba(255,244,224,0.92)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(5,6,11,0.55)_55%,rgba(5,6,11,0.88)_100%)]"
        }`}
      />
    </div>
  );
}
