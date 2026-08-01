"use client";

import { useUIStore } from "@/store/ui-store";
import { Bot, Music, Volume2, Terminal, Sparkles } from "lucide-react";

export function FloatingControls() {
  const {
    setAgentOpen,
    toggleSound,
    toggleMusic,
    toggleHologram,
    toggleTerminal,
    soundEnabled,
    musicEnabled,
    hologramMode,
    terminalMode,
  } = useUIStore();

  const btn =
    "glass flex h-10 w-10 items-center justify-center rounded-full text-cyan-200 transition hover:scale-110 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(56,248,255,0.35)]";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => setAgentOpen(true)}
        title="AI Agent (⌘J)"
        aria-label="Open AI agent"
      >
        <Bot className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={toggleHologram}
        title={`Hologram: ${hologramMode}`}
        aria-label="Toggle hologram mode"
      >
        <Sparkles className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={toggleTerminal}
        title={terminalMode ? "Exit terminal mode" : "Terminal mode"}
        aria-label="Toggle terminal mode"
      >
        <Terminal className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={toggleSound}
        title={soundEnabled ? "Mute" : "Sound on"}
        aria-label="Toggle sound"
      >
        <Volume2 className={`h-4 w-4 ${soundEnabled ? "" : "opacity-40"}`} />
      </button>
      <button
        type="button"
        className={btn}
        onClick={toggleMusic}
        title={musicEnabled ? "Music off" : "Music on"}
        aria-label="Toggle music"
      >
        <Music className={`h-4 w-4 ${musicEnabled ? "" : "opacity-40"}`} />
      </button>
    </div>
  );
}
