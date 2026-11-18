"use client";

import { create } from "zustand";
import { primeSpeechOutput } from "@/lib/voice-runtime";

export type PortfolioLens = "executive" | "product" | "technical";

export type VoiceCue = "talk" | "brief";

export type VoicePhase = "idle" | "listening" | "thinking" | "speaking" | "error";

type UIState = {
  preloaderDone: boolean;
  paletteOpen: boolean;
  agentOpen: boolean;
  voiceAgentOpen: boolean;
  voiceCue: VoiceCue | null;
  voicePhase: VoicePhase;
  voiceLevel: number;
  briefSpeaking: boolean;
  hologramMode: "dark" | "light";
  lens: PortfolioLens;
  setPreloaderDone: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setAgentOpen: (v: boolean) => void;
  setVoiceAgentOpen: (v: boolean) => void;
  requestVoice: (cue: VoiceCue) => void;
  setVoicePhase: (phase: VoicePhase) => void;
  setBriefSpeaking: (v: boolean) => void;
  setLens: (v: PortfolioLens) => void;
  toggleHologram: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  preloaderDone: false,
  paletteOpen: false,
  agentOpen: false,
  voiceAgentOpen: false,
  voiceCue: null,
  voicePhase: "idle",
  voiceLevel: 0,
  briefSpeaking: false,
  hologramMode: "dark",
  lens: "executive",
  setPreloaderDone: (v) => set({ preloaderDone: v }),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setAgentOpen: (v) => set({ agentOpen: v }),
  setVoiceAgentOpen: (v) => {
    if (v) primeSpeechOutput();
    set({
      voiceAgentOpen: v,
      voiceCue: v ? "talk" : null,
      briefSpeaking: false,
      ...(v ? {} : { voicePhase: "idle" as const, voiceLevel: 0 }),
    });
  },
  requestVoice: (cue) => {
    primeSpeechOutput();
    set({ voiceAgentOpen: true, voiceCue: cue });
  },
  setVoicePhase: (phase) => set({ voicePhase: phase, ...(phase === "listening" ? {} : { voiceLevel: 0 }) }),
  setBriefSpeaking: (v) => set({ briefSpeaking: v }),
  setLens: (v) => set({ lens: v }),
  toggleHologram: () =>
    set((s) => ({
      hologramMode: s.hologramMode === "dark" ? "light" : "dark",
    })),
}));
