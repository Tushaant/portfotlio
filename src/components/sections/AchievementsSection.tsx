"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { Trophy } from "lucide-react";

export function AchievementsSection() {
  const [active, setActive] = useState(cms.achievements[0].id);
  const item = cms.achievements.find((a) => a.id === active)!;

  return (
    <section id="achievements" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
          05 · TROPHY ROOM
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Unlocked <span className="neon-text">achievements</span>
        </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Floating trophies and medals — certifications, milestones and
          recognition. CMS-backed so new wins can be added without code.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[360px] rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_center,#08111F_0%,#05060B_70%)] p-6">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative flex flex-wrap items-center justify-center gap-4 py-8">
              {cms.achievements.map((a, i) => (
                <motion.button
                  key={a.id}
                  type="button"
                  onClick={() => setActive(a.id)}
                  className="animate-float"
                  style={{ animationDelay: `${(i % 5) * 0.4}s` }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <div
                    className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border ${
                      active === a.id
                        ? "border-cyan-300 bg-cyan-400/20 shadow-[0_0_40px_rgba(56,248,255,0.45)]"
                        : "border-white/15 bg-white/5"
                    }`}
                  >
                    <Trophy
                      className={`h-6 w-6 ${
                        active === a.id ? "text-cyan-200" : "text-slate-400"
                      }`}
                    />
                    <span className="mt-1 text-[8px] uppercase tracking-wider text-slate-400">
                      {a.type.slice(0, 4)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-fuchsia-300">
                {item.type}
              </p>
              <h3 className="display mt-2 text-2xl">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {item.org} · {item.year}
              </p>
              {"description" in item && item.description && (
                <p className="mt-4 text-sm text-slate-300">{item.description}</p>
              )}
              {item.metrics && Object.keys(item.metrics).length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {Object.entries(item.metrics).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl border border-white/10 bg-black/20 p-3"
                    >
                      <p className="display text-cyan-300">{v}</p>
                      <p className="text-[11px] text-slate-500">{k}</p>
                    </div>
                  ))}
                </div>
              )}
              {"link" in item && item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-cyan-300"
                >
                  Open →
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
