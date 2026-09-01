"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { useConversationStore } from "@/store/conversation-store";
import { trackEvent } from "@/lib/analytics";
import { AgentScroll } from "@/components/agent/AgentScroll";
import { X, Send, User } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Give me a smart summary of Tushant",
  "List all projects",
  "What did he ship at Oraczen?",
  "Show client testimonials",
  "How do I contact him?",
];

function BotAvatar() {
  return (
    <span className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[color:rgba(var(--accent-rgb),0.45)] bg-[var(--surface)] shadow-[0_0_12px_rgba(var(--accent-rgb),0.25)]">
      <Image
        src="/profile/tushant-circle.png"
        alt="Tushant Sharma"
        width={32}
        height={32}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:rgba(var(--accent-rgb),0.35)] bg-[var(--surface-2)] text-[var(--gold)]">
      <User className="h-4 w-4" aria-hidden />
      <span className="sr-only">You</span>
    </span>
  );
}

export function ChatAgent() {
  const open = useUIStore((s) => s.agentOpen);
  const setOpen = useUIStore((s) => s.setAgentOpen);
  const append = useConversationStore((s) => s.append);
  const storedTurns = useConversationStore((s) => s.turns);
  const conversationId = useConversationStore((s) => s.conversationId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followBottom, setFollowBottom] = useState(true);
  const chatStarted = useRef(false);
  const greeting =
    "I'm Tushant's AI companion. I answer from verified portfolio data: resume, projects, case studies, skills, and contact. Ask anything. If it isn't in the site, I won't invent it.";
  const messages = storedTurns.length
    ? storedTurns
    : ([{ role: "assistant" as const, content: greeting }] satisfies Msg[]);

  useEffect(() => {
    if (!open) return;
    trackEvent("chat_opened", { agentType: "chat", conversationId });
    if (!chatStarted.current) {
      chatStarted.current = true;
      trackEvent("chat_session_started", { agentType: "chat", conversationId });
    }
  }, [open, conversationId]);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    append({ role: "user", content: q });
    trackEvent("chat_message_sent", {
      agentType: "chat",
      conversationId,
      text: q.slice(0, 240),
    });
    setInput("");
    setLoading(true);
    const started = Date.now();
    try {
      const history = useConversationStore.getState().window();
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message: q, channel: "chat", history }),
      });
      window.clearTimeout(timer);
      const data = await res.json();
      append({
        role: "assistant",
        content: data.answer || "I'm having a little trouble getting that response. Give me another try.",
      });
      trackEvent(data.knowledgeGap ? "knowledge_gap" : "response_success", {
        agentType: "chat",
        conversationId,
        llmLatency: Date.now() - started,
      });
    } catch {
      append({
        role: "assistant",
        content: "I'm having a little trouble getting that response. Give me another try.",
      });
      trackEvent("response_failure", { agentType: "chat", conversationId });
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
          className="fixed inset-0 z-[70] flex items-end justify-end bg-black/60 p-4 backdrop-blur-md md:items-center md:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Resume AI agent"
        >
          <motion.div
            data-agent-panel
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="header-solid flex h-[min(640px,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(255,179,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <BotAvatar />
                <div>
                  <p className="display text-xs tracking-[0.2em] text-amber-300">
                    RESUME AGENT
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Trained on full website CMS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-amber-400/10"
                aria-label="Close agent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AgentScroll
              follow={followBottom}
              onFollowChange={setFollowBottom}
              scrollKey={`${storedTurns.length}-${loading}`}
              className="space-y-3 p-4"
            >
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {isUser ? <UserAvatar /> : <BotAvatar />}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "rounded-tr-md bg-amber-400/15 text-[var(--text)]"
                          : "rounded-tl-md bg-black/20 text-[var(--text)]"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <BotAvatar />
                  <div className="animate-pulse rounded-2xl rounded-tl-md bg-black/20 px-3.5 py-2.5 text-xs text-amber-300/70">
                    Retrieving from knowledge graph…
                  </div>
                </div>
              )}
            </AgentScroll>

            <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/10 px-3 pt-3">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--muted)] hover:border-amber-400/40 hover:text-amber-200"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex shrink-0 items-center gap-2 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about experience, projects, metrics…"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-amber-400/50"
                autoFocus
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--ember)] text-[var(--bg)]"
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
