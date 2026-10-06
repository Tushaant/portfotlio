"use client";

import { create } from "zustand";

export type PortfolioLens = "executive" | "product" | "technical";

type UIState = {
  preloaderDone: boolean;
  paletteOpen: boolean;
  agentOpen: boolean;
  voiceAgentOpen: boolean;
  hologramMode: "dark" | "light";
  lens: PortfolioLens;
  setPreloaderDone: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setAgentOpen: (v: boolean) => void;
  setVoiceAgentOpen: (v: boolean) => void;
  setLens: (v: PortfolioLens) => void;
  toggleHologram: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  preloaderDone: false,
  paletteOpen: false,
  agentOpen: false,
  voiceAgentOpen: false,
  hologramMode: "dark",
  lens: "executive",
  setPreloaderDone: (v) => set({ preloaderDone: v }),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setAgentOpen: (v) => set({ agentOpen: v }),
  setVoiceAgentOpen: (v) => set({ voiceAgentOpen: v }),
  setLens: (v) => set({ lens: v }),
  toggleHologram: () =>
    set((s) => ({
      hologramMode: s.hologramMode === "dark" ? "light" : "dark",
    })),
}));
