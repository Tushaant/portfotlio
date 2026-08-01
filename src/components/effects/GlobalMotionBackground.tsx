"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/store/ui-store";

const MotionScene = dynamic(
 () => import("@/components/three/HeroScene").then((m) => m.MotionScene),
 { ssr: false, loading: () => null },
);

/**
 * Site-wide neural-brain background.
 * Dark: amber/gold organic neural web on black (reference image).
 * Light: white + metallic gold circuit neural star with AI core.
 */
export function GlobalMotionBackground() {
 const theme = useUIStore((s) => s.hologramMode);
 const light = theme === "light";

 return (
 <div
 className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
 aria-hidden
 >
 <div className="absolute inset-0 opacity-[0.92]">
 <MotionScene />
 </div>

 <div
 className={`absolute inset-0 aurora-layer ${light ? "aurora-gold" : "aurora-amber"}`}
 />

 <div className={`orb orb-a ${light ? "orb-champagne" : "orb-amber"}`} />
 <div className={`orb orb-b ${light ? "orb-gold" : "orb-ember"}`} />
 <div className={`orb orb-c ${light ? "orb-shine" : "orb-hot"}`} />

 <div className={`data-veil ${light ? "data-veil-gold" : "data-veil-amber"}`} />

 <div className={`absolute inset-0 grid-bg ${light ? "grid-gold" : "grid-amber"}`} />

 {/* Soft vignette for readability - keeps neural brain visible */}
 <div
 className={`absolute inset-0 ${
 light
 ? "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.55)_62%,rgba(255,255,255,0.88)_100%)]"
 : "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_50%,rgba(0,0,0,0.82)_100%)]"
 }`}
 />
 </div>
 );
}
