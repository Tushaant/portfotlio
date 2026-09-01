"use client";

import { create } from "zustand";

export type AgentTurn = { role: "user" | "assistant"; content: string };

const WINDOW = 8;

type ConversationState = {
  turns: AgentTurn[];
  append: (turn: AgentTurn) => void;
  reset: () => void;
  window: () => AgentTurn[];
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  turns: [],
  append: (turn) =>
    set((s) => ({
      turns: [...s.turns, turn].slice(-24),
    })),
  reset: () => set({ turns: [] }),
  window: () => get().turns.slice(-WINDOW),
}));
