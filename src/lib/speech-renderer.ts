import dictionary from "../../content/brain/pronunciation.json";
import { toConversationalAnswer } from "./response-generation";

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

const FIELD_LABEL =
  /^(COMPANY|ROLE|PERIOD|METRICS|RESPONSIBILITIES|TYPE|ORG|SKILL|TIER|EXPERIENCE|EMAIL|PHONE|LINKEDIN|LOCATION|STATUS|TECHNOLOGIES|LESSON)\s*:\s*/i;

function underHundred(n: number): string {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return one ? `${TENS[ten]}-${ONES[one]}` : TENS[ten];
}

function speakInteger(n: number): string {
  if (n < 0) return `minus ${speakInteger(-n)}`;
  if (n < 100) return underHundred(n);
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    return rest ? `${ONES[hundreds]} hundred ${underHundred(rest)}` : `${ONES[hundreds]} hundred`;
  }
  return String(n);
}

function speakPointDigits(fraction: string): string {
  return fraction
    .split("")
    .map((d) => ONES[Number(d)] ?? d)
    .join(" ");
}

function speakDecimal(value: string): string {
  const [whole, fraction] = value.split(".");
  const head = speakInteger(Number(whole || "0"));
  if (!fraction) return head;
  return `${head} point ${speakPointDigits(fraction)}`;
}

function moneyUnit(suffix: string | undefined, currency: "dollar" | "dollars" | "rupees"): string {
  const s = (suffix || "").toLowerCase();
  if (s === "m" || s === "million") return `million ${currency}`;
  if (s === "b" || s === "billion") return `billion ${currency}`;
  if (s === "k" || s === "thousand") return `thousand ${currency}`;
  if (s === "cr" || s === "crore" || s === "crores") return `crore ${currency}`;
  if (s === "l" || s === "lakh" || s === "lakhs") return `lakh ${currency}`;
  return currency;
}

export function cleanDisplayText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/[*_#>]/g, "")
    .split("\n")
    .map((line) => line.replace(FIELD_LABEL, "").replace(/^[-•]\s+/, "").trim())
    .filter((line) => line && !/^[[\]]/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function applyPronunciation(text: string): string {
  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  let out = text;
  for (const [token, spoken] of entries) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "g"), spoken);
  }
  return out;
}

function speakQuantities(text: string): string {
  let out = text;
  out = out.replace(
    /\$(\d+(?:\.\d+)?)\s*(million|billion|thousand|[MBK])\b(\s+[A-Za-z]+)?/gi,
    (_, num: string, unit: string, after?: string) => {
      const currency = after ? "dollar" : "dollars";
      return `${speakDecimal(num)} ${moneyUnit(unit, currency)}${after ?? ""}`;
    },
  );
  out = out.replace(
    /₹\s*(\d+(?:\.\d+)?)\s*(crore|crores|lakh|lakhs|Cr|L)\b/gi,
    (_, num: string, unit: string) => `${speakDecimal(num)} ${moneyUnit(unit, "rupees")}`,
  );
  out = out.replace(/(\d+(?:\.\d+)?)\s*%\s*\+/g, (_, num: string) => `more than ${speakDecimal(num)} percent`);
  out = out.replace(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*%/g, (_, a: string, b: string) => {
    return `${speakDecimal(a)} to ${speakDecimal(b)} percent`;
  });
  out = out.replace(/<\s*(\d+(?:\.\d+)?)\s*%/g, (_, num: string) => `less than ${speakDecimal(num)} percent`);
  out = out.replace(/(\d+(?:\.\d+)?)\s*%/g, (_, num: string) => `${speakDecimal(num)} percent`);
  out = out.replace(/<\s*(\d+(?:\.\d+)?)\s*s\b/gi, (_, num: string) => `less than ${speakDecimal(num)} seconds`);
  out = out.replace(/\bP\s?(\d{2})\b/g, (_, n: string) => `P ${speakInteger(Number(n))}`);
  out = out.replace(/\b(\d+(?:\.\d+)?)\s*B\b/g, (_, num: string) => `${speakDecimal(num)} billion`);
  return out;
}

function limitSpokenWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  const sliced = words.slice(0, maxWords).join(" ");
  const cut = sliced.replace(/[,:;]\s*[^,:;]*$/, "");
  return `${cut.replace(/[.?!]?$/, "")}.`;
}

/** Written answer in, text meant only for TTS out. */
export function renderSpeech(displayText: string, maxWords = 100): string {
  const plain = cleanDisplayText(displayText).replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const spoken = limitSpokenWords(applyPronunciation(speakQuantities(plain)), maxWords);
  return spoken;
}

export function presentAnswer(answer: string, maxSpokenWords = 100) {
  const displayText = cleanDisplayText(toConversationalAnswer(answer));
  return {
    displayText,
    speechText: renderSpeech(displayText, maxSpokenWords),
  };
}
