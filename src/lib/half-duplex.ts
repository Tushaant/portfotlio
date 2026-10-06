/**
 * Turn gate for the voice session.
 * Recognition stays open while a reply plays so the visitor can barge in.
 * Echo of the spoken line is discarded before it can become the next turn.
 */

export type HalfPhase = "idle" | "listening" | "thinking" | "speaking" | "interrupted";

export function createTurnGate() {
  let serial = 0;
  let currentId: string | null = null;

  return {
    current() {
      return currentId;
    },
    claim(text: string) {
      const normalized = text.trim().toLowerCase();
      if (!normalized || currentId) return null;
      serial += 1;
      currentId = `turn-${String(serial).padStart(3, "0")}`;
      return currentId;
    },
    finish(turnId: string) {
      if (currentId === turnId) currentId = null;
    },
  };
}

export function acceptsUserAudio(phase: HalfPhase) {
  return phase === "listening" || phase === "interrupted";
}

export function voiceLog(event: string, turnId: string, detail?: string) {
  if (process.env.NODE_ENV === "production") return;
  const stamp = new Date().toISOString();
  const body = detail ? `${turnId} "${detail}"` : turnId;
  console.info(`[${event}] ${body} ${stamp}`);
}
