import taxonomy from "../../content/brain/taxonomy.json";

export type Classification = {
  topic: string;
  subtopic: string;
  intent: string;
  cluster: string;
  confidence: number;
};

function canon(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

export function classifyQuestion(text: string): Classification {
  const q = canon(text);
  let topic = "Portfolio";
  let confidence = 0.55;
  for (const t of taxonomy.topics) {
    if (t.match.some((m) => q.includes(m))) {
      topic = t.label;
      confidence = 0.86;
      break;
    }
  }
  let intent: string = "Portfolio Exploration";
  if (/(who is|career|role|compan|education|certif)/.test(q)) intent = "Career / Experience";
  else if (/(project|dpi|finix|bharat|oraczen product)/.test(q)) intent = "Project Deep Dive";
  else if (/(strateg|priorit|roadmap|discovery)/.test(q)) intent = "Product Management";
  else if (/(rag|mcp|architect|kubernetes|docker|jwt)/.test(q)) intent = "Technical Architecture";
  else if (/(agentic|enterprise ai|evaluation|governance)/.test(q)) intent = "AI Strategy";
  else if (/(lead|team|director|hire)/.test(q)) intent = "Leadership";
  else if (/(bank|fintech|credit)/.test(q)) intent = "Industry Experience";
  else if (/(interview|strength|why hire)/.test(q)) intent = "Interview";
  else if (/(contact|email|linkedin|resume)/.test(q)) intent = "Contact / Hiring";
  else if (/(what is|explain)/.test(q)) intent = "General Professional Question";

  const cluster = q
    .replace(/\b(tushant|his|her|the|a|an|please|tell me about|what is|how does|explain)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48) || topic;

  return {
    topic,
    subtopic: topic,
    intent,
    cluster: cluster.replace(/\b\w/g, (c) => c.toUpperCase()),
    confidence,
  };
}
