import { cms } from "./cms";
import { matchGeneralTopic } from "./general-knowledge";
import { VOICE_PROFILES, getVoiceProfile, VOICE_CONFIG } from "./voice-config";

export const INTENTS = [
  "GENERAL_KNOWLEDGE",
  "PORTFOLIO",
  "CAREER",
  "PROJECT",
  "TECHNICAL",
  "PERSONAL_PUBLIC",
  "CONVERSATION",
  "VOICE",
  "AGENT_IDENTITY",
  "AGENT_ARCHITECTURE",
  "CONTACT",
  "UNKNOWN",
] as const;

export type Intent = (typeof INTENTS)[number];

export type IntentDecision = {
  intent: Intent;
  usePortfolio: boolean;
  answer?: string;
};

const ABOUT_HIM =
  /\b(tushant|oraczen|emb global|\bemb\b|filmboard|byju|extramarks|resume|his portfolio)\b/i;

function normalize(question: string) {
  return question.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
}

function mentionsHim(q: string) {
  return ABOUT_HIM.test(q) || /\b(he|him|his)\b/.test(q);
}

function architectureAnswer() {
  const model = process.env.OPENAI_API_KEY
    ? "When a server model key is configured, open general-knowledge questions can also go to that model."
    : "Open questions are answered from general knowledge in this assistant, and portfolio retrieval runs only when the question is about Tushant.";
  return `I'm Tushant's AI portfolio assistant. I use speech recognition to understand you, an intent router to choose a path, and his portfolio knowledge base only when the question is about his work. ${model} A speech renderer prepares the spoken wording, and text to speech plays it back. If you start talking while I'm speaking, I stop and listen to you.`;
}

function voiceAnswer() {
  const profile = getVoiceProfile(VOICE_CONFIG.VOICE_ID);
  const options = VOICE_PROFILES.map((p) => p.label).join(", ");
  return `I'm using the ${profile.label} voice: a natural Indian English male voice with a neutral urban accent, at a moderate pace. You can switch among ${options} from the voice control. I won't pretend to use a voice provider that isn't configured.`;
}

function identityAnswer() {
  return "I'm Tushant's AI portfolio assistant. I represent his public work for recruiters and other visitors. I'm not Tushant himself.";
}

function contactAnswer() {
  const r = cms.resume;
  return `You can reach Tushant at ${r.email}, by phone at ${r.phone}, or through the LinkedIn profile linked on this site.`;
}

function oraczenShipped() {
  const job = cms.experience.find((j) => j.id === "oraczen");
  if (!job) return "I don't have that information available right now.";
  const platform = job.responsibilities.find((r) => /AI Platform Strategy/i.test(r)) ?? "";
  const span = platform.match(/spanning ([^.]+)/i)?.[1];
  const products = (span ? span.split(",") : ["Chat Agents", "Voice Agents", "Lending AI", "Spend Intelligence", "Risk Intelligence"])
    .map((part) => part.trim().replace(/^and\s+/i, ""))
    .filter((part) => part && !/requirement gathering/i.test(part));
  const portfolio = job.metrics.find((m) => /portfolio/i.test(m.label))?.value ?? "$6.4M";
  const list = products.join(", ").replace(/, ([^,]+)$/, ", and $1");
  return `At Oraczen, Tushant shipped ${list}. That work also includes enterprise retrieval with MCP and a knowledge graph for a large U.S. banking client. The documented portfolio is ${portfolio}.`;
}

function generalKnowledgeAnswer(q: string): string | null {
  if (/\bjapan\b/.test(q) && /\b(where|globe|located|location|map|east)\b/.test(q)) {
    return "Japan is an island country in East Asia, in the northwest Pacific Ocean. It lies east of the Korean Peninsula and China.";
  }
  if (/\bcapital of japan\b|\bjapan'?s capital\b/.test(q)) {
    return "The capital of Japan is Tokyo.";
  }
  if (/\bwhat is an api\b|\bwhat's an api\b|\bwhat is api\b/.test(q)) {
    return "An API is an application programming interface. It is a defined way for one piece of software to ask another for something, with a structured request and a structured response.";
  }
  const topic = matchGeneralTopic(q);
  if (topic && !mentionsHim(q)) return topic.explanation;
  if (
    /\b(where is|where are|what is|what's|who is|capital of)\b/.test(q) &&
    !mentionsHim(q) &&
    !/\b(tushant|oraczen|this portfolio|your voice|you)\b/.test(q)
  ) {
    return "I don't have that information available right now. I can tell you about Tushant's experience, projects, or AI work.";
  }
  return null;
}

export function classifyIntent(question: string): IntentDecision {
  const q = normalize(question);
  if (!q) {
    return {
      intent: "UNKNOWN",
      usePortfolio: false,
      answer: "Ask me about Tushant's experience, projects, or AI work whenever you're ready.",
    };
  }

  if (
    /\b(what are you thinking|what's on your mind)\b/.test(q)
  ) {
    return {
      intent: "CONVERSATION",
      usePortfolio: false,
      answer:
        "I'm working on the question you just asked. I can explain the answer, but I don't share a private chain of thought.",
    };
  }

  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q) ||
    (/\b(are you (even )?(listening|there|hearing)|can you hear me|you listening|how are you|how's it going|how have you been)\b/.test(
      q,
    ) &&
      !/\b(created|built|made)\b/.test(q))
  ) {
    const listening = /\b(listening|hear)\b/.test(q);
    return {
      intent: "CONVERSATION",
      usePortfolio: false,
      answer: listening
        ? "Yes, I'm listening. I think I missed your last question. Go ahead."
        : "Hello. I'm here. What would you like to know?",
    };
  }

  const aboutAgentVoice =
    /\b(your voice|change (your )?voice|speak differently|what voice|male voice|female voice)\b/.test(q) ||
    (/\bvoice\b/.test(q) && /\byou\b/.test(q) && !/\b(tushant|oraczen|ship)\b/.test(q));
  if (aboutAgentVoice) {
    return { intent: "VOICE", usePortfolio: false, answer: voiceAnswer() };
  }

  if (
    /\bhow (were you|have you been) (created|built|made)\b/.test(q) ||
    /\b(how does (this|the) voice agent work|what technology powers you|what powers you|how do you work|how have you been created)\b/.test(
      q,
    )
  ) {
    return { intent: "AGENT_ARCHITECTURE", usePortfolio: false, answer: architectureAnswer() };
  }

  if (/\b(who are you|what are you|who created you|who made you|what is your name|what's your name)\b/.test(q)) {
    return { intent: "AGENT_IDENTITY", usePortfolio: false, answer: identityAnswer() };
  }

  if (
    /\b(married|wife|husband|girlfriend|boyfriend|dating|kids|children|salary|religion|home address)\b/.test(q)
  ) {
    return {
      intent: "PERSONAL_PUBLIC",
      usePortfolio: false,
      answer: "That's a personal detail I don't have in my public portfolio, so I'll keep that private.",
    };
  }

  if (
    /^(contact|email|phone|linkedin)$/.test(q) ||
    /\b(how (can|do) i (contact|reach)|contact (tushant|him)|get in touch|his (email|phone|linkedin)|reach (him|tushant)|how to contact)\b/.test(
      q,
    )
  ) {
    return { intent: "CONTACT", usePortfolio: false, answer: contactAnswer() };
  }

  if (/\boraczen\b/.test(q) && /\b(ship|shipped|built|build|deliver|launched|products)\b/.test(q)) {
    return { intent: "PROJECT", usePortfolio: true, answer: oraczenShipped() };
  }

  if (/\b(ivy|amey|dairy profit|farm visit)\b/.test(q)) {
    return { intent: "PROJECT", usePortfolio: true };
  }

  const topic = matchGeneralTopic(q);
  const personalTech =
    mentionsHim(q) ||
    /\b(your experience|you (use|used|built)|experience with)\b/.test(q);
  if (topic && personalTech) {
    return { intent: "TECHNICAL", usePortfolio: true };
  }
  if (topic && !mentionsHim(q)) {
    return { intent: "TECHNICAL", usePortfolio: false, answer: topic.explanation };
  }

  const general = generalKnowledgeAnswer(q);
  if (general && !mentionsHim(q)) {
    return { intent: "GENERAL_KNOWLEDGE", usePortfolio: false, answer: general };
  }

  if (/\b(career|work history|where (has|did) he work|current role|experience)\b/.test(q) && mentionsHim(q)) {
    return { intent: "CAREER", usePortfolio: true };
  }

  if (/\b(project|projects|case study)\b/.test(q)) {
    return { intent: "PROJECT", usePortfolio: true };
  }

  if (mentionsHim(q) || /\b(portfolio|resume|hire him)\b/.test(q)) {
    return { intent: "PORTFOLIO", usePortfolio: true };
  }

  if (/\b(education|degree|lives|based in|from hyderabad)\b/.test(q)) {
    return { intent: "PERSONAL_PUBLIC", usePortfolio: true };
  }

  return {
    intent: "UNKNOWN",
    usePortfolio: false,
    answer:
      "I don't have that information available right now. I can tell you about Tushant's experience, projects, or AI work.",
  };
}
