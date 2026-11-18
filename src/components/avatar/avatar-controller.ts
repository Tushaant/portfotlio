import type { VoicePhase } from "@/store/ui-store";

/** Oculus/ARKit-style viseme ids. A rigged GLB can map these onto blendshapes. */
export type AvatarViseme =
  | "sil"
  | "PP"
  | "FF"
  | "TH"
  | "DD"
  | "kk"
  | "CH"
  | "SS"
  | "nn"
  | "RR"
  | "aa"
  | "E"
  | "I"
  | "O"
  | "U";

export type AvatarPose = {
  state: VoicePhase;
  speaking: boolean;
  audioLevel: number;
  viseme: AvatarViseme;
  mouthOpen: number;
  blink: number;
  drive: number;
  breath: number;
  headX: number;
  headY: number;
};

export const avatarPose: AvatarPose = {
  state: "idle",
  speaking: false,
  audioLevel: 0,
  viseme: "sil",
  mouthOpen: 0,
  blink: 0,
  drive: 0.2,
  breath: 0,
  headX: 0,
  headY: 0,
};

let lastVisemeAt = 0;
let blinkClock = 0;
let nextBlink = 2.6;
let blinking = false;
let blinkPhase = 0;

export function visemeFor(sample: string): { viseme: AvatarViseme; open: number } {
  const ch = sample.toLowerCase();
  if ("aáàâä".includes(ch)) return { viseme: "aa", open: 0.9 };
  if ("eéèê".includes(ch)) return { viseme: "E", open: 0.55 };
  if ("iíìî".includes(ch)) return { viseme: "I", open: 0.32 };
  if ("oóòôö".includes(ch)) return { viseme: "O", open: 0.72 };
  if ("uúùûü".includes(ch)) return { viseme: "U", open: 0.4 };
  if ("mbp".includes(ch)) return { viseme: "PP", open: 0.06 };
  if ("fv".includes(ch)) return { viseme: "FF", open: 0.18 };
  if ("sz".includes(ch)) return { viseme: "SS", open: 0.16 };
  if ("lr".includes(ch)) return { viseme: "RR", open: 0.28 };
  if ("kgq".includes(ch)) return { viseme: "kk", open: 0.2 };
  if ("cj".includes(ch)) return { viseme: "CH", open: 0.26 };
  if (ch === "n") return { viseme: "nn", open: 0.2 };
  if (!/[a-z]/.test(ch)) return { viseme: "sil", open: 0.02 };
  return { viseme: "DD", open: 0.24 };
}

export const avatarController = {
  setState(state: VoicePhase) {
    avatarPose.state = state;
    avatarPose.speaking = state === "speaking";
    if (state !== "speaking") {
      avatarPose.viseme = "sil";
      avatarPose.mouthOpen = 0;
    }
  },
  setAudioLevel(level: number) {
    avatarPose.audioLevel = Math.max(0, Math.min(1, level));
  },
  setViseme(viseme: AvatarViseme, open = 0) {
    avatarPose.viseme = viseme;
    avatarPose.mouthOpen = Math.max(0, Math.min(1, open));
    lastVisemeAt = performance.now();
  },
  /** Feed one character from the live TTS boundary stream. */
  applySpeechSample(sample: string) {
    const next = visemeFor(sample);
    this.setViseme(next.viseme, next.open);
  },
};

export function glowFor(state: VoicePhase) {
  if (state === "listening") return "#22d3ee";
  if (state === "speaking") return "#e879f9";
  if (state === "error") return "#fb7185";
  if (state === "thinking") return "#818cf8";
  return "#8b5cf6";
}

/** Advance blink, mouth release, and glow. Call once per rendered frame. */
export function stepAvatar(dt: number, time: number) {
  blinkClock += dt;
  if (!blinking && blinkClock > nextBlink) {
    blinking = true;
    blinkPhase = 0;
    blinkClock = 0;
    nextBlink = 2.4 + Math.random() * 3.2;
  }
  if (blinking) {
    blinkPhase += dt * 9;
    avatarPose.blink = Math.sin(Math.min(Math.PI, blinkPhase));
    if (blinkPhase >= Math.PI) {
      blinking = false;
      avatarPose.blink = 0;
    }
  }

  if (avatarPose.speaking && typeof performance !== "undefined" && performance.now() - lastVisemeAt > 140) {
    avatarPose.mouthOpen *= Math.exp(-dt * 10);
    if (avatarPose.mouthOpen < 0.02) {
      avatarPose.mouthOpen = 0;
      avatarPose.viseme = "sil";
    }
  }

  const state = avatarPose.state;
  if (state === "speaking") avatarPose.drive = 0.35 + avatarPose.mouthOpen * 0.65;
  else if (state === "listening") avatarPose.drive = 0.28 + avatarPose.audioLevel * 0.72;
  else if (state === "thinking") avatarPose.drive = 0.34 + Math.sin(time * 1.4) * 0.08;
  else if (state === "error") avatarPose.drive = 0.15;
  else avatarPose.drive = 0.22 + Math.sin(time * 0.8) * 0.04;

  const talk = avatarPose.mouthOpen;
  avatarPose.breath = Math.sin(time * 1.35) * (state === "idle" ? 0.015 : 0.008);
  avatarPose.headX = state === "listening" ? -0.06 : state === "thinking" ? Math.sin(time * 0.32) * 0.05 : Math.sin(time * 0.28) * 0.03;
  avatarPose.headY =
    state === "speaking"
      ? Math.sin(time * 1.15) * 0.04 * (0.35 + talk)
      : state === "error"
        ? 0
        : Math.sin(time * 0.22) * 0.045;
}
