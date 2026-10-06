"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FluidVoiceOrb } from "@/components/agent/FluidVoiceOrb";
import { heroMetrics, positioning } from "@/data/profile";
import { useUIStore } from "@/store/ui-store";

export function HeroSection() {
  const requestVoice = useUIStore((state) => state.requestVoice);
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative">
      <div className="mx-auto grid min-h-[100svh] w-full min-w-0 max-w-7xl items-center gap-10 px-4 pb-28 pt-28 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:px-6 md:pb-16 md:pt-32">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">{positioning.brand}</p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="display mt-4 max-w-full break-words text-5xl leading-[1.02] text-[var(--text-primary)] md:text-7xl"
          >
            {positioning.name}
          </motion.h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--text-secondary)] md:text-xl">{positioning.role}</p>
          <p className="mt-3 max-w-xl text-base text-[var(--text-muted)] md:text-lg">{positioning.statement}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => requestVoice("talk")}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent-violet)] px-6 text-sm font-medium text-white"
            >
              Talk to Tushant AI
            </button>
            <Link href="/#professional-work" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm text-[var(--text-secondary)]">
              View experience
            </Link>
            <Link href="/#case-studies" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm text-[var(--text-secondary)]">
              View case studies
            </Link>
            <a href="/api/resume" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm text-[var(--text-secondary)]">
              Download resume
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                <dt className="display text-xl text-[var(--text-primary)]">{metric.value}</dt>
                <dd className="mt-1 text-xs text-[var(--text-muted)]">
                  {metric.label}
                  <span className="mt-1 block text-[11px] text-[var(--text-secondary)]">{metric.where}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col items-center justify-center">
          <FluidVoiceOrb state="idle" label="Tushant AI, idle" />
          <button
            type="button"
            onClick={() => requestVoice("talk")}
            className="mt-2 text-sm text-[var(--text-muted)]"
          >
            Talk with Tushant
          </button>
        </div>
      </div>
    </section>
  );
}
