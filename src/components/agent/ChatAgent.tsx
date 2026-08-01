"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
 const listRef = useRef<HTMLDivElement>(null);
 const [messages, setMessages] = useState<Msg[]>([
 {
 role: "assistant",
 content:
 "Command Center Agent online. I answer strictly from Tushant's resume PDF and portfolio CMS (Notion projects, case studies, achievements). Ask anything - or try a smart summary.",
 },
 ]);

 useEffect(() => {
 if (!open) return;
 const el = listRef.current;
 if (el) el.scrollTop = el.scrollHeight;
 }, [messages, loading, open]);

 /** Keep wheel / touch scroll inside the agent - never bubble to the page. */
 useEffect(() => {
 if (!open) return;

 const stopPageScroll = (e: WheelEvent | TouchEvent) => {
 const target = e.target as HTMLElement | null;
 const panel = target?.closest("[data-agent-panel]");
 if (!panel) {
 e.preventDefault();
 return;
 }
 const scroller = panel.querySelector(
 "[data-agent-scroll]",
 ) as HTMLElement | null;
 if (!scroller) return;

 if (e instanceof WheelEvent) {
 const { scrollTop, scrollHeight, clientHeight } = scroller;
 const atTop = scrollTop <= 0 && e.deltaY < 0;
 const atBottom =
 scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
 if (atTop || atBottom) {
 // absorb bounce so Lenis / body never moves
 e.preventDefault();
 }
 // otherwise let the scroller handle it; still stop Lenis via stopPropagation
 e.stopPropagation();
 }
 };

 document.addEventListener("wheel", stopPageScroll, {
 passive: false,
 capture: true,
 });
 document.addEventListener("touchmove", stopPageScroll, {
 passive: false,
 capture: true,
 });
 return () => {
 document.removeEventListener("wheel", stopPageScroll, true);
 document.removeEventListener("touchmove", stopPageScroll, true);
 };
 }, [open]);

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
 <div>
 <p className="display text-xs tracking-[0.2em] text-amber-300">
 RESUME AGENT
 </p>
 <p className="text-xs text-[var(--muted)]">
 Strict sources · PDF + Notion CMS
 </p>
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

 <div
 ref={listRef}
 data-agent-scroll
 className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
 style={{ WebkitOverflowScrolling: "touch" }}
 >
 {messages.map((m, i) => (
 <div
 key={i}
 className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
 m.role === "user"
 ? "ml-auto bg-amber-400/15 text-[var(--text)]"
 : "bg-black/20 text-[var(--text)]"
 }`}
 >
 {m.content}
 </div>
 ))}
 {loading && (
 <div className="animate-pulse text-xs text-amber-300/70">
 Retrieving from knowledge graph…
 </div>
 )}
 </div>

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
 className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#0B0B0B]"
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
