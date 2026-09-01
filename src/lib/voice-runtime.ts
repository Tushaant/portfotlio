export type TtsEngine = {
  speak: (text: string) => Promise<void>;
  stop: () => void;
};

function pickVoice(synth: SpeechSynthesis) {
  const voices = synth.getVoices();
  const preferred =
    voices.find((v) => /en-US/i.test(v.lang) && /google|natural|premium/i.test(v.name)) ||
    voices.find((v) => /en-US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang));
  return preferred ?? null;
}

/** V1 browser TTS. Swap this implementation later for ElevenLabs without changing UI. */
export function createBrowserTts(): TtsEngine {
  let current: SpeechSynthesisUtterance | null = null;

  const stop = () => {
    current = null;
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
  };

  const speak = (text: string) =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("unsupported"));
        return;
      }
      stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      const voice = pickVoice(window.speechSynthesis);
      if (voice) utterance.voice = voice;
      current = utterance;
      utterance.onend = () => {
        if (current === utterance) current = null;
        resolve();
      };
      utterance.onerror = () => {
        if (current === utterance) current = null;
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });

  return { speak, stop };
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
  const cleaned = text
    .replace(/[`*_#]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\[.+?\]\s*/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length <= maxWords) return cleaned;
  return `${words.slice(0, maxWords).join(" ")}.`;
}
