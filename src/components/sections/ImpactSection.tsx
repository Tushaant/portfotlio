"use client";

import { motion, useReducedMotion } from "framer-motion";
import { impactMetrics } from "@/data/profile";

export function ImpactSection() {
  const reduce = useReducedMotion();
  return (
    <section id="impact" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">03 · Product impact</p>
        <h2 className="display mt-3 text-3xl text-[var(--text-primary)] md:text-5xl">Product impact</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
          Career outcomes with the company and period attached. These are not live telemetry.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric, index) => (
            <motion.article
              key={metric.label}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="display text-3xl text-[var(--text-primary)]">{metric.value}</p>
              <h3 className="mt-2 text-sm text-[var(--text-secondary)]">{metric.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{metric.detail}</p>
              <p className="mt-4 text-[11px] tracking-wide text-[var(--accent-indigo)]">
                {metric.where} · {metric.when}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
