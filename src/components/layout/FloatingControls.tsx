"use client";

import { useUIStore } from "@/store/ui-store";
import { Bot, Mic } from "lucide-react";

export function FloatingControls() {
  const { setAgentOpen, setVoiceAgentOpen, hologramMode } = useUIStore();

  const light = hologramMode === "light";
  const btn =
    "glass flex h-11 w-11 items-center justify-center rounded-full transition hover:scale-110 " +
    (light
      ? "text-amber-800 hover:text-amber-950 hover:shadow-[0_0_24px_rgba(197,160,89,0.45)]"
      : "text-amber-200 hover:text-amber-100 hover:shadow-[0_0_24px_rgba(255,179,0,0.45)]");

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => setAgentOpen(true)}
        title="Chat agent (⌘J)"
        aria-label="Open chat agent"
      >
        <Bot className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => setVoiceAgentOpen(true)}
        title="Voice agent"
        aria-label="Open Tushant's AI companion"
      >
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}
