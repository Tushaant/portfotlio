/**
 * Half-duplex turns. Speech recognition stays closed while a reply is playing,
 * so speaker audio cannot become the next user transcript.
 */

export type HalfPhase = "idle" | "listening" | "thinking" | "speaking";

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
  return phase === "listening";
}

export function voiceLog(event: string, turnId: string, detail?: string) {
  const stamp = new Date().toISOString();
  const body = detail ? `${turnId} "${detail}"` : turnId;
  console.info(`[${event}] ${body} ${stamp}`);
}
