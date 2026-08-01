"use client";

import { create } from "zustand";

type UIState = {
  preloaderDone: boolean;
  paletteOpen: boolean;
  agentOpen: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hologramMode: "dark" | "light";
  terminalMode: boolean;
  setPreloaderDone: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setAgentOpen: (v: boolean) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHologram: () => void;
  toggleTerminal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  preloaderDone: false,
  paletteOpen: false,
  agentOpen: false,
  soundEnabled: false,
  musicEnabled: false,
  hologramMode: "dark",
  terminalMode: false,
  setPreloaderDone: (v) => set({ preloaderDone: v }),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setAgentOpen: (v) => set({ agentOpen: v }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  toggleHologram: () =>
    set((s) => ({
      hologramMode: s.hologramMode === "dark" ? "light" : "dark",
    })),
  toggleTerminal: () => set((s) => ({ terminalMode: !s.terminalMode })),
}));
