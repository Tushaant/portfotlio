"use client";

import Link from "next/link";
import { Mic } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FluidVoiceOrb } from "@/components/agent/FluidVoiceOrb";
import { heroMetrics, positioning } from "@/data/profile";
import { useUIStore, type VoicePhase } from "@/store/ui-store";

const HERO_VOICE_COPY: Record<VoicePhase, { title: string; detail: string }> = {
  idle: { title: "Talk with Tushant", detail: "Have a conversation" },
  listening: { title: "Listening...", detail: "Speak naturally" },
  thinking: { title: "Thinking...", detail: "" },
  speaking: { title: "Tushant is speaking", detail: "" },
  error: { title: "Something went wrong", detail: "Try again" },
};

function HeroVoiceAffordance() {
  const requestVoice = useUIStore((state) => state.requestVoice);
  const setVoiceAgentOpen = useUIStore((state) => state.setVoiceAgentOpen);
  const phase = useUIStore((state) => state.voicePhase);
  const level = useUIStore((state) => state.voiceLevel);
  const copy = HERO_VOICE_COPY[phase];
  const orbState = phase === "error" ? "idle" : phase;

  const openTalk = () => {
    const current = useUIStore.getState();
    if (current.voiceAgentOpen && current.voicePhase === "error") {
      setVoiceAgentOpen(false);
      window.setTimeout(() => useUIStore.getState().requestVoice("talk"), 40);
      return;
    }
    requestVoice("talk");
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <div className={phase === "error" ? "rounded-full ring-1 ring-rose-300/70" : undefined}>
        <FluidVoiceOrb state={orbState} level={level} label={copy.title} />
      </div>
      <button
        type="button"
        onClick={openTalk}
        aria-label="Talk with Tushant"
        data-hero-voice={phase}
        className="mt-3 inline-flex min-h-11 w-full max-w-[17rem] items-center gap-3 rounded-full border border-[color:rgba(var(--accent-rgb),0.38)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] px-3.5 py-2 text-left shadow-[0_0_28px_rgba(var(--accent-rgb),0.2)] backdrop-blur-md transition hover:border-[color:rgba(var(--accent-rgb),0.6)] hover:shadow-[0_0_36px_rgba(var(--accent-rgb),0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-violet)]"
      >
        <Mic className="h-4 w-4 shrink-0 text-[var(--accent-violet)]" aria-hidden />
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-tight text-[var(--text-primary)]">{copy.title}</span>
          {copy.detail ? (
            <span className="mt-0.5 block text-xs leading-tight text-[var(--text-muted)]">{copy.detail}</span>
          ) : null}
        </span>
      </button>
    </div>
  );
}

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

        <div className="flex min-w-0 flex-col items-center justify-center">
          <HeroVoiceAffordance />
        </div>
      </div>
    </section>
  );
}
