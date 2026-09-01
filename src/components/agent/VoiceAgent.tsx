"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Mic, Square, VolumeX, RotateCcw, MessageSquare, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useConversationStore } from "@/store/conversation-store";
import {
  createBrowserTts,
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from "@/lib/voice-runtime";

type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

const STATUS: Record<VoiceState, string> = {
  idle: "Talk to Tushant",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  error: "Something went wrong. Try again.",
};

export function VoiceAgent() {
  const open = useUIStore((s) => s.voiceAgentOpen);
  const setOpen = useUIStore((s) => s.setVoiceAgentOpen);
  const setChatOpen = useUIStore((s) => s.setAgentOpen);
  const append = useConversationStore((s) => s.append);

  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(true);

  const tts = useMemo(() => createBrowserTts(), []);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const requestId = useRef(0);
  const stateRef = useRef<VoiceState>("idle");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cleanupRecognition = useCallback(() => {
    const rec = recRef.current;
    recRef.current = null;
    if (!rec) return;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    try {
      rec.abort();
    } catch {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const resetSession = useCallback(() => {
    requestId.current += 1;
    tts.stop();
    cleanupRecognition();
    setState("idle");
    setError("");
    setInterim("");
    setFinalText("");
  }, [cleanupRecognition, tts]);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (!open) {
      resetSession();
    }
    return () => {
      tts.stop();
      cleanupRecognition();
    };
  }, [open, resetSession, tts, cleanupRecognition]);

  const askBrain = useCallback(
    async (transcript: string) => {
      const id = ++requestId.current;
      setState("thinking");
      setReply("");
      append({ role: "user", content: transcript });
      try {
        const history = useConversationStore.getState().window();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: transcript,
            channel: "voice",
            history,
          }),
        });
        const data = await res.json();
        if (id !== requestId.current) return;
        const answer = String(data.answer || "Something went wrong. Please try again.");
        append({ role: "assistant", content: answer });
        setReply(answer);
        setState("speaking");
        await tts.speak(answer);
        if (id !== requestId.current) return;
        setState("idle");
      } catch {
        if (id !== requestId.current) return;
        setError("Something went wrong. Please try again.");
        setState("error");
      }
    },
    [append, tts],
  );

  const startListening = useCallback(() => {
    tts.stop();
    cleanupRecognition();
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      setError("Voice input isn't supported in this browser. You can continue with the Chat Agent.");
      setState("error");
      return;
    }

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;
    setInterim("");
    setFinalText("");
    setError("");
    setState("listening");

    rec.onresult = (ev) => {
      let nextInterim = "";
      let nextFinal = "";
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const chunk = ev.results[i][0]?.transcript || "";
        if (ev.results[i].isFinal) nextFinal += chunk;
        else nextInterim += chunk;
      }
      if (nextInterim) setInterim(nextInterim);
      if (nextFinal.trim()) {
        setFinalText(nextFinal.trim());
        setInterim("");
        cleanupRecognition();
        void askBrain(nextFinal.trim());
      }
    };

    rec.onerror = (ev) => {
      const code = ev.error;
      cleanupRecognition();
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone access is required for voice conversations. You can continue with Chat.");
      } else if (code === "no-speech") {
        setError("I didn't catch that. Try again when you're ready.");
      } else if (code === "network") {
        setError("Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setState("error");
    };

    rec.onend = () => {
      if (stateRef.current === "listening" && recRef.current === rec) {
        cleanupRecognition();
        setState("idle");
      }
    };

    try {
      rec.start();
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  }, [askBrain, cleanupRecognition, tts]);

  const bargeIn = useCallback(() => {
    requestId.current += 1;
    tts.stop();
    startListening();
  }, [startListening, tts]);

  const stopSpeaking = useCallback(() => {
    requestId.current += 1;
    tts.stop();
    setState("idle");
  }, [tts]);

  const stopListening = useCallback(() => {
    cleanupRecognition();
    setState("idle");
  }, [cleanupRecognition]);

  const openChat = useCallback(() => {
    resetSession();
    setOpen(false);
    setChatOpen(true);
  }, [resetSession, setChatOpen, setOpen]);

  const statusLabel = state === "error" && error ? error : STATUS[state];
  const liveTranscript = finalText || interim;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-end bg-black/60 p-4 backdrop-blur-md md:items-center md:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            resetSession();
            setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Voice agent"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="header-solid flex w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(255,179,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative h-9 w-9 overflow-hidden rounded-full border border-[color:rgba(var(--accent-rgb),0.45)]">
                  <Image
                    src="/profile/tushant-circle.png"
                    alt="Tushant Sharma"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <p className="display text-xs tracking-[0.2em] text-amber-300">
                    VOICE AGENT
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Don&apos;t just read. Talk to it.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetSession();
                  setOpen(false);
                }}
                className="rounded-lg p-2 hover:bg-amber-400/10"
                aria-label="Close voice agent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center px-6 py-8 text-center">
              <button
                type="button"
                onClick={() => {
                  if (!supported) {
                    setError("Voice input isn't supported in this browser. You can continue with the Chat Agent.");
                    setState("error");
                    return;
                  }
                  if (state === "speaking") bargeIn();
                  else if (state === "listening") stopListening();
                  else startListening();
                }}
                className={`relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[color:rgba(var(--accent-rgb),0.45)] bg-[rgba(var(--accent-rgb),0.12)] text-[var(--gold)] shadow-[0_0_28px_rgba(var(--accent-rgb),0.28)] transition ${
                  state === "listening" || state === "speaking" ? "voice-pulse" : ""
                }`}
                aria-label={
                  state === "listening"
                    ? "Stop listening"
                    : state === "speaking"
                      ? "Interrupt and listen"
                      : "Start voice"
                }
              >
                <Mic className="h-8 w-8" aria-hidden />
              </button>

              <p className="display text-lg text-[var(--text)]" aria-live="polite">
                {statusLabel}
              </p>
              <p className="mt-2 min-h-[2.5rem] max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                {liveTranscript ||
                  (reply && state !== "idle"
                    ? reply
                    : "Ask about Tushant's work, products, or how he thinks about AI.")}
              </p>
              {state === "speaking" && reply ? (
                <p className="sr-only" aria-live="polite">
                  {reply}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 px-4 py-3">
              {state === "listening" ? (
                <button
                  type="button"
                  onClick={stopListening}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--muted)] hover:border-amber-400/40 hover:text-amber-200"
                >
                  <Square className="h-3 w-3" /> Stop listening
                </button>
              ) : null}
              {state === "speaking" ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--muted)] hover:border-amber-400/40 hover:text-amber-200"
                >
                  <VolumeX className="h-3 w-3" /> Stop speaking
                </button>
              ) : null}
              {state === "error" ? (
                <button
                  type="button"
                  onClick={startListening}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--muted)] hover:border-amber-400/40 hover:text-amber-200"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              ) : null}
              <button
                type="button"
                onClick={openChat}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--muted)] hover:border-amber-400/40 hover:text-amber-200"
              >
                <MessageSquare className="h-3 w-3" /> Open Chat Agent
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
