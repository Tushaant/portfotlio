"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { cn } from "@/lib/utils";

export function SkillsSection() {
  const [active, setActive] = useState(cms.skills[0].id);
  const skill = cms.skills.find((s) => s.id === active)!;

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
          projects, tools and a concrete example. No progress bars.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="skill-card relative mx-auto aspect-square w-full max-w-lg rounded-3xl p-4">
            <div className="absolute inset-4 rounded-full border border-amber-400/20" />
            <div className="absolute inset-12 rounded-full border border-amber-400/15" />
            <div className="absolute inset-20 rounded-full border border-amber-400/10" />
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#FFFFFF] to-[#00B34A] opacity-80 blur-sm" />
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#121212] display text-[10px] text-[#FFFFFF] shadow-lg">
              CORE
            </div>
            {cms.skills.map((s, i) => {
              const angle = (i / cms.skills.length) * Math.PI * 2 - Math.PI / 2;
              const radius = s.tier === "CORE" ? 38 : 46;
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-semibold transition",
                    active === s.id
                      ? "h-16 w-16 border-[#00D95A] bg-[#1A1A1A] text-[#FFFFFF] shadow-[0_0_30px_rgba(0,217,90,0.45)]"
                      : "h-12 w-12 border-[#00D95A]/40 bg-[#121212]/95 text-[#FFFFFF]/90 hover:scale-110",
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  whileHover={{ scale: 1.15 }}
                  title={s.name}
                >
                  {s.name.split(" ")[0].slice(0, 4)}
                </motion.button>
              );
            })}
          </div>

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
