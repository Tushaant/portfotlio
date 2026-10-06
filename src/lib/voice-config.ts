/**
 * Voice is configuration, not personality.
 * Swap provider later (browser SpeechSynthesis today, another TTS later)
 * without changing the system prompt or answer logic.
 */
export type VoiceProfileId =
  | "indian-professional-male"
  | "indian-professional-female"
  | "global-neutral-male"
  | "global-neutral-female";

export type VoiceProfile = {
  id: VoiceProfileId;
  label: string;
  language: string;
  accent: string;
  gender: "male" | "female";
  locale: "en-IN" | "en";
};

export const VOICE_CONFIG = {
  VOICE_PROVIDER: "browser",
  VOICE_MODEL: "speech-synthesis",
  VOICE_ID: "indian-professional-male" as VoiceProfileId,
  VOICE_LANGUAGE: "en-IN",
  VOICE_ACCENT: "indian-english-neutral",
  VOICE_SPEED: 0.96,
  VOICE_TEMPERATURE: 0.35,
};

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "indian-professional-male",
    label: "Indian Professional Male",
    language: "en-IN",
    accent: "indian-english-neutral",
    gender: "male",
    locale: "en-IN",
  },
  {
    id: "indian-professional-female",
    label: "Indian Professional Female",
    language: "en-IN",
    accent: "indian-english-neutral",
    gender: "female",
    locale: "en-IN",
  },
  {
    id: "global-neutral-male",
    label: "Global Neutral English Male",
    language: "en-US",
    accent: "neutral-english",
    gender: "male",
    locale: "en",
  },
  {
    id: "global-neutral-female",
    label: "Global Neutral English Female",
    language: "en-US",
    accent: "neutral-english",
    gender: "female",
    locale: "en",
  },
];

export function getVoiceProfile(id: string | undefined): VoiceProfile {
  return VOICE_PROFILES.find((p) => p.id === id) ?? VOICE_PROFILES[0];
}
