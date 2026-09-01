export type VoiceOption = {
  uri: string;
  name: string;
  lang: string;
  likelyMale: boolean;
};

export type SpeakOptions = {
  voiceURI?: string;
  onStart?: () => void;
};

export type TtsEngine = {
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  stop: () => void;
  getVoices: () => VoiceOption[];
  getPreferredVoice: () => VoiceOption | null;
  setVoiceURI: (uri: string) => void;
};

const MALE_HINT =
  /\b(male|man|david|daniel|mark|james|alex|fred|arthur|thomas|ravi|aaron|george|ryan|andrew|christopher|eric|steffan|tony|guy|daniel|gordon|lee|nathan|oliver|tom|paul|richard|roger|brian|bruce|albert|wayne|google uk english male|microsoft david|microsoft mark)\b/i;
const FEMALE_HINT =
  /\b(female|woman|zira|samantha|karen|moira|tessa|veena|fiona|susan|hazel|heather|linda|victoria|catherine|aria|jenny|sara|google uk english female|microsoft zira)\b/i;

export function getAvailableVoices(): VoiceOption[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().map((v) => ({
    uri: v.voiceURI,
    name: v.name,
    lang: v.lang,
    likelyMale: MALE_HINT.test(`${v.name} ${v.lang}`) && !FEMALE_HINT.test(v.name),
  }));
}

export function selectPreferredMaleVoice(voices = getAvailableVoices()): VoiceOption | null {
  const english = voices.filter((v) => /^en/i.test(v.lang));
  const pool = english.length ? english : voices;
  return (
    pool.find((v) => v.likelyMale && /en-US/i.test(v.lang)) ||
    pool.find((v) => v.likelyMale) ||
    pool.find((v) => /en-US/i.test(v.lang) && !FEMALE_HINT.test(v.name)) ||
    pool.find((v) => /^en/i.test(v.lang) && !FEMALE_HINT.test(v.name)) ||
    pool[0] ||
    null
  );
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

/** Browser SpeechSynthesis. Swap this factory later for ElevenLabs without changing UI. */
export function createBrowserTts(): TtsEngine {
  let current: SpeechSynthesisUtterance | null = null;
  let selectedURI = "";

  const stop = () => {
    current = null;
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
  };

  const speak = (text: string, options: SpeakOptions = {}) =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("unsupported"));
        return;
      }
      stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.98;
      utterance.pitch = 0.95;
      utterance.volume = 1;
      const voice = findSynthVoice(options.voiceURI || selectedURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-US";
      }
      current = utterance;
      utterance.onstart = () => options.onStart?.();
      utterance.onend = () => {
        if (current === utterance) current = null;
        resolve();
      };
      utterance.onerror = (event) => {
        if (current === utterance) current = null;
        const err = (event as SpeechSynthesisErrorEvent).error;
        if (err === "interrupted" || err === "canceled") {
          resolve();
          return;
        }
        reject(new Error(err || "tts-error"));
      };
      window.setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 40);
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

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: Event & { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((ev: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
};

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
  "Hi, welcome. I'm Tushant's AI companion. It's great to have you here. Feel free to ask me about his work, his product experience, or anything you'd like to explore.";
