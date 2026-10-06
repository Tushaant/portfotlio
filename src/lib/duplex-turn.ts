/**
 * Turn-taking for a full-duplex browser session.
 * Speaker audio leaks into the microphone, so energy alone must not cancel playback.
 * Barge-in waits for words that are not the line currently being spoken.
 * A short spike, breath, or the agent's own "yes" must not take the turn.
 */

export type VoicePhase = "idle" | "listening" | "thinking" | "speaking" | "interrupted" | "error";

export type VoiceEvent = "session" | "utterance" | "reply" | "onset" | "resume" | "end" | "fail";

export function transitionVoicePhase(current: VoicePhase, event: VoiceEvent): VoicePhase {
  if (event === "end") return "idle";
  if (event === "fail") return "error";
  if (event === "session") return "listening";
  if (event === "onset") return current === "speaking" || current === "thinking" ? "interrupted" : current;
  if (event === "resume") return "listening";
  if (event === "utterance") return "thinking";
  if (event === "reply") return "speaking";
  return current;
}

export type TurnSample = {
  barge: boolean;
  voiced: boolean;
};

export type TurnDetector = {
  push: (level: number, now: number) => TurnSample;
  noteTranscript: (now: number) => void;
  readyToAnswer: (now: number, hasText: boolean) => boolean;
  armAgentSpeech: () => void;
  disarmAgentSpeech: () => void;
  agentIsSpeaking: () => boolean;
};

const MIN_LEVEL = 0.05;
const FLOOR_GAIN = 3.5;
const ONSET_MS = 150;
const ENDPOINT_MS = 680;
const POST_VOICE_MS = 260;

export function createTurnDetector(): TurnDetector {
  let floor = 0.012;
  let voicedRun = 0;
  let lastVoicedAt = 0;
  let lastTranscriptAt = 0;
  let agentSpeech = false;
  let lastAt = 0;

  const threshold = () => Math.max(MIN_LEVEL, floor * FLOOR_GAIN);

  return {
    push(level, now) {
      const dt = lastAt ? Math.min(80, Math.max(0, now - lastAt)) : 16;
      lastAt = now;
      const hot = !agentSpeech && level >= threshold();
      if (hot) {
        voicedRun += dt;
        lastVoicedAt = now;
      } else {
        voicedRun = 0;
        if (!agentSpeech) floor = floor * 0.96 + Math.max(0, level) * 0.04;
      }
      const voiced = !agentSpeech && voicedRun >= ONSET_MS;
      return { barge: false, voiced };
    },
    noteTranscript(now) {
      lastTranscriptAt = now;
    },
    readyToAnswer(now, hasText) {
      if (!hasText || agentSpeech || !lastTranscriptAt) return false;
      if (now - lastTranscriptAt < ENDPOINT_MS) return false;
      if (lastVoicedAt && now - lastVoicedAt < POST_VOICE_MS) return false;
      return true;
    },
    armAgentSpeech() {
      agentSpeech = true;
      voicedRun = 0;
    },
    disarmAgentSpeech() {
      agentSpeech = false;
      voicedRun = 0;
    },
    agentIsSpeaking() {
      return agentSpeech;
    },
  };
}

const FILLERS = new Set([
  "yes",
  "yeah",
  "yep",
  "ya",
  "ok",
  "okay",
  "hmm",
  "uh",
  "um",
  "ah",
  "oh",
  "hi",
  "hello",
  "right",
  "exactly",
  "so",
  "and",
  "the",
  "a",
]);

/** Words that start a correction even when they are only one or two letters. */
const INTERRUPTS = new Set(["no", "nah", "wait", "stop", "hold", "actually", "sorry", "wrong"]);

function normalizeHeard(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsOf(text: string) {
  return normalizeHeard(text).split(" ").filter(Boolean);
}

/** True when every heard word is a whole word of the line being spoken. */
export function isAgentEcho(heard: string, agentText: string) {
  const heardWords = wordsOf(heard);
  const agentWords = wordsOf(agentText);
  if (!heardWords.length || !agentWords.length) return false;
  const agentSet = new Set(agentWords);
  if (heardWords.every((word) => agentSet.has(word))) return true;
  const agentStartsYes = ["yes", "yeah", "ok", "okay", "exactly", "right"].includes(agentWords[0]);
  if (
    agentStartsYes &&
    heardWords.length <= 3 &&
    heardWords.every((word) => FILLERS.has(word) || agentSet.has(word))
  ) {
    return true;
  }
  return false;
}

export type HeardKind = "echo" | "noise" | "user";

/**
 * While the agent is speaking, only novel words count as the visitor.
 * "Yes" played through the speaker is echo. "Wait" or "IVY" is the visitor.
 */
export function classifyHeard(heard: string, agentText: string): HeardKind {
  const heardWords = wordsOf(heard);
  if (!heardWords.length) return "noise";
  if (agentText && isAgentEcho(heard, agentText)) return "echo";
  if (agentText) {
    const agentSet = new Set(wordsOf(agentText));
    const novel = heardWords.filter((word) => !agentSet.has(word) && !FILLERS.has(word));
    if (novel.some((word) => INTERRUPTS.has(word) || word.length > 2)) return "user";
    return "echo";
  }
  if (heardWords.some((word) => INTERRUPTS.has(word))) return "user";
  const meaningful = heardWords.filter((word) => !FILLERS.has(word) && word.length > 2);
  return meaningful.length ? "user" : "noise";
}

/** Short lead for a spoken correction. Empty when the turn is not an interruption. */
export function interruptionLead(question: string) {
  const spoken = question.trim();
  if (/^(wait|hold on|sorry)\b/i.test(spoken) && /\bspecifically\b/i.test(spoken)) return "Yes, exactly.";
  if (/^specifically\b/i.test(spoken)) return "Yes, exactly.";
  if (/^(wait|hold on)\b/i.test(spoken)) return "Yes.";
  return "";
}
