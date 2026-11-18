"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronRight, Mic } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { heroMetrics, positioning } from "@/data/profile";
import { useUIStore, type VoicePhase } from "@/store/ui-store";

const TushantAvatar = dynamic(
  () => import("@/components/avatar/TushantAvatar").then((mod) => mod.TushantAvatar),
  { ssr: false },
);

const HERO_VOICE_COPY: Record<VoicePhase, { title: string; detail: string }> = {
  idle: { title: "Talk with Tushant", detail: "Have a conversation" },
  listening: { title: "Listening...", detail: "Speak naturally" },
  thinking: { title: "Thinking...", detail: "" },
  speaking: { title: "Tushant is speaking", detail: "" },
  error: { title: "Something went wrong", detail: "Try again" },
};

const HERO_HALO: Record<VoicePhase, string> = {
  idle: "bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.45),transparent_68%)]",
  listening: "bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.42),transparent_68%)]",
  thinking: "bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.45),transparent_68%)]",
  speaking: "bg-[radial-gradient(ellipse_at_center,rgba(232,121,249,0.4),rgba(34,211,238,0.14)_42%,transparent_70%)]",
  error: "bg-[radial-gradient(ellipse_at_center,rgba(251,113,133,0.34),transparent_68%)]",
};

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function openHeroVoice() {
  const current = useUIStore.getState();
  if (current.voiceAgentOpen && current.voicePhase === "error") {
    current.setVoiceAgentOpen(false);
    window.setTimeout(() => useUIStore.getState().requestVoice("talk"), 40);
    return;
  }
  current.requestVoice("talk");
}

function HeroVoiceAffordance() {
  const phase = useUIStore((state) => state.voicePhase);
  const level = useUIStore((state) => state.voiceLevel);
  const copy = HERO_VOICE_COPY[phase];
  const active = phase === "listening" || phase === "speaking";

  return (
    <button
      type="button"
      onClick={openHeroVoice}
      aria-label="Talk with Tushant"
      data-hero-voice={phase}
      className="inline-flex min-h-11 w-full max-w-[22rem] items-center gap-3 rounded-[1.6rem] border border-violet-300/30 bg-[#0c0c14]/80 px-3.5 py-2.5 text-left shadow-[0_0_32px_rgba(139,92,246,0.28)] backdrop-blur-md transition hover:border-cyan-200/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4b5fd]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/80 to-cyan-400/70 text-[#f8fafc] shadow-[0_0_16px_rgba(34,211,238,0.35)]">
        <Mic className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-tight text-[#f8fafc]">{copy.title}</span>
        {copy.detail ? <span className="mt-0.5 block text-xs leading-tight text-[#d4d4d8]">{copy.detail}</span> : null}
      </span>
      {active ? (
        <span className="flex h-4 items-end gap-0.5" aria-hidden>
          {[0.45, 0.75, 1, 0.6].map((bar, index) => (
            <span key={index} className="w-0.5 rounded-full bg-cyan-200" style={{ height: `${Math.max(4, 4 + level * 12 * bar)}px` }} />
          ))}
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-[#ddd6fe]" aria-hidden />
      )}
    </button>
  );
}

function AvatarPortrait() {
  const phase = useUIStore((state) => state.voicePhase);
  const level = useUIStore((state) => state.voiceLevel);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(canUseWebGL());
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="relative h-[280px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#07070d] sm:h-[340px] md:h-[min(520px,60vh)]">
        <div className={`pointer-events-none absolute inset-0 ${HERO_HALO[phase]}`} />
        {webgl === false ? (
          <Image
            src="/avatar/tushant-reference.jpg"
            alt="Tushant Sharma"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover object-[center_18%]"
          />
        ) : webgl ? (
          <TushantAvatar state={phase} audioLevel={level} speaking={phase === "speaking"} />
        ) : null}
      </div>
      <div className="relative z-10 -mt-7 flex justify-center px-3">
        <HeroVoiceAffordance />
      </div>
    </div>
  );
}

export function HeroSection() {
  const requestVoice = useUIStore((state) => state.requestVoice);
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative">
      <div className="mx-auto grid min-h-[100svh] w-full min-w-0 max-w-7xl items-center gap-10 px-4 pb-28 pt-28 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:px-6 md:pb-16 md:pt-32">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">{positioning.brand}</p>
          <p className="mt-5 text-sm text-[var(--text-secondary)]">Hi, I&apos;m</p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="display mt-1 max-w-full break-words text-5xl leading-[1.02] text-[var(--text-primary)] md:text-7xl"
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
          <AvatarPortrait />
        </div>
      </div>
    </section>
  );
}
