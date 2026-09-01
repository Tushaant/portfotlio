"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Mic, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { cms } from "@/lib/cms";

export function VoiceAgent() {
  const open = useUIStore((s) => s.voiceAgentOpen);
  const setOpen = useUIStore((s) => s.setVoiceAgentOpen);
  const voice = cms.voiceAgent;
  const r = cms.resume;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-end bg-black/60 p-4 backdrop-blur-md md:items-center md:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Voice agent"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="header-solid flex w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(255,179,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative h-9 w-9 overflow-hidden rounded-full border border-[color:rgba(var(--accent-rgb),0.45)]">
                  <Image
                    src="/profile/tushant-circle.png"
                    alt="Tushant Sharma"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <p className="display text-xs tracking-[0.2em] text-amber-300">
                    VOICE AGENT
                  </p>
                  <p className="text-xs text-[var(--muted)]">Next update</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-amber-400/10"
                aria-label="Close voice agent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[color:rgba(var(--accent-rgb),0.45)] bg-[rgba(var(--accent-rgb),0.12)] text-[var(--gold)] shadow-[0_0_28px_rgba(var(--accent-rgb),0.28)]">
                <Mic className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="display text-xl text-[var(--text)]">{voice.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                {voice.tagline} Until then, use the chat agent or reach Tushant
                directly.
              </p>
              <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
                Email {r.email}
                <br />
                LinkedIn {r.linkedin}
                <br />
                Phone {r.phone}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
