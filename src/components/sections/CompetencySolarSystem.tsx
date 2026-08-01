"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type PlanetTheme = {
  from: string;
  to: string;
  glow: string;
  ring?: string;
};

const PLANET_THEMES: PlanetTheme[] = [
  {
    from: "#1a8f4a",
    to: "#063d22",
    glow: "rgba(0,217,90,0.45)",
    ring: "rgba(0,217,90,0.35)",
  },
  {
    from: "#c9a227",
    to: "#6b4e08",
    glow: "rgba(201,162,39,0.4)",
    ring: "rgba(201,162,39,0.35)",
  },
  {
    from: "#2a9d8f",
    to: "#0d3d3a",
    glow: "rgba(42,157,143,0.4)",
  },
  {
    from: "#e07a3d",
    to: "#6b2e12",
    glow: "rgba(224,122,61,0.4)",
  },
  {
    from: "#4a90d9",
    to: "#163a5f",
    glow: "rgba(74,144,217,0.4)",
    ring: "rgba(120,180,255,0.3)",
  },
  {
    from: "#b85c38",
    to: "#4a2314",
    glow: "rgba(184,92,56,0.4)",
  },
  {
    from: "#7eb8a2",
    to: "#1f4a3c",
    glow: "rgba(126,184,162,0.4)",
  },
  {
    from: "#d4a574",
    to: "#5c3d22",
    glow: "rgba(212,165,116,0.4)",
  },
];

function shortLabel(name: string) {
  const base = name.split("(")[0].trim();
  if (base.length <= 16) return base;
  const words = base.split(/\s+/);
  if (words.length >= 2 && words.slice(0, 2).join(" ").length <= 16) {
    return words.slice(0, 2).join(" ");
  }
  return `${base.slice(0, 14)}…`;
}

function distributeOrbits(count: number) {
  const ringCaps = [4, 6, 8, 8, 10];
  const rings: number[][] = [];
  let i = 0;
  for (const cap of ringCaps) {
    if (i >= count) break;
    const slice: number[] = [];
    while (slice.length < cap && i < count) {
      slice.push(i);
      i += 1;
    }
    rings.push(slice);
  }
  while (i < count) {
    rings[rings.length - 1].push(i);
    i += 1;
  }
  return rings;
}

function Planet({
  name,
  size,
  theme,
  paused,
}: {
  name: string;
  size: number;
  theme: PlanetTheme;
  paused?: boolean;
}) {
  const [hot, setHot] = useState(false);
  const label = shortLabel(name);

  return (
    <motion.div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, ${theme.from} 0%, ${theme.to} 72%, #050505 100%)`,
        boxShadow: hot
          ? `0 0 28px ${theme.glow}, inset -10px -8px 18px rgba(0,0,0,0.45), inset 6px 4px 12px rgba(255,255,255,0.18)`
          : `0 0 16px ${theme.glow}, inset -8px -6px 14px rgba(0,0,0,0.4), inset 5px 3px 10px rgba(255,255,255,0.14)`,
      }}
      animate={
        paused
          ? undefined
          : {
              rotate: [0, 8, -6, 0],
            }
      }
      transition={{ duration: 7 + (size % 5), repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.18, zIndex: 40 }}
      onHoverStart={() => setHot(true)}
      onHoverEnd={() => setHot(false)}
      title={name}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[8%] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55) 0%, transparent 42%)",
        }}
      />
      {theme.ring && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: size * 1.35,
            height: size * 0.42,
            borderColor: theme.ring,
            transform: "translate(-50%, -50%) rotateX(68deg)",
            opacity: 0.7,
          }}
        />
      )}
      <span
        className={cn(
          "relative z-[1] px-1.5 text-center font-mono font-semibold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
          size >= 78 ? "text-[10px]" : size >= 62 ? "text-[9px]" : "text-[8px]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "pointer-events-none absolute -bottom-9 left-1/2 z-50 w-max max-w-[200px] -translate-x-1/2 rounded-md border border-[color:rgba(var(--accent-rgb),0.35)] bg-[var(--surface)] px-2 py-1 text-[10px] leading-snug text-[var(--text)] shadow-lg transition",
          hot ? "opacity-100" : "opacity-0",
        )}
      >
        {name}
      </span>
    </motion.div>
  );
}

export function CompetencySolarSystem({
  competencies,
}: {
  competencies: string[];
}) {
  const reduceMotion = useReducedMotion();
  const rings = useMemo(
    () => distributeOrbits(competencies.length),
    [competencies.length],
  );

  // Orbit diameter as % of stage — keep inside frame so planets aren't clipped
  const orbitDiameters = [28, 44, 60, 74, 88];
  const periods = [32, 44, 58, 74, 96];
  const planetSizes = [78, 66, 56, 48, 42];

  return (
    <div className="relative mt-4">
      <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-[var(--gold)]">
        CORE COMPETENCY SYSTEM
      </p>
      <p className="mb-6 max-w-xl text-sm text-[var(--muted)]">
        Each planet is a core competency in orbit around the product operating
        core. Hover a world to read the full name.
      </p>

      <div className="relative mx-auto hidden w-full max-w-4xl sm:block">
        <div className="relative mx-auto aspect-square w-full max-w-[760px]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-[color:rgba(var(--accent-rgb),0.22)] bg-[radial-gradient(ellipse_at_center,var(--surface)_0%,var(--bg)_70%)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-45"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(1px 1px at 40% 75%, rgba(255,255,255,0.35) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 85% 60%, rgba(255,255,255,0.45) 50%, transparent 51%), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.3) 50%, transparent 51%), radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.25) 50%, transparent 51%)",
              }}
            />

            {rings.map((_, ri) => (
              <div
                key={`orbit-${ri}`}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
                style={{
                  width: `${orbitDiameters[ri]}%`,
                  height: `${orbitDiameters[ri]}%`,
                  borderColor: "rgba(var(--accent-rgb),0.2)",
                }}
              />
            ))}

            {/* sun */}
            <div className="absolute left-1/2 top-1/2 z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-32 md:w-32">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--gold) 85%, white) 0%, var(--gold) 45%, color-mix(in srgb, var(--gold) 30%, black) 100%)",
                  boxShadow:
                    "0 0 40px rgba(var(--accent-rgb),0.55), 0 0 80px rgba(var(--accent-rgb),0.25)",
                }}
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.06, 1], opacity: [0.95, 1, 0.95] }
                }
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative z-[1] px-2 text-center">
                <p className="font-mono text-[9px] tracking-[0.2em] text-black/65">
                  CORE
                </p>
                <p className="display text-xs font-bold leading-tight text-[#14100a] md:text-sm">
                  Product OS
                </p>
              </div>
            </div>

            {rings.map((indices, ri) => {
              const diameter = orbitDiameters[ri];
              const period = periods[ri];
              const size = planetSizes[ri];
              return (
                <motion.div
                  key={`ring-spin-${ri}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${diameter}%`,
                    height: `${diameter}%`,
                  }}
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{
                    duration: period,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {indices.map((ci, pi) => {
                    const angle = (360 / indices.length) * pi;
                    const name = competencies[ci];
                    const theme = PLANET_THEMES[ci % PLANET_THEMES.length];
                    return (
                      <div
                        key={name}
                        className="absolute inset-0"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className="absolute left-1/2 top-0"
                          style={{
                            marginLeft: -size / 2,
                            marginTop: -size / 2,
                          }}
                        >
                          <motion.div
                            animate={
                              reduceMotion ? undefined : { rotate: -360 }
                            }
                            transition={{
                              duration: period,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Planet
                              name={name}
                              size={size}
                              theme={theme}
                              paused={!!reduceMotion}
                            />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile constellation */}
      <div className="grid grid-cols-3 gap-3 sm:hidden">
        {competencies.map((name, i) => (
          <div key={name} className="flex justify-center py-1">
            <Planet
              name={name}
              size={78}
              theme={PLANET_THEMES[i % PLANET_THEMES.length]}
              paused
            />
          </div>
        ))}
      </div>
    </div>
  );
}
