"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useConversationStore } from "@/store/conversation-store";
import { AgentScroll } from "@/components/agent/AgentScroll";
import { trackEvent } from "@/lib/analytics";
import { VOICE_CONFIG } from "@/lib/voice-config";
import { createTurnDetector, isAgentEcho, transitionVoicePhase, type VoicePhase } from "@/lib/duplex-turn";
import {
  VOICE_GREETING,
  cleanTranscript,
  createBrowserTts,
  createSpeechRecognition,
  getAvailableVoices,
  isSpeechRecognitionSupported,
  selectPreferredMaleVoice,
  selectVoiceForProfile,
  profilesWithVoices,
  subscribeVoices,
  utteranceIsNoise,
  type SpeechRecognitionLike,
  type VoiceOption,
} from "@/lib/voice-runtime";

type VoiceState = VoicePhase | "muted";

const STATUS: Record<VoiceState, string> = {
  idle: "Talk with Tushant",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
  interrupted: "Listening...",
  muted: "Muted",
  error: "Something went wrong. Try again.",
};

function speechLevel(analyser: AnalyserNode, freq: Uint8Array) {
  analyser.getByteFrequencyData(freq as Uint8Array<ArrayBuffer>);
  const binHz = analyser.context.sampleRate / analyser.fftSize;
  let band = 0;
  let count = 0;
  for (let i = 0; i < freq.length; i += 1) {
    const hz = i * binHz;
    if (hz >= 250 && hz <= 3000) {
      band += freq[i];
      count += 1;
    }
  }
  return count ? band / count / 255 : 0;
}

export function VoiceAgent() {
  const open = useUIStore((s) => s.voiceAgentOpen);
  const setOpen = useUIStore((s) => s.setVoiceAgentOpen);
  const setChatOpen = useUIStore((s) => s.setAgentOpen);
  const turns = useConversationStore((s) => s.turns);
  const append = useConversationStore((s) => s.append);
  const voiceGreeted = useConversationStore((s) => s.voiceGreeted);
  const conversationId = useConversationStore((s) => s.conversationId);
  const markVoiceGreeted = useConversationStore((s) => s.markVoiceGreeted);

  const [state, setState] = useState<VoiceState>("listening");
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [profileId, setProfileId] = useState(VOICE_CONFIG.VOICE_ID);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [followBottom, setFollowBottom] = useState(true);
  const [level, setLevel] = useState(0);
  const [muted, setMuted] = useState(false);

  const tts = useMemo(() => createBrowserTts(), []);
  const phaseRef = useRef<VoiceState>("idle");
  const mutedRef = useRef(false);
  const sessionRef = useRef(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const endpointTimer = useRef(0);
  const restartTimer = useRef(0);
  const sttBargeTimer = useRef(0);
  const committedRef = useRef("");
  const interimRef = useRef("");
  const confidenceRef = useRef<number | null>(null);
  const spokenNowRef = useRef("");
  const voiceUriRef = useRef("");
  const detectorRef = useRef(createTurnDetector());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const greetedRef = useRef(false);

  const setPhase = useCallback((next: VoiceState) => {
    phaseRef.current = next;
    setState(next);
  }, []);

  const movePhase = useCallback(
    (event: Parameters<typeof transitionVoicePhase>[1]) => {
      const current = phaseRef.current === "muted" ? "idle" : phaseRef.current;
      setPhase(transitionVoicePhase(current, event));
    },
    [setPhase],
  );

  const applyVoices = useCallback(() => {
    const list = getAvailableVoices();
    setVoices(list);
    setSelectedVoiceURI((current) => {
      if (current && list.some((v) => v.uri === current)) return current;
      return selectVoiceForProfile(profileId, list)?.uri ?? selectPreferredMaleVoice(list)?.uri ?? "";
    });
  }, [profileId]);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (!open) return;
    applyVoices();
    return subscribeVoices(applyVoices);
  }, [open, applyVoices]);

  useEffect(() => {
    voiceUriRef.current = selectedVoiceURI;
    tts.setVoiceURI(selectedVoiceURI);
  }, [selectedVoiceURI, tts]);

  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    analyserRef.current = null;
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    setLevel(0);
  }, []);

  const stopRecognition = useCallback(() => {
    window.clearTimeout(restartTimer.current);
    window.clearTimeout(endpointTimer.current);
    window.clearTimeout(sttBargeTimer.current);
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
        /* already stopped */
      }
    }
  }, []);

  const teardown = useCallback(() => {
    sessionRef.current = false;
    requestId.current += 1;
    abortRef.current?.abort();
    tts.stop();
    stopRecognition();
    stopMic();
    detectorRef.current.disarmAgentSpeech();
    committedRef.current = "";
    interimRef.current = "";
    spokenNowRef.current = "";
    setInterim("");
    setError("");
    setMuted(false);
    mutedRef.current = false;
    setPhase("idle");
  }, [setPhase, stopMic, stopRecognition, tts]);

  const beginRecognitionRef = useRef<() => void>(() => undefined);
  const bargeRef = useRef<() => void>(() => undefined);
  const submitRef = useRef<(text: string) => void>(() => undefined);

  const scheduleEndpoint = useCallback(() => {
    window.clearTimeout(endpointTimer.current);
    endpointTimer.current = window.setTimeout(() => {
      const text = cleanTranscript(`${committedRef.current} ${interimRef.current}`);
      const echo = isAgentEcho(text, spokenNowRef.current);
      if (!sessionRef.current || mutedRef.current || echo || utteranceIsNoise(text, confidenceRef.current)) {
        if (echo) {
          committedRef.current = "";
          interimRef.current = "";
          setInterim("");
        }
        return;
      }
      if (!detectorRef.current.readyToAnswer(performance.now(), Boolean(text))) {
        scheduleEndpoint();
        return;
      }
      committedRef.current = "";
      interimRef.current = "";
      setInterim("");
      stopRecognition();
      submitRef.current(text);
      window.setTimeout(() => beginRecognitionRef.current(), 80);
    }, 160);
  }, [stopRecognition]);

  const beginRecognition = useCallback(() => {
    if (!sessionRef.current || mutedRef.current || !isSpeechRecognitionSupported()) return;
    stopRecognition();
    const rec = createSpeechRecognition();
    if (!rec) {
      setSupported(false);
      setPhase("error");
      setError("Voice input isn't supported in this browser. You can use the Chat Agent instead.");
      return;
    }
    rec.lang = VOICE_CONFIG.VOICE_LANGUAGE;
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onresult = (event) => {
      let finalText = "";
      let live = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const alt = event.results[i][0];
        const piece = alt?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalText += piece;
          if (typeof alt?.confidence === "number") confidenceRef.current = alt.confidence;
        } else live += piece;
      }
      committedRef.current = cleanTranscript(finalText);
      interimRef.current = live.trim();
      const shown = cleanTranscript(`${committedRef.current} ${interimRef.current}`);
      if (!shown || isAgentEcho(shown, spokenNowRef.current)) {
        setInterim("");
        window.clearTimeout(sttBargeTimer.current);
        return;
      }
      setInterim(shown);
      detectorRef.current.noteTranscript(performance.now());
      const agentTalking = phaseRef.current === "speaking" || phaseRef.current === "thinking";
      if (agentTalking && shown.length >= 3) {
        window.clearTimeout(sttBargeTimer.current);
        sttBargeTimer.current = window.setTimeout(() => bargeRef.current(), 120);
      }
      scheduleEndpoint();
    };

    rec.onerror = (event) => {
      if (!sessionRef.current || mutedRef.current) return;
      if (event.error === "not-allowed") {
        setPhase("error");
        setError("I can't access your microphone. You can continue through chat instead.");
        return;
      }
      if (event.error === "network") {
        setError("Speech recognition lost its network connection. I'm still listening.");
      }
      window.clearTimeout(restartTimer.current);
      restartTimer.current = window.setTimeout(() => beginRecognitionRef.current(), 300);
    };

    rec.onend = () => {
      if (!sessionRef.current || mutedRef.current || recRef.current !== rec) return;
      window.clearTimeout(restartTimer.current);
      restartTimer.current = window.setTimeout(() => beginRecognitionRef.current(), 200);
    };

    try {
      rec.start();
      if (phaseRef.current !== "speaking" && phaseRef.current !== "thinking" && phaseRef.current !== "error") {
        setPhase("listening");
      }
    } catch {
      window.clearTimeout(restartTimer.current);
      restartTimer.current = window.setTimeout(() => beginRecognitionRef.current(), 400);
    }
  }, [scheduleEndpoint, setPhase, stopRecognition]);

  useEffect(() => {
    beginRecognitionRef.current = beginRecognition;
  }, [beginRecognition]);

  const barge = useCallback(() => {
    if (!sessionRef.current || mutedRef.current) return;
    if (phaseRef.current !== "speaking" && phaseRef.current !== "thinking") return;
    window.clearTimeout(sttBargeTimer.current);
    requestId.current += 1;
    abortRef.current?.abort();
    tts.stop();
    detectorRef.current.disarmAgentSpeech();
    spokenNowRef.current = "";
    movePhase("onset");
    window.setTimeout(() => {
      if (phaseRef.current === "interrupted") movePhase("resume");
    }, 180);
    trackEvent("user_interrupted", { agentType: "voice" });
  }, [movePhase, tts]);

  useEffect(() => {
    bargeRef.current = barge;
  }, [barge]);

  const askBrain = useCallback(
    async (transcript: string) => {
      const id = ++requestId.current;
      movePhase("utterance");
      setError("");
      append({ role: "user", content: transcript });
      trackEvent("voice_message_sent", {
        agentType: "voice",
        conversationId: useConversationStore.getState().conversationId,
        text: transcript.slice(0, 240),
      });
      const started = Date.now();
      try {
        const history = useConversationStore.getState().window();
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const timer = window.setTimeout(() => controller.abort(), 12000);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ message: transcript, channel: "voice", history }),
        });
        window.clearTimeout(timer);
        const data = (await res.json()) as {
          answer?: string;
          displayText?: string;
          speechText?: string;
          knowledgeGap?: boolean;
        };
        if (id !== requestId.current || !sessionRef.current) return;
        const answer = String(
          data.displayText || data.answer || "I'm having a little trouble getting that response. Give me another try.",
        );
        const speech = String(data.speechText || answer);
        append({ role: "assistant", content: answer });
        trackEvent(data.knowledgeGap ? "knowledge_gap" : "response_success", {
          agentType: "voice",
          conversationId: useConversationStore.getState().conversationId,
          llmLatency: Date.now() - started,
        });
        spokenNowRef.current = speech;
        detectorRef.current.armAgentSpeech(performance.now());
        movePhase("reply");
        try {
          await tts.speak(speech, { voiceURI: voiceUriRef.current });
        } catch {
          if (id !== requestId.current) return;
          setError("I could not speak that answer aloud. You can still read it here.");
          detectorRef.current.disarmAgentSpeech();
          spokenNowRef.current = "";
          setPhase("listening");
          return;
        }
        if (id !== requestId.current) return;
        if (isAgentEcho(cleanTranscript(`${committedRef.current} ${interimRef.current}`), speech)) {
          committedRef.current = "";
          interimRef.current = "";
          setInterim("");
        }
        detectorRef.current.disarmAgentSpeech();
        spokenNowRef.current = "";
        setError("");
        setPhase(mutedRef.current ? "muted" : "listening");
      } catch (err) {
        if (id !== requestId.current) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("I'm having a little trouble getting that response. Give me another try.");
        setPhase("error");
        trackEvent("response_failure", { agentType: "voice" });
      }
    },
    [append, movePhase, setPhase, tts],
  );

  useEffect(() => {
    submitRef.current = (text: string) => {
      void askBrain(text);
    };
  }, [askBrain]);

  const speakLine = useCallback(
    async (line: string, id: number) => {
      spokenNowRef.current = line;
      detectorRef.current.armAgentSpeech(performance.now());
      movePhase("reply");
      try {
        await tts.speak(line, { voiceURI: voiceUriRef.current || selectPreferredMaleVoice()?.uri });
      } catch {
        /* greeting stays on screen */
      }
      if (id !== requestId.current) return;
      detectorRef.current.disarmAgentSpeech();
      spokenNowRef.current = "";
      if (!mutedRef.current && sessionRef.current) setPhase("listening");
    },
    [movePhase, setPhase, tts],
  );

  useEffect(() => {
    if (!open) {
      teardown();
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      setSupported(false);
      setPhase("error");
      setError("Voice input isn't supported in this browser. You can use the Chat Agent instead.");
      return;
    }
    sessionRef.current = true;
    greetedRef.current = voiceGreeted;
    setPhase("listening");
    trackEvent("voice_opened", { agentType: "voice" });
    trackEvent("voice_session_started", { agentType: "voice", conversationId });

    let cancelled = false;
    const boot = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (cancelled || !sessionRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        micStreamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.45;
        ctx.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
        const freq = new Uint8Array(analyser.frequencyBinCount);
        detectorRef.current = createTurnDetector();
        const tick = () => {
          if (!sessionRef.current || !analyserRef.current) return;
          const levelNow = speechLevel(analyserRef.current, freq);
          setLevel(Math.min(1, levelNow * 3.2));
          if (!mutedRef.current) {
            const sample = detectorRef.current.push(levelNow, performance.now());
            if (sample.barge) bargeRef.current();
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
        beginRecognitionRef.current();
        if (!greetedRef.current) {
          greetedRef.current = true;
          markVoiceGreeted();
          append({ role: "assistant", content: VOICE_GREETING });
          const id = ++requestId.current;
          window.setTimeout(() => {
            if (!cancelled && sessionRef.current) void speakLine(VOICE_GREETING, id);
          }, 160);
        }
      } catch {
        if (cancelled) return;
        setPhase("error");
        setError("Microphone access is required for voice conversations.");
      }
    };
    void boot();
    return () => {
      cancelled = true;
      teardown();
    };
    // Session starts once per open. Later renders must not reopen the mic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    micStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    if (next) {
      requestId.current += 1;
      abortRef.current?.abort();
      tts.stop();
      stopRecognition();
      detectorRef.current.disarmAgentSpeech();
      setInterim("");
      setPhase("muted");
      return;
    }
    setPhase("listening");
    beginRecognition();
  };

  const voiceChoices = useMemo(() => profilesWithVoices(voices), [voices]);
  const fallback = !supported || error.includes("isn't supported");
  const status = state === "error" ? STATUS.error : STATUS[state];

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
                <p className="display text-xs tracking-[0.2em] text-amber-300">TUSHANT AI</p>
                <p className="text-xs text-[var(--muted)]">Indian English · AI portfolio representative</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setChatOpen(true);
                  }}
                  className="rounded-lg px-2 py-1 text-[11px] text-[var(--muted)] hover:bg-amber-400/10"
                >
                  Continue with Chat
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-amber-400/10"
                  aria-label="Close voice agent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center px-4 pt-6">
              <div
                className={`voice-orb voice-orb--${state === "muted" ? "idle" : state}`}
                style={{ ["--voice-level" as string]: String(0.35 + level * 0.65) }}
                role="img"
                aria-label={status}
                data-voice-state={state}
              >
                <span className="voice-orb__glow" />
                <span className="voice-orb__ring" />
                <span className="voice-orb__core" />
              </div>
              <p className="mt-4 text-sm text-amber-200/90" aria-live="polite" data-voice-status>
                {status}
              </p>
              {!fallback ? (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={muted}
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                  data-voice-mute
                  className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[var(--muted)]"
                >
                  {muted ? <MicOff className="h-3.5 w-3.5" aria-hidden /> : <Mic className="h-3.5 w-3.5" aria-hidden />}
                </button>
              ) : null}
            </div>

            <AgentScroll
              follow={followBottom}
              onFollowChange={setFollowBottom}
              scrollKey={`${turns.length}-${interim}`}
              className="mt-4 space-y-3 px-4 pb-3"
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
                  <p className="text-[10px] uppercase tracking-[0.16em] text-amber-300">Hearing</p>
                  <p className="mt-1 text-sm italic text-[var(--muted)]">{interim}</p>
                </div>
              ) : null}
            </AgentScroll>
            {error ? <p className="px-4 pb-2 text-center text-xs text-amber-200/90">{error}</p> : null}
            {fallback ? (
              <div className="px-4 pb-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setChatOpen(true);
                  }}
                  className="min-h-11 rounded-full border border-white/10 px-4 text-xs"
                >
                  Continue with Chat
                </button>
              </div>
            ) : null}

            {voiceChoices.length > 1 ? (
              <label className="flex items-center gap-2 border-t border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                Voice
                <select
                  value={profileId}
                  onChange={(e) => {
                    const next = e.target.value;
                    setProfileId(next as typeof profileId);
                    const match = selectVoiceForProfile(next, voices);
                    if (match) setSelectedVoiceURI(match.uri);
                  }}
                  className="min-h-8 flex-1 rounded-full border border-white/10 bg-transparent px-2 py-1 text-[11px] normal-case tracking-normal text-[var(--text)]"
                  aria-label="Choose speaking voice"
                >
                  {voiceChoices.map(({ profile, voice }) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.label}
                      {voice ? ` · ${voice.name}` : ""}
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
