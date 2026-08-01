"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees */
  maxTilt?: number;
  /** How far the card pushes back on hover (px) */
  pushBack?: number;
  /** Perspective distance */
  perspective?: number;
  /** Soft glare highlight that follows the cursor */
  glare?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  as?: "div" | "button";
};

/**
 * 3D interactive card: the side under the cursor sinks backward
 * (into the screen) so the card appears to tilt away from the pointer.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 12,
  pushBack = 28,
  perspective = 900,
  glare = true,
  style,
  onClick,
  as = "div",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const hover = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 180, damping: 18, mass: 0.4 });
  const sh = useSpring(hover, { stiffness: 220, damping: 22 });

  // Cursor on top → top edge sinks back (positive rotateX in CSS)
  // Cursor on right → right edge sinks back (positive rotateY)
  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const z = useTransform(sh, [0, 1], [0, -pushBack]);
  const scale = useTransform(sh, [0, 1], [1, 1.02]);
  const glareX = useTransform(sx, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(sy, [-0.5, 0.5], [0, 100]);
  const glareOpacity = useTransform(sh, [0, 1], [0, 0.45]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, transparent 55%)`;
  const shadowY = useTransform(sh, [0, 1], [8, 32]);
  const shadowBlur = useTransform(sh, [0, 1], [20, 48]);
  const shadowAlpha = useTransform(sh, [0, 1], [0.28, 0.55]);
  const shadow = useMotionTemplate`0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})`;

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const onEnter = () => hover.set(1);
  const onLeave = () => {
    hover.set(0);
    mx.set(0);
    my.set(0);
  };

  const Comp = as === "button" ? motion.button : motion.div;

  return (
    <div style={{ perspective }} className="[transform-style:preserve-3d]">
      <Comp
        ref={ref as never}
        type={as === "button" ? "button" : undefined}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          rotateX,
          rotateY,
          z,
          scale,
          boxShadow: shadow,
          transformStyle: "preserve-3d",
          ...style,
        }}
        className={cn(
          "relative will-change-transform [transform-style:preserve-3d]",
          className,
        )}
      >
        <div className="relative h-full [transform:translateZ(0)]">{children}</div>
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-soft-light"
            style={{ background: glareBg, opacity: glareOpacity }}
          />
        )}
      </Comp>
    </div>
  );
}
