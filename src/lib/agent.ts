import { buildKnowledgeBase, cms } from "./cms";

const KB = buildKnowledgeBase();

type Chunk = { text: string; score: number };

function tokenize(q: string) {
 return q
 .toLowerCase()
 .replace(/[^a-z0-9\s$%+.\-]/g, " ")
 .split(/\s+/)
 .filter((t) => t.length > 2);
}

function retrieve(query: string, limit = 8): string[] {
 const tokens = tokenize(query);
 const paragraphs = KB.split(/\n(?=[A-Z])/).flatMap((block) =>
 block.split("\n").filter((l) => l.trim().length > 40),
 );
 const scored: Chunk[] = paragraphs.map((text) => {
 const lower = text.toLowerCase();
 let score = 0;
 for (const t of tokens) {
 if (lower.includes(t)) score += 1;
 }
 return { text, score };
 });
 return scored
 .filter((c) => c.score > 0)
 .sort((a, b) => b.score - a.score)
 .slice(0, limit)
 .map((c) => c.text);
}

function smartSummary(): string {
 const r = cms.resume;
 return [
 `${r.name} is an ${r.title} based in ${r.location}.`,
 `He owns a $6.4M Agentic AI portfolio at Oraczen for a $12.4B U.S. banking client, leading 40+ cross-functional team members.`,
 `Across his career he shipped 26 Fintech & SaaS products generating ₹7.78 Cr at EMB Global, cut B2B churn 22% at Filmboard, and improved credit-risk model accuracy 15% at IBM.`,
 `Mobile learning products he shipped include Veda Academy Learning App (1L+ Google Play downloads, 4.6★) and Major Kalshi Classes Learning App (1M+ / 10L+ Google Play downloads, 4.3★).`,
 `Core stack: Agentic AI, RAG, MCP, LLM evaluation (Langfuse/Promptfoo), enterprise compliance (HIPAA, PCI-DSS, GDPR).`,
 `Contact: ${r.email} · ${r.phone} · LinkedIn available in the command center.`,
 ].join(" ");
}

/** Strict resume/portfolio agent - answers only from CMS + PDF-derived data. */
export function answerFromPortfolio(question: string): {
 answer: string;
 sources: string[];
} {
 const q = question.trim().toLowerCase();

 if (!q) {
 return {
 answer: "Transmit a question about Tushant's resume, projects, or case studies.",
 sources: [],
 };
 }

 if (
 /(who are you|what can you|help|commands)/.test(q)
 ) {
 return {
 answer:
 "I am the Command Center Agent. I answer strictly from Tushant Sharma's resume PDF and Notion/portfolio CMS - experience, projects, case studies, skills, metrics, and contact. Ask about Oraczen, EMB, Filmboard, IBM, Agentic AI, RAG, or any delivered project.",
 sources: ["agent-policy"],
 };
 }

 if (/(summar|overview|elevator|tell me about|who is tushant|profile)/.test(q)) {
 return {
 answer: smartSummary(),
 sources: ["resume.summary", "resume.metrics", "achievements.downloads"],
 };
 }

 if (
 /(veda|mkc|kalshi|play store|app download|1l\+|1m\+|10l\+|downloads)/.test(q)
 ) {
 return {
 answer: [
 "App download achievements from Google Play:",
 "• Veda Academy Learning App: 1L+ downloads, 4.6★ (1.86K+ reviews).",
 "• Major Kalshi Classes (MKC) Learning App: 1M+ downloads (listed as 10L+ on Play), 4.3★ (3.62K+ reviews).",
 "Both are highlighted in the Trophy Room with Play Store screenshots.",
 ].join("\n"),
 sources: ["achievements.veda-downloads", "achievements.mkc-downloads"],
 };
 }

 if (/(contact|email|phone|linkedin|reach)/.test(q)) {
 return {
      answer: `Contact channels:\n• Email: ${cms.resume.email}\n• Phone: ${cms.resume.phone}\n• LinkedIn: ${cms.resume.linkedin}\n• Resume PDF: /resume/Tushant_Sharma_Resume.pdf`,
 sources: ["resume.contact"],
 };
 }

 if (/\b(resume|cv)\b/.test(q)) {
 return {
 answer:
 "Resume data is sourced only from the attached PDF (Tushant_Sharma_Resume.pdf). Download: /resume/Tushant_Sharma_Resume.pdf or open /resume.",
 sources: ["resume.pdf"],
 };
 }

 const hits = retrieve(question);
 if (!hits.length) {
 return {
 answer:
 "I don't have that in the resume or portfolio CMS. Ask about experience, projects (e.g. Bharatlabs, Finixpe, Modulars 4 You), case studies, skills, tech stack, or contact details - I only answer from documented sources.",
 sources: [],
 };
 }

 const answer = [
 "Based strictly on the resume and portfolio CMS:",
 ...hits.slice(0, 5).map((h) => `• ${h}`),
 ].join("\n");

 return { answer, sources: hits.slice(0, 5) };
}
