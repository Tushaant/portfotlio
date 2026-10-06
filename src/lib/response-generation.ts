const FIELD_SENTENCE =
  /\b(documented figures|the role is|the time period is|the location is|this covers|technologies called out|current role documented|company:|role:|period:|location:|metrics:|responsibilities:|type:|org:|skill:|tier:|experience:)\b/i;

/**
 * Last step before display and speech.
 * Retrieval text is context. This keeps field labels and record dumps out of the answer.
 */
export function toConversationalAnswer(text: string) {
  const sentences = text
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => !FIELD_SENTENCE.test(sentence))
    .filter((sentence) => !/^[A-Z][A-Z /_-]{2,}:/.test(sentence));

  return sentences
    .join(" ")
    .replace(/\bThe documented scope includes\b/g, "He owns")
    .replace(/\bDocumented ownership includes\b/g, "He owns")
    .replace(/\s{2,}/g, " ")
    .trim();
}
