export type VoiceOrbState = "idle" | "listening" | "thinking" | "speaking";

export type VoiceOrbPalette = {
  colors: [string, string, string, string];
  amplitude: number;
  speed: number;
  glow: number;
  pulse: number;
};

/** Tunable look for each conversation state. The canvas reads only this table. */
export const VOICE_ORB_STATES: Record<VoiceOrbState, VoiceOrbPalette> = {
  idle: {
    colors: ["#6d5b9a", "#8b7cc8", "#4c3d73", "#a78bfa"],
    amplitude: 0.04,
    speed: 0.32,
    glow: 0.22,
    pulse: 0.18,
  },
  listening: {
    colors: ["#22d3ee", "#2dd4bf", "#38bdf8", "#67e8f9"],
    amplitude: 0.085,
    speed: 0.52,
    glow: 0.5,
    pulse: 0.26,
  },
  thinking: {
    colors: ["#7c3aed", "#6366f1", "#4f46e5", "#c4b5fd"],
    amplitude: 0.065,
    speed: 0.4,
    glow: 0.4,
    pulse: 0.48,
  },
  speaking: {
    colors: ["#ff3cac", "#c084fc", "#22d3ee", "#a3e635"],
    amplitude: 0.2,
    speed: 1.05,
    glow: 0.82,
    pulse: 0.22,
  },
};

export function resolveOrbState(state: string): VoiceOrbState {
  if (state === "listening" || state === "thinking" || state === "speaking" || state === "interrupted") {
    return state === "interrupted" ? "listening" : state;
  }
  return "idle";
}
