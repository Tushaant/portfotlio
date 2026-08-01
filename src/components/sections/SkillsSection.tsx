"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { cms } from "@/lib/cms";
import { cn } from "@/lib/utils";

type Skill = (typeof cms.skills)[number];

type PlanetTheme = {
  from: string;
  to: string;
  glow: string;
  ring?: string;
};

const PLANET_THEMES: PlanetTheme[] = [
  { from: "#1a8f4a", to: "#063d22", glow: "rgba(0,217,90,0.5)", ring: "rgba(0,217,90,0.35)" },
  { from: "#c9a227", to: "#6b4e08", glow: "rgba(201,162,39,0.45)", ring: "rgba(201,162,39,0.35)" },
  { from: "#2a9d8f", to: "#0d3d3a", glow: "rgba(42,157,143,0.45)" },
  { from: "#e07a3d", to: "#6b2e12", glow: "rgba(224,122,61,0.45)" },
  { from: "#4a90d9", to: "#163a5f", glow: "rgba(74,144,217,0.45)", ring: "rgba(120,180,255,0.3)" },
  { from: "#b85c38", to: "#4a2314", glow: "rgba(184,92,56,0.45)" },
  { from: "#7eb8a2", to: "#1f4a3c", glow: "rgba(126,184,162,0.45)" },
  { from: "#d4a574", to: "#5c3d22", glow: "rgba(212,165,116,0.45)" },
  { from: "#5b8c5a", to: "#1e3a1d", glow: "rgba(91,140,90,0.45)" },
  { from: "#3d8bfd", to: "#12325f", glow: "rgba(61,139,253,0.45)" },
  { from: "#d97706", to: "#5c2e05", glow: "rgba(217,119,6,0.45)" },
  { from: "#64748b", to: "#1e293b", glow: "rgba(100,116,139,0.4)" },
];

function shortName(name: string) {
  // Prefer readable 1–2 word labels for the badge under the planet
  const cleaned = name.replace(/\s*&\s*/g, " & ").trim();
  if (cleaned.length <= 18) return cleaned;
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    const two = `${parts[0]} ${parts[1]}`;
    if (two.length <= 20) return two;
  }
  return `${parts[0]}…`;
}

function SkillPlanet({
  skill,
  theme,
  active,
  size,
  onSelect,
}: {
  skill: Skill;
  theme: PlanetTheme;
  active: boolean;
  size: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col items-center gap-2"
      style={{ width: Math.max(size + 24, 96) }}
      title={skill.name}
      aria-pressed={active}
    >
      <motion.span
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 32% 28%, ${theme.from} 0%, ${theme.to} 70%, #050505 100%)`,
          boxShadow: active
            ? `0 0 32px ${theme.glow}, 0 0 0 2px var(--gold), inset -10px -8px 16px rgba(0,0,0,0.45), inset 6px 4px 12px rgba(255,255,255,0.2)`
            : `0 0 18px ${theme.glow}, inset -8px -6px 14px rgba(0,0,0,0.4), inset 5px 3px 10px rgba(255,255,255,0.15)`,
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.96 }}
        animate={active ? { scale: 1.08 } : { scale: 1 }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[10%] rounded-full opacity-55"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55) 0%, transparent 45%)",
          }}
        />
        {theme.ring && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border"
            style={{
              width: size * 1.4,
              height: size * 0.4,
              borderColor: theme.ring,
              transform: "translate(-50%, -50%) rotateX(68deg)",
              opacity: active ? 0.9 : 0.55,
            }}
          />
        )}
        <span className="relative z-[1] display text-[11px] font-bold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
          {skill.name
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 3)
            .toUpperCase()}
        </span>
      </motion.span>

      {/* Label lives outside the circle so full words stay readable */}
      <span
        className={cn(
          "max-w-[110px] rounded-full border px-2.5 py-1 text-center text-[10px] font-semibold leading-tight transition",
          active
            ? "border-[var(--gold)] bg-[var(--surface-2)] text-[var(--text)] shadow-[0_0_16px_rgba(var(--accent-rgb),0.35)]"
            : "border-[color:rgba(var(--accent-rgb),0.3)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-[var(--text)] group-hover:border-[var(--gold)]",
        )}
      >
        {shortName(skill.name)}
      </span>
    </button>
  );
}

export function SkillsSection() {
  const [active, setActive] = useState(cms.skills[0].id);
  const skill = cms.skills.find((s) => s.id === active)!;
  const reduceMotion = useReducedMotion();

  const { rings } = useMemo(() => {
    const coreSkills = cms.skills.filter((s) => s.tier === "CORE");
    const supportSkills = cms.skills.filter((s) => s.tier !== "CORE");
    const mid = Math.ceil(coreSkills.length / 2);
    const built = [
      { skills: coreSkills.slice(0, mid), diameter: 44, period: 42, size: 58 },
      { skills: coreSkills.slice(mid), diameter: 66, period: 56, size: 54 },
      {
        skills: supportSkills,
        diameter: 84,
        period: 78,
        size: 48,
      },
    ].filter((r) => r.skills.length > 0);
    return { rings: built };
  }, []);

  return (
    <section id="skills" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
          06 · AI SKILL GALAXY
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Every skill is a <span className="neon-text">planet</span>
        </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Orbit the galaxy and select a planet to expand its experience,
          projects, tools and a concrete example. Labels sit under each world so
          names stay readable.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Solar system stage — desktop/tablet */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-lg sm:block">
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-[color:rgba(var(--accent-rgb),0.25)] bg-[radial-gradient(ellipse_at_center,var(--surface)_0%,var(--bg)_72%)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(1px 1px at 18% 28%, rgba(255,255,255,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 72% 18%, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(1px 1px at 42% 78%, rgba(255,255,255,0.35) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 86% 58%, rgba(255,255,255,0.45) 50%, transparent 51%)",
                }}
              />

              {rings.map((ring, i) => (
                <div
                  key={`orbit-ring-${i}`}
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
                  style={{
                    width: `${ring.diameter}%`,
                    height: `${ring.diameter}%`,
                    borderColor: "rgba(var(--accent-rgb),0.22)",
                  }}
                />
              ))}

              <div className="absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--gold) 85%, white) 0%, var(--gold) 45%, color-mix(in srgb, var(--gold) 25%, black) 100%)",
                    boxShadow:
                      "0 0 36px rgba(var(--accent-rgb),0.55), 0 0 70px rgba(var(--accent-rgb),0.25)",
                  }}
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.06, 1], opacity: [0.95, 1, 0.95] }
                  }
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative z-[1] text-center">
                  <p className="font-mono text-[8px] tracking-[0.22em] text-black/65">
                    CORE
                  </p>
                  <p className="display text-[11px] font-bold text-[#14100a]">
                    Skill OS
                  </p>
                </div>
              </div>

              {rings.map((ring, ri) => (
                <motion.div
                  key={`spin-${ri}`}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${ring.diameter}%`,
                    height: `${ring.diameter}%`,
                  }}
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{
                    duration: ring.period,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {ring.skills.map((s, pi) => {
                    const angle = (360 / ring.skills.length) * pi;
                    const theme =
                      PLANET_THEMES[
                        cms.skills.findIndex((x) => x.id === s.id) %
                          PLANET_THEMES.length
                      ];
                    const slotW = Math.max(ring.size + 24, 100);
                    return (
                      <div
                        key={s.id}
                        className="absolute inset-0"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className="absolute left-1/2 top-0"
                          style={{
                            marginLeft: -slotW / 2,
                            marginTop: -ring.size / 2,
                          }}
                        >
                          <motion.div
                            animate={
                              reduceMotion ? undefined : { rotate: -360 }
                            }
                            transition={{
                              duration: ring.period,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <SkillPlanet
                              skill={s}
                              theme={theme}
                              active={active === s.id}
                              size={ring.size}
                              onSelect={() => setActive(s.id)}
                            />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile planet picker (same grid column as galaxy) */}
          <div className="grid grid-cols-3 gap-4 sm:hidden">
            {cms.skills.map((s, i) => (
              <div key={`list-${s.id}`} className="flex justify-center">
                <SkillPlanet
                  skill={s}
                  theme={PLANET_THEMES[i % PLANET_THEMES.length]}
                  active={active === s.id}
                  size={58}
                  onSelect={() => setActive(s.id)}
                />
              </div>
            ))}
          </div>

          {/* Readout panel */}
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="skill-card rounded-3xl p-6 md:p-8"
          >
            <p className="font-mono text-[10px] tracking-widest text-[var(--muted)]">
              PLANET READOUT · {skill.tier}
            </p>
            <h3 className="display mt-2 text-3xl text-[var(--text)]">
              <span className="neon-text">{skill.name}</span>
            </h3>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="metric-chip rounded-2xl p-4">
                <dt className="text-xs uppercase tracking-wider text-[var(--gold)]">
                  Experience
                </dt>
                <dd className="mt-1 font-medium text-[var(--text)]">
                  {skill.experience}
                </dd>
              </div>
              <div className="metric-chip rounded-2xl p-4">
                <dt className="text-xs uppercase tracking-wider text-[var(--gold)]">
                  Projects
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {skill.projects.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--text)]"
                    >
                      {p}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="metric-chip rounded-2xl p-4">
                <dt className="text-xs uppercase tracking-wider text-[var(--gold)]">
                  Tools
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {skill.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--text)]"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="metric-chip rounded-2xl p-4">
                <dt className="text-xs uppercase tracking-wider text-[var(--gold)]">
                  Example
                </dt>
                <dd className="mt-1 font-medium leading-relaxed text-[var(--text)]">
                  {skill.example}
                </dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
