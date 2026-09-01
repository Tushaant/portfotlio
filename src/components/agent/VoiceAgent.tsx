"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Square, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useConversationStore } from "@/store/conversation-store";
import { trackEvent } from "@/lib/analytics";
import {
  VOICE_GREETING,
  createBrowserTts,
  createSpeechRecognition,
  getAvailableVoices,
  isSpeechRecognitionSupported,
  selectPreferredMaleVoice,
  subscribeVoices,
  type SpeechRecognitionLike,
  type VoiceOption,
} from "@/lib/voice-runtime";

type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";

const STATUS: Record<VoiceState, string> = {
  idle: "Talk with Tushant",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  error: "Something went wrong. Try again.",
};

export function VoiceAgent() {
  const open = useUIStore((s) => s.voiceAgentOpen);
  const setOpen = useUIStore((s) => s.setVoiceAgentOpen);
  const setChatOpen = useUIStore((s) => s.setAgentOpen);
  const turns = useConversationStore((s) => s.turns);
  const append = useConversationStore((s) => s.append);
  const voiceGreeted = useConversationStore((s) => s.voiceGreeted);
  const markVoiceGreeted = useConversationStore((s) => s.markVoiceGreeted);

  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [followBottom, setFollowBottom] = useState(true);
  const [level, setLevel] = useState(0);

  const tts = useMemo(() => createBrowserTts(), []);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const requestId = useRef(0);
  const listeningRef = useRef(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const applyVoices = useCallback(() => {
    const list = getAvailableVoices();
    setVoices(list);
    setSelectedVoiceURI((current) => {
      if (current && list.some((v) => v.uri === current)) return current;
      return selectPreferredMaleVoice(list)?.uri ?? list[0]?.uri ?? "";
    });
  }, []);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (!open) return;
    applyVoices();
    return subscribeVoices(applyVoices);
  }, [open, applyVoices]);

  useEffect(() => {
    tts.setVoiceURI(selectedVoiceURI);
  }, [selectedVoiceURI, tts]);

  const stopMicMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    analyserRef.current = null;
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    setLevel(0);
  }, []);

  const startMicMeter = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const n of data) {
          const v = (n - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* recognition error handler covers permission */
    }
  }, []);

  const cleanupRecognition = useCallback(() => {
    listeningRef.current = false;
    const rec = recRef.current;
    recRef.current = null;
    stopMicMeter();
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
  }, [stopMicMeter]);

  const stopAll = useCallback(() => {
    requestId.current += 1;
    tts.stop();
    cleanupRecognition();
    setInterim("");
    setError("");
    setState("idle");
  }, [cleanupRecognition, tts]);

  const askBrain = useCallback(
    async (transcript: string) => {
      const id = ++requestId.current;
      setState("thinking");
      setError("");
      append({ role: "user", content: transcript });
      trackEvent("voice_message_sent");
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
        const data = (await res.json()) as { answer?: string };
        if (id !== requestId.current) return;
        const answer = String(data.answer || "Something went wrong. Please try again.");
        append({ role: "assistant", content: answer });
        setState("speaking");
        await tts.speak(answer, { voiceURI: selectedVoiceURI });
        if (id !== requestId.current) return;
        setState("idle");
      } catch {
        if (id !== requestId.current) return;
        setError("I could not finish that answer. You can read the transcript or continue in chat.");
        setState("error");
      }
    },
    [append, selectedVoiceURI, tts],
  );

  const listen = useCallback(async () => {
    if (!isSpeechRecognitionSupported()) {
      setSupported(false);
      setState("error");
      setError("Voice input isn't supported in this browser.");
      return;
    }
    requestId.current += 1;
    tts.stop();
    cleanupRecognition();
    setError("");
    setInterim("");

    const rec = createSpeechRecognition();
    if (!rec) {
      setSupported(false);
      setState("error");
      setError("Voice input isn't supported in this browser.");
      return;
    }
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;
    listeningRef.current = true;
    setState("listening");
    await startMicMeter();

    rec.onresult = (event) => {
      let live = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += piece;
        else live += piece;
      }
      setInterim(live.trim());
      const uttered = finalText.trim();
      if (!uttered) return;
      setInterim("");
      listeningRef.current = false;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      recRef.current = null;
      try {
        rec.stop();
      } catch {
        /* already stopping */
      }
      stopMicMeter();
      void askBrain(uttered);
    };

    rec.onerror = (event) => {
      listeningRef.current = false;
      stopMicMeter();
      recRef.current = null;
      if (event.error === "aborted" || event.error === "no-speech") {
        setInterim("");
        setState("idle");
        return;
      }
      setState("error");
      if (event.error === "not-allowed") {
        setError(
          "I'm having trouble accessing your microphone. You can continue the conversation through chat instead.",
        );
      } else if (event.error === "network") {
        setError("Speech recognition lost its network connection. Try again, or continue in chat.");
      } else {
        setError("Speech recognition had trouble just then. Try again, or continue in chat.");
      }
    };

    rec.onend = () => {
      stopMicMeter();
      if (listeningRef.current) {
        listeningRef.current = false;
        recRef.current = null;
        setState("idle");
      }
    };

    try {
      rec.start();
    } catch {
      setState("error");
      setError("Microphone access is required for voice conversations.");
    }
  }, [askBrain, cleanupRecognition, startMicMeter, stopMicMeter, tts]);

  const onOrb = useCallback(() => {
    if (state === "thinking") return;
    if (state === "speaking") {
      void listen();
      return;
    }
    if (state === "listening") {
      cleanupRecognition();
      setInterim("");
      setState("idle");
      return;
    }
    void listen();
  }, [cleanupRecognition, listen, state]);

  useEffect(() => {
    if (!open) {
      stopAll();
      return;
    }
    trackEvent("voice_opened");
    if (voiceGreeted) return;
    markVoiceGreeted();
    append({ role: "assistant", content: VOICE_GREETING });
    const id = ++requestId.current;
    setState("speaking");
    const timer = window.setTimeout(() => {
      void tts
        .speak(VOICE_GREETING, {
          voiceURI: selectedVoiceURI || selectPreferredMaleVoice()?.uri,
        })
        .then(() => {
          if (id === requestId.current) setState("idle");
        })
        .catch(() => {
          if (id === requestId.current) {
            setState("error");
            setError("I could not speak the welcome, but you can still talk or continue in chat.");
          }
        });
    }, 280);
    return () => window.clearTimeout(timer);
    // Greet once when the panel opens for this page session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el || !followBottom) return;
    el.scrollTop = el.scrollHeight;
  }, [turns, interim, followBottom]);

  const voiceChoices = useMemo(() => {
    const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    const pool = english.length ? english : voices;
    const preferred = selectPreferredMaleVoice(voices);
    const unique = new Map<string, VoiceOption>();
    if (preferred) unique.set(preferred.uri, preferred);
    pool.slice(0, 8).forEach((v) => unique.set(v.uri, v));
    return [...unique.values()];
  }, [voices]);

  const fallback = !supported || error.includes("isn't supported");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-end bg-black/60 p-4 backdrop-blur-md md:items-center md:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            stopAll();
            setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Tushant's AI companion"
        >
          <motion.div
            data-agent-panel
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="header-solid flex h-[min(720px,88vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(255,179,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="display text-xs tracking-[0.2em] text-amber-300">TUSHANT&apos;S AI COMPANION</p>
                <p className="text-xs text-[var(--muted)]">Voice · same portfolio brain as chat</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopAll();
                  setOpen(false);
                }}
                className="rounded-lg p-2 hover:bg-amber-400/10"
                aria-label="Close voice agent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex shrink-0 flex-col items-center px-4 pt-6">
              <button
                type="button"
                onClick={onOrb}
                disabled={state === "thinking" || fallback}
                aria-label={
                  state === "speaking"
                    ? "Stop speaking and start listening"
                    : state === "listening"
                      ? "Stop listening"
                      : "Start voice conversation"
                }
                className={`voice-orb voice-orb--${state}`}
                style={{ ["--voice-level" as string]: String(0.35 + level * 0.65) }}
              >
                <span className="voice-orb__glow" />
                <span className="voice-orb__ring" />
                <span className="voice-orb__core" />
              </button>
              <p className="mt-4 text-sm text-amber-200/90" aria-live="polite">
                {error ? STATUS.error : STATUS[state]}
              </p>
            </div>

            <div
              ref={transcriptRef}
              data-agent-scroll
              className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-3"
              style={{ WebkitOverflowScrolling: "touch" }}
              aria-live="polite"
              aria-label="Voice conversation transcript"
              onScroll={(e) => {
                const el = e.currentTarget;
                setFollowBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
              }}
            >
              {turns.map((m, i) => (
                <div key={`${m.role}-${i}`} className={m.role === "user" ? "text-right" : "text-left"}>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    {m.role === "user" ? "You" : "Tushant AI"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-[var(--text)]">{m.content}</p>
                </div>
              ))}
              {interim ? (
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-amber-300">Listening...</p>
                  <p className="mt-1 text-sm italic text-[var(--muted)]">{interim}</p>
                </div>
              ) : null}
            </div>

            {error ? <p className="px-4 pb-2 text-center text-xs text-amber-200/90">{error}</p> : null}

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-white/10 px-3 py-3">
              {!fallback ? (
                <button
                  type="button"
                  onClick={onOrb}
                  disabled={state === "thinking"}
                  className="min-h-11 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--ember)] px-4 text-xs font-semibold text-[var(--bg)]"
                >
                  {state === "listening" ? "Listening" : state === "speaking" ? "Interrupt" : "Talk"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={stopAll}
                aria-label="Stop voice conversation"
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-white/10 px-4 text-xs"
              >
                <Square className="h-3 w-3" aria-hidden />
                Stop
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAll();
                  setOpen(false);
                  setChatOpen(true);
                }}
                className="min-h-11 rounded-full border border-white/10 px-4 text-xs"
              >
                Continue with Chat
              </button>
              {error.includes("microphone") ? (
                <button
                  type="button"
                  onClick={() => void listen()}
                  className="min-h-11 rounded-full border border-white/10 px-4 text-xs"
                >
                  Try Again
                </button>
              ) : null}
            </div>

            {voiceChoices.length > 1 ? (
              <label className="flex items-center gap-2 border-t border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                Voice
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="min-h-8 flex-1 rounded-full border border-white/10 bg-transparent px-2 py-1 text-[11px] normal-case tracking-normal text-[var(--text)]"
                  aria-label="Choose speaking voice"
                >
                  {voiceChoices.map((v) => (
                    <option key={v.uri} value={v.uri}>
                      {v.name}
                      {v.likelyMale ? " · male" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
