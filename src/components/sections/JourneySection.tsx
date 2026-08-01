"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { cn } from "@/lib/utils";

export function JourneySection() {
  const [active, setActive] = useState(cms.experience[0].id);
  const job = cms.experience.find((e) => e.id === active)!;

  return (
    <section id="journey" className="relative scroll-mt-24 py-24 md:py-32">
      <div id="timeline" className="absolute -top-24" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
          02 · CAREER JOURNEY
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Six stations.{" "}
          <span className="neon-text">One trajectory.</span>
        </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Select a station to open its mission log — responsibilities, impact,
          metrics, technologies and lessons learned.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400 via-purple-500 to-transparent" />
            <ul className="space-y-3">
              {cms.experience.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setActive(e.id)}
                    className={cn(
                      "relative w-full rounded-2xl pl-10 pr-3 py-3 text-left transition",
                      active === e.id
                        ? "glass shadow-[0_0_30px_rgba(56,248,255,0.15)]"
                        : "hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2",
                        active === e.id
                          ? "border-cyan-300 bg-cyan-300 shadow-[0_0_16px_#38F8FF]"
                          : "border-slate-600 bg-[#05060B]",
                      )}
                    />
                    <p className="font-mono text-[10px] text-slate-500">
                      {e.period}
                      {e.active ? " · ACTIVE" : ""}
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                      {e.company}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="glass rounded-3xl p-6 md:p-8"
            >
              <p className="font-mono text-xs text-cyan-300/80">{job.period}</p>
              <h3 className="display mt-2 text-2xl md:text-3xl">{job.company}</h3>
              <p className="mt-1 text-slate-300">{job.role}</p>
              <p className="text-sm text-slate-500">{job.location}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-white/10 bg-black/20 p-3"
                  >
                    <p className="display text-lg text-cyan-300">{m.value}</p>
                    <p className="text-[11px] text-slate-500">{m.label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-purple-300">
                RESPONSIBILITIES & IMPACT
              </p>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((r) => (
                  <li
                    key={r.slice(0, 40)}
                    className="border-l border-cyan-400/30 pl-3 text-sm leading-relaxed text-slate-300"
                  >
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {job.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs text-blue-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-4">
                <p className="font-mono text-[10px] tracking-widest text-green-300">
                  LESSON LEARNED
                </p>
                <p className="mt-2 text-sm text-slate-200">{job.lesson}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
