"use client";

import { motion } from "framer-motion";
import { cms } from "@/lib/cms";

export function TechStackSection() {
  return (
    <section className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
          07 · TECH STACK
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Holographic <span className="neon-text">toolkit</span>
        </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Technologies as holographic chips — grouped exactly as they appear on
          the resume PDF.
        </p>

        <div className="mt-12 space-y-8">
          {Object.entries(cms.techStack).map(([group, items], gi) => (
            <div key={group}>
              <h3 className="mb-3 font-mono text-xs tracking-[0.2em] text-slate-500">
                {group.toUpperCase()}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(items as string[]).map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (gi * 0.02 + i) * 0.02 }}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 0 28px rgba(56,248,255,0.35)",
                    }}
                    className="glass inline-flex cursor-default items-center rounded-xl px-3.5 py-2 text-sm text-slate-200"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38F8FF]" />
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
