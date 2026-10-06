/**
 * Turn-taking for a full-duplex browser session.
 * Energy, pauses, and echo checks live here so barge-in does not depend on a button.
 * A short spike (keyboard, breath, click) must not count as speech.
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
  armAgentSpeech: (now: number) => void;
  disarmAgentSpeech: () => void;
  agentIsSpeaking: () => boolean;
};

const MIN_LEVEL = 0.05;
const FLOOR_GAIN = 3.5;
const ONSET_MS = 150;
const BARGE_MS = 230;
const BARGE_GRACE_MS = 280;
const ENDPOINT_MS = 680;
const POST_VOICE_MS = 260;

export function createTurnDetector(): TurnDetector {
  let floor = 0.012;
  let voicedRun = 0;
  let lastVoicedAt = 0;
  let lastTranscriptAt = 0;
  let agentSpeech = false;
  let agentArmedAt = 0;
  let barged = false;
  let lastAt = 0;

  const threshold = () => Math.max(MIN_LEVEL, floor * FLOOR_GAIN);

  return {
    push(level, now) {
      const dt = lastAt ? Math.min(80, Math.max(0, now - lastAt)) : 16;
      lastAt = now;
      const hot = level >= threshold();
      if (hot) {
        voicedRun += dt;
        lastVoicedAt = now;
      } else {
        voicedRun = 0;
        if (!agentSpeech) floor = floor * 0.96 + Math.max(0, level) * 0.04;
      }
      const voiced = voicedRun >= ONSET_MS;
      let barge = false;
      if (
        agentSpeech &&
        !barged &&
        now - agentArmedAt >= BARGE_GRACE_MS &&
        voicedRun >= BARGE_MS
      ) {
        barged = true;
        barge = true;
      }
      return { barge, voiced };
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
    armAgentSpeech(now) {
      agentSpeech = true;
      agentArmedAt = now;
      barged = false;
      voicedRun = 0;
    },
    disarmAgentSpeech() {
      agentSpeech = false;
      barged = false;
      voicedRun = 0;
    },
    agentIsSpeaking() {
      return agentSpeech;
    },
  };
}

function tokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/** True when the recognizer is hearing the agent, not the visitor. */
export function isAgentEcho(heard: string, agentText: string) {
  const heardWords = tokens(heard);
  const agentWords = new Set(tokens(agentText));
  if (heardWords.length < 4 || agentWords.size < 4) return false;
  const overlap = heardWords.filter((word) => agentWords.has(word)).length;
  return overlap / heardWords.length >= 0.72;
}

/** Short lead for a spoken correction. Empty when the turn is not an interruption. */
export function interruptionLead(question: string) {
  const spoken = question.trim();
  if (/^(wait|hold on|sorry)\b/i.test(spoken) && /\bspecifically\b/i.test(spoken)) return "Yes, exactly.";
  if (/^specifically\b/i.test(spoken)) return "Yes, exactly.";
  if (/^(wait|hold on)\b/i.test(spoken)) return "Yes.";
  return "";
}
