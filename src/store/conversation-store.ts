"use client";

import { create } from "zustand";

export type AgentTurn = { role: "user" | "assistant"; content: string };

const WINDOW = 8;

type ConversationState = {
  turns: AgentTurn[];
  voiceGreeted: boolean;
  conversationId: string;
  append: (turn: AgentTurn) => void;
  reset: () => void;
  window: () => AgentTurn[];
  markVoiceGreeted: () => void;
};

function cid() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  turns: [],
  voiceGreeted: false,
  conversationId: cid(),
  append: (turn) =>
    set((s) => ({
      turns: [...s.turns, turn].slice(-24),
    })),
  reset: () => set({ turns: [], voiceGreeted: false, conversationId: cid() }),
  window: () => get().turns.slice(-WINDOW),
  markVoiceGreeted: () => set({ voiceGreeted: true }),
}));
