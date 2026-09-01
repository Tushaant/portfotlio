"use client";

import { create } from "zustand";

export type AgentTurn = { role: "user" | "assistant"; content: string };

const WINDOW = 8;

type ConversationState = {
  turns: AgentTurn[];
  voiceGreeted: boolean;
  append: (turn: AgentTurn) => void;
  reset: () => void;
  window: () => AgentTurn[];
  markVoiceGreeted: () => void;
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  turns: [],
  voiceGreeted: false,
  append: (turn) =>
    set((s) => ({
      turns: [...s.turns, turn].slice(-24),
    })),
  reset: () => set({ turns: [], voiceGreeted: false }),
  window: () => get().turns.slice(-WINDOW),
  markVoiceGreeted: () => set({ voiceGreeted: true }),
}));
