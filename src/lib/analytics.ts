/**
 * Session-only first-party events. No recordings, no PII, no server upload.
 * Interim speech transcripts are never events.
 */
export type PortfolioEventName =
  | "voice_opened"
  | "voice_message_sent"
  | "chat_opened"
  | "chat_message_sent";

type PortfolioEvent = {
  name: PortfolioEventName;
  at: number;
};

const KEY = "portfolio_intel_events_v1";

export function trackEvent(name: PortfolioEventName) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(KEY);
    const events: PortfolioEvent[] = raw ? (JSON.parse(raw) as PortfolioEvent[]) : [];
    events.push({ name, at: Date.now() });
    sessionStorage.setItem(KEY, JSON.stringify(events.slice(-200)));
  } catch {
    /* private mode / quota */
  }
}
