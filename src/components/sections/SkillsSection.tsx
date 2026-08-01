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
          <div className="relative mx-auto aspect-square w-full max-w-lg">
            <div className="absolute inset-0 rounded-full border border-cyan-400/10" />
            <div className="absolute inset-8 rounded-full border border-purple-400/10" />
            <div className="absolute inset-16 rounded-full border border-blue-400/10" />
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 opacity-80 blur-sm" />
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#05060B] display text-[10px] text-cyan-200">
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
                    "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] transition",
                    active === s.id
                      ? "h-16 w-16 border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_30px_rgba(56,248,255,0.5)]"
                      : "h-12 w-12 border-white/20 bg-white/5 text-slate-300 hover:scale-110",
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
            className="glass rounded-3xl p-6 md:p-8"
          >
            <p className="font-mono text-[10px] tracking-widest text-slate-500">
              PLANET READOUT · {skill.tier}
            </p>
            <h3 className="display mt-2 text-3xl neon-text">{skill.name}</h3>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-cyan-300/70">
                  Experience
                </dt>
                <dd className="mt-1 text-slate-300">{skill.experience}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-cyan-300/70">
                  Projects
                </dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {skill.projects.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                    >
                      {p}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-cyan-300/70">
                  Tools
                </dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {skill.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-purple-500/15 px-2.5 py-1 text-xs text-purple-200"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-cyan-300/70">
                  Example
                </dt>
                <dd className="mt-1 text-slate-300">{skill.example}</dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
