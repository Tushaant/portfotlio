"use client";

import { create } from "zustand";

type UIState = {
  preloaderDone: boolean;
  paletteOpen: boolean;
  agentOpen: boolean;
  voiceAgentOpen: boolean;
  hologramMode: "dark" | "light";
  setPreloaderDone: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setAgentOpen: (v: boolean) => void;
  setVoiceAgentOpen: (v: boolean) => void;
  toggleHologram: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  preloaderDone: false,
  paletteOpen: false,
  agentOpen: false,
  voiceAgentOpen: false,
  hologramMode: "dark",
  setPreloaderDone: (v) => set({ preloaderDone: v }),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setAgentOpen: (v) => set({ agentOpen: v }),
  setVoiceAgentOpen: (v) => set({ voiceAgentOpen: v }),
  toggleHologram: () =>
    set((s) => ({
      hologramMode: s.hologramMode === "dark" ? "light" : "dark",
    })),
}));
