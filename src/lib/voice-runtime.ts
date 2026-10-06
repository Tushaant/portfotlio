import { getVoiceProfile, VOICE_CONFIG, VOICE_PROFILES, type VoiceProfile, type VoiceProfileId } from "./voice-config";

export type VoiceOption = {
  uri: string;
  name: string;
  lang: string;
  likelyMale: boolean;
  likelyFemale: boolean;
  indianEnglish: boolean;
};

export type SpeakOptions = {
  voiceURI?: string;
  turnId?: string;
  onStart?: () => void;
};

export type PlaybackResult = "played" | "ignored" | "stopped";

type HeldAudio = {
  context: AudioContext;
  hold: OscillatorNode | null;
};

let heldAudio: HeldAudio | null = null;

export function audioDevice() {
  if (typeof navigator === "undefined") return { mobile: false, platform: "desktop" };
  const ua = navigator.userAgent || "";
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return { mobile: true, platform: "iOS" };
  if (/Android/i.test(ua)) return { mobile: true, platform: "Android" };
  return { mobile: false, platform: "desktop" };
}

export function logMobileAudio(fields: Record<string, unknown>) {
  const device = audioDevice();
  console.info(
    `[MOBILE_AUDIO] ${JSON.stringify({
      device: device.mobile ? "mobile" : "desktop",
      platform: device.platform,
      ...fields,
    })}`,
  );
}

/** One context for the voice session. Created from the tap that opens voice. */
export function getSessionAudioContext() {
  if (typeof window === "undefined") return null;
  if (heldAudio && heldAudio.context.state !== "closed") return heldAudio.context;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const context = new Ctx();
  let hold: OscillatorNode | null = null;
  if (audioDevice().mobile) {
    hold = context.createOscillator();
    const gain = context.createGain();
    gain.gain.value = 0;
    hold.frequency.value = 440;
    hold.connect(gain);
    gain.connect(context.destination);
    hold.start();
  }
  heldAudio = { context, hold };
  logMobileAudio({ event: "audio-context-created", audioContextState: context.state, destination: "audioContext.destination" });
  return context;
}

export function releaseSessionAudioContext() {
  const current = heldAudio;
  heldAudio = null;
  if (!current || current.context.state === "closed") return;
  try {
    current.hold?.stop();
  } catch {
    /* already stopped */
  }
  void current.context.close().catch(() => undefined);
}

/**
 * Must run inside the tap that opens the voice session.
 * speechSynthesis.speak() after an await is blocked on iOS unless this ran in the gesture.
 */
export function primeSpeechOutput() {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    logMobileAudio({ event: "prime", error: "speechSynthesis-missing", playRequested: false, playStarted: false });
    return;
  }
  const synth = window.speechSynthesis;
  const context = getSessionAudioContext();
  if (context && context.state === "suspended") {
    void context.resume().then(
      () => logMobileAudio({ event: "audio-context-resume", audioContextState: context.state }),
      (error: unknown) => console.error("[AUDIO_ERROR] AudioContext.resume rejected", error),
    );
  }
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session && audioDevice().mobile) {
    try {
      session.type = "play-and-record";
    } catch (error) {
      console.error("[AUDIO_ERROR] audioSession", error);
    }
  }
  try {
    synth.resume();
  } catch (error) {
    console.error("[AUDIO_ERROR] speechSynthesis.resume rejected", error);
  }
  const unlock = new SpeechSynthesisUtterance(" ");
  unlock.volume = 0;
  unlock.rate = 2;
  unlock.lang = "en-US";
  unlock.onstart = () => logMobileAudio({ event: "unlock-start", playStarted: true, audioContextState: context?.state ?? "none" });
  unlock.onend = () => logMobileAudio({ event: "unlock-end", playStarted: true });
  unlock.onerror = (event) => {
    const reason = (event as SpeechSynthesisErrorEvent).error || "unlock-error";
    console.error("[AUDIO_ERROR] unlock utterance", reason);
    logMobileAudio({ event: "unlock-error", playStarted: false, error: reason });
  };
  console.info("[TTS] unlock mimeType=speechSynthesis/utterance bytes=1 codec=browser-tts channels=1");
  synth.speak(unlock);
  console.info("[AUDIO] unlock speak() requested");
  logMobileAudio({
    event: "prime",
    mimeType: "speechSynthesis/utterance",
    bytes: 1,
    codec: "browser-tts",
    audioContextState: context?.state ?? "none",
    paused: synth.paused,
    speaking: synth.speaking,
    pending: synth.pending,
    playRequested: true,
    audioSession: session?.type ?? "unavailable",
  });
}

export type TtsEngine = {
  speak: (text: string, options?: SpeakOptions) => Promise<PlaybackResult>;
  stop: () => void;
  getVoices: () => VoiceOption[];
  getPreferredVoice: () => VoiceOption | null;
  setVoiceURI: (uri: string) => void;
};

const MALE_HINT =
  /\b(male|man|david|daniel|mark|james|alex|fred|arthur|thomas|ravi|hemant|prabhat|aditya|aarav|arjun|aaron|george|ryan|andrew|christopher|eric|steffan|tony|guy|gordon|lee|nathan|oliver|tom|paul|richard|roger|brian|bruce)\b/i;
const FEMALE_HINT =
  /\b(female|woman|zira|samantha|karen|moira|tessa|veena|heera|swara|fiona|susan|hazel|heather|linda|victoria|catherine|aria|jenny|sara|neerja|aditi)\b/i;

export function getAvailableVoices(): VoiceOption[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().map((v) => {
    const blob = `${v.name} ${v.lang}`;
    const likelyFemale = FEMALE_HINT.test(blob);
    return {
      uri: v.voiceURI,
      name: v.name,
      lang: v.lang,
      likelyFemale,
      likelyMale: MALE_HINT.test(blob) && !likelyFemale,
      indianEnglish: /^en-IN/i.test(v.lang),
    };
  });
}

function scoreVoice(voice: VoiceOption, profile: VoiceProfile) {
  const english = /^en/i.test(voice.lang);
  if (!english) return -1;
  let score = 1;
  const indian = voice.indianEnglish;
  if (profile.locale === "en-IN") score += indian ? 8 : 0;
  else score += indian ? 0 : 3;
  if (profile.gender === "male") {
    if (voice.likelyMale) score += 6;
    if (voice.likelyFemale) score -= 8;
    if (!voice.likelyMale && !voice.likelyFemale) score += profile.locale === "en-IN" && indian ? 3 : 1;
  } else {
    if (voice.likelyFemale) score += 6;
    if (voice.likelyMale) score -= 8;
  }
  if (profile.locale !== "en-IN" && /en-US/i.test(voice.lang)) score += 2;
  return score;
}

export function selectVoiceForProfile(
  profileId: VoiceProfileId | string = VOICE_CONFIG.VOICE_ID,
  voices = getAvailableVoices(),
): VoiceOption | null {
  const profile = getVoiceProfile(profileId);
  const ranked = voices
    .map((voice) => ({ voice, score: scoreVoice(voice, profile) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.voice ?? null;
}

/** Default portfolio voice: Indian Professional Male, with a natural English fallback. */
export function selectPreferredMaleVoice(voices = getAvailableVoices()): VoiceOption | null {
  return selectVoiceForProfile(VOICE_CONFIG.VOICE_ID, voices);
}

export function profilesWithVoices(voices = getAvailableVoices()) {
  return VOICE_PROFILES.map((profile) => ({
    profile,
    voice: selectVoiceForProfile(profile.id, voices),
  })).filter((row) => row.voice);
}

function findSynthVoice(uri?: string) {
  if (typeof window === "undefined") return null;
  const list = window.speechSynthesis.getVoices();
  if (uri) {
    const match = list.find((v) => v.voiceURI === uri);
    if (match) return match;
  }
  const preferred = selectPreferredMaleVoice();
  return preferred
    ? list.find((v) => v.voiceURI === preferred.uri) ?? null
    : null;
}

/** One browser utterance at a time. A second speak call does not cancel the first. */
export function createBrowserTts(): TtsEngine {
  let current: SpeechSynthesisUtterance | null = null;
  let selectedURI = "";
  let keepAlive = 0;

  const clearKeepAlive = () => {
    if (!keepAlive) return;
    window.clearInterval(keepAlive);
    keepAlive = 0;
  };

  const stop = () => {
    clearKeepAlive();
    current = null;
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
  };

  const speak = (text: string, options: SpeakOptions = {}) =>
    new Promise<PlaybackResult>((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("unsupported"));
        return;
      }
      if (current) {
        resolve("ignored");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const profile = getVoiceProfile(VOICE_CONFIG.VOICE_ID);
      utterance.lang = profile.language;
      utterance.rate = VOICE_CONFIG.VOICE_SPEED;
      utterance.pitch = profile.gender === "male" ? 0.96 : 1;
      utterance.volume = 1;
      const voice = findSynthVoice(options.voiceURI || selectedURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || profile.language;
      }
      current = utterance;
      let active = utterance;
      let settled = false;
      let startWatch = 0;
      const finish = (result: PlaybackResult) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(startWatch);
        if (current === active) current = null;
        clearKeepAlive();
        resolve(result);
      };
      const device = audioDevice();
      const voices = window.speechSynthesis.getVoices();
      if (!voice && device.mobile && !voices.some((item) => /^en-IN/i.test(item.lang))) {
        utterance.lang = /^en/i.test(utterance.lang) ? "en-US" : utterance.lang;
      }
      let started = false;
      let retried = false;
      const describe = () => ({
        mimeType: "speechSynthesis/utterance",
        bytes: text.length,
        codec: "browser-tts",
        sampleRate: "browser-managed",
        channels: 1,
        lang: utterance.lang,
        volume: utterance.volume,
        rate: utterance.rate,
        audioContextState: heldAudio?.context.state ?? "none",
        paused: window.speechSynthesis.paused,
        speaking: window.speechSynthesis.speaking,
        pending: window.speechSynthesis.pending,
      });
      console.info(`[TTS] ${JSON.stringify({ event: "speak", turnId: options.turnId ?? "", ...describe() })}`);
      utterance.onstart = () => {
        started = true;
        console.info(`[AUDIO] playback started ${JSON.stringify(describe())}`);
        logMobileAudio({ event: "playback-start", playRequested: true, playStarted: true, ...describe() });
        options.onStart?.();
      };
      utterance.onend = () => {
        console.info(`[AUDIO] playback ended ${JSON.stringify(describe())}`);
        logMobileAudio({ event: "playback-end", playStarted: started, ...describe() });
        finish("played");
      };
      const queueUtterance = (next: SpeechSynthesisUtterance) => {
        const context = getSessionAudioContext();
        if (context?.state === "suspended") {
          void context.resume().catch((error: unknown) => console.error("[AUDIO_ERROR] AudioContext.resume rejected", error));
        }
        try {
          window.speechSynthesis.resume();
        } catch (error) {
          console.error("[AUDIO_ERROR] speechSynthesis.resume rejected", error);
        }
        logMobileAudio({ event: "play-requested", playRequested: true, playStarted: false, ...describe() });
        window.speechSynthesis.speak(next);
      };
      utterance.onerror = (event) => {
        const err = (event as SpeechSynthesisErrorEvent).error || "unknown";
        console.error("[AUDIO_ERROR] speechSynthesis", err);
        logMobileAudio({ event: "playback-error", playRequested: true, playStarted: started, error: err, ...describe() });
        if (err === "interrupted" || err === "canceled") {
          finish("stopped");
          return;
        }
        if (err === "not-allowed" && !retried) {
          retried = true;
          const again = new SpeechSynthesisUtterance(text);
          again.lang = utterance.lang;
          again.rate = utterance.rate;
          again.pitch = utterance.pitch;
          again.volume = 1;
          again.voice = utterance.voice;
          again.onstart = utterance.onstart;
          again.onend = utterance.onend;
          again.onerror = utterance.onerror;
          active = again;
          current = again;
          console.info("[AUDIO] retry speak() after not-allowed");
          queueUtterance(again);
          return;
        }
        if (err === "not-allowed" || err === "synthesis-failed" || err === "synthesis-unavailable") {
          finish("played");
          return;
        }
        if (current === utterance) current = null;
        clearKeepAlive();
        reject(new Error(err || "tts-error"));
      };
      queueUtterance(utterance);
      startWatch = window.setTimeout(() => {
        if (started || settled) return;
        const synth = window.speechSynthesis;
        logMobileAudio({
          event: "start-watch",
          playRequested: true,
          playStarted: false,
          speaking: synth.speaking,
          paused: synth.paused,
          pending: synth.pending,
          audioContextState: heldAudio?.context.state ?? "none",
        });
        try {
          synth.resume();
        } catch (error) {
          console.error("[AUDIO_ERROR] resume during start watch", error);
        }
      }, 1200);
      keepAlive = window.setInterval(() => {
        const synth = window.speechSynthesis;
        if (!synth.speaking) return;
        if (audioDevice().mobile) {
          try {
            synth.resume();
          } catch (error) {
            console.error("[AUDIO_ERROR] mobile resume", error);
          }
          return;
        }
        if (synth.paused) return;
        synth.pause();
        synth.resume();
      }, audioDevice().mobile ? 8000 : 12000);
    });

  return {
    speak,
    stop,
    getVoices: getAvailableVoices,
    getPreferredVoice: () => selectPreferredMaleVoice(),
    setVoiceURI: (uri: string) => {
      selectedURI = uri;
    },
  };
}

export function subscribeVoices(onChange: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return () => {};
  }
  const synth = window.speechSynthesis;
  const handler = () => onChange();
  synth.addEventListener("voiceschanged", handler);
  synth.onvoiceschanged = handler;
  const retries = [0, 150, 400, 1200].map((ms) => window.setTimeout(onChange, ms));
  return () => {
    synth.removeEventListener("voiceschanged", handler);
    retries.forEach((id) => window.clearTimeout(id));
  };
}

export function createSpeechRecognition() {
  const Ctor = getSpeechRecognitionCtor();
  return Ctor ? new Ctor() : null;
}

export type SpeechAlt = { transcript: string; confidence?: number };

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((ev: Event & {
        resultIndex: number;
        results: { length: number; [i: number]: { isFinal: boolean; [j: number]: SpeechAlt } };
      }) => void)
    | null;
  onerror: ((ev: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function cleanTranscript(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^(um+|uh+|hmm+|er+)\b[,.\s]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function utteranceIsNoise(text: string, confidence: number | null) {
  if (!text || text.length < 2) return true;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 1 && /^(um+|uh+|hmm+|er+)$/i.test(words[0])) return true;
  if (confidence !== null && confidence > 0 && confidence < 0.35 && words.length < 3) return true;
  return false;
}

export function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionCtor());
}

export function toSpoken(text: string, maxWords = 110) {
  let cleaned = text
    .replace(/[`*_#]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\[.+?\]\s*/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  cleaned = cleaned.replace(
    /\bthere are three (things|factors|parts):\s*one,?\s*/i,
    "I'd look at three things here. First, ",
  );
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length <= maxWords) return cleaned;
  return `${words.slice(0, maxWords).join(" ")}.`;
}

export const VOICE_GREETING =
  "Hi, welcome. I'm Tushant AI, the professional representative for Tushant Sharma. You can ask about his product work, the AI products he's built, or how he approaches a role. Whenever you're ready, just start talking.";
