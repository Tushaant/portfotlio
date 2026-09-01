/**
 * First-party anonymous event layer. Never stores recordings or secrets.
 * Analytics failures must not break Chat or Voice.
 */
export type PortfolioEventName =
  | "session_started"
  | "session_engaged"
  | "session_ended"
  | "portfolio_viewed"
  | "section_viewed"
  | "chat_opened"
  | "chat_session_started"
  | "chat_message_sent"
  | "chat_session_completed"
  | "voice_opened"
  | "voice_session_started"
  | "voice_message_sent"
  | "voice_session_completed"
  | "contact_clicked"
  | "linkedin_clicked"
  | "resume_viewed"
  | "resume_downloaded"
  | "response_success"
  | "response_failure"
  | "knowledge_gap"
  | "user_interrupted";

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

const VISITOR_KEY = "ts_vid";
const SESSION_KEY = "ts_sid";
const SESSION_AT = "ts_sid_at";
const SESSION_MS = 30 * 60 * 1000;

function rid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = rid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    const now = Date.now();
    const at = Number(sessionStorage.getItem(SESSION_AT) || 0);
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id || now - at > SESSION_MS) {
      id = rid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    sessionStorage.setItem(SESSION_AT, String(now));
    return id;
  } catch {
    return "session";
  }
}

export function trackEvent(name: PortfolioEventName, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  const payload = {
    name,
    at: Date.now(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    conversationId: properties.conversationId ?? null,
    agentType: properties.agentType ?? null,
    properties,
  };
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* non-critical */
  }
}
