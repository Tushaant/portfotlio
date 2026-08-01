"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Give me a smart summary of Tushant",
  "What did he ship at Oraczen?",
  "Tell me about Bharatlabs",
  "How do I contact him?",
];

export function ChatAgent() {
  const open = useUIStore((s) => s.agentOpen);
  const setOpen = useUIStore((s) => s.setAgentOpen);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Command Center Agent online. I answer strictly from Tushant's resume PDF and portfolio CMS (Notion projects, case studies, achievements). Ask anything — or try a smart summary.",
    },
  ]);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer || "No signal." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Channel interrupted. Retry transmission.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-end bg-black/50 p-4 backdrop-blur-sm md:items-center md:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="glass flex h-[min(640px,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(138,92,255,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="display text-xs tracking-[0.2em] text-cyan-300">
                  RESUME AGENT
                </p>
                <p className="text-xs text-slate-400">
                  Strict sources · PDF + Notion CMS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-white/5"
                aria-label="Close agent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "ml-auto bg-cyan-400/15 text-cyan-50"
                      : "bg-white/5 text-slate-200"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="animate-pulse text-xs text-cyan-300/70">
                  Retrieving from knowledge graph…
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 px-3 pt-3">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about experience, projects, metrics…"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
