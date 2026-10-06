"use client";

import Link from "next/link";
import { useUIStore } from "@/store/ui-store";

export function SiteFooter() {
  const setVoiceOpen = useUIStore((state) => state.setVoiceAgentOpen);
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-[var(--text-muted)] md:px-6">
        <p>Tushant Sharma · AI Product Leader</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/resume" className="hover:text-[var(--text-primary)]">
            View resume
          </Link>
          <button type="button" onClick={() => setVoiceOpen(true)} className="hover:text-[var(--text-primary)]">
            Talk to Tushant AI
          </button>
          <Link href="/#contact" className="hover:text-[var(--text-primary)]">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
