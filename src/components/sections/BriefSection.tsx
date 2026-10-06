"use client";

import Link from "next/link";
import { executiveBrief } from "@/data/profile";
import { useUIStore } from "@/store/ui-store";

export function BriefSection() {
  const setVoiceOpen = useUIStore((state) => state.setVoiceAgentOpen);
  return (
    <section id="brief" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">Brief</p>
        <h2 className="display mt-3 text-3xl text-[var(--text-primary)] md:text-5xl">{executiveBrief.title}</h2>
        <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">{executiveBrief.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent-violet)] px-5 text-sm text-white"
          >
            Listen to brief
          </button>
          <Link href="/resume" className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-5 text-sm text-[var(--text-secondary)]">
            View resume
          </Link>
        </div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Ask Tushant AI for the 30-second brief. The assistant reads it from the same profile as this page.
        </p>
      </div>
    </section>
  );
}
