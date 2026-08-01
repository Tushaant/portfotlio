import {
  buildKnowledgeDocs,
  cms,
  type KnowledgeDoc,
} from "./cms";

const DOCS = buildKnowledgeDocs();

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "have",
  "has",
  "was",
  "were",
  "are",
  "his",
  "her",
  "you",
  "your",
  "about",
  "what",
  "when",
  "where",
  "which",
  "who",
  "how",
  "can",
  "could",
  "would",
  "should",
  "tell",
  "me",
  "please",
  "any",
  "all",
  "into",
  "onto",
  "over",
  "under",
  "than",
  "then",
  "also",
  "just",
  "like",
  "some",
  "more",
  "most",
  "such",
  "only",
  "does",
  "did",
  "doing",
  "give",
  "show",
  "list",
  "explain",
]);

const SYNONYMS: Record<string, string[]> = {
  ai: ["agentic", "llm", "generative", "ml", "artificial"],
  job: ["experience", "career", "role", "work"],
  work: ["experience", "career", "role"],
  company: ["experience", "employer", "org"],
  project: ["projects", "portfolio", "delivered", "build"],
  projects: ["project", "portfolio", "delivered"],
  case: ["case-studies", "casestudy", "study"],
  study: ["case-studies", "casestudy"],
  skill: ["skills", "competency", "capability", "stack"],
  skills: ["skill", "competency", "capability"],
  tech: ["technology", "stack", "tools", "tech-stack"],
  stack: ["tech-stack", "tools", "technology"],
  award: ["achievement", "trophy", "certification", "milestone"],
  achievement: ["achievements", "trophy", "award", "milestone"],
  testimonial: ["testimonials", "recommendation", "review", "client"],
  recommendation: ["testimonial", "review"],
  contact: ["email", "phone", "linkedin", "reach", "hire"],
  resume: ["cv", "pdf", "curriculum"],
  download: ["downloads", "play", "app", "veda", "mkc", "kalshi"],
  app: ["veda", "mkc", "kalshi", "play", "downloads"],
  client: ["testimonial", "customer", "bank", "enterprise"],
  banking: ["oraczen", "fintech", "bank"],
  oraczen: ["agentic", "rag", "banking", "portfolio"],
  emb: ["fintech", "saas", "expand"],
  filmboard: ["churn", "vendor", "martech"],
  ibm: ["credit", "risk", "analytics"],
};

function tokenize(q: string): string[] {
  const base = q
    .toLowerCase()
    .replace(/[^a-z0-9\s$%+.\-/]/g, " ")
    .split(/[\s/]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));

  const expanded = new Set<string>(base);
  for (const t of base) {
    const syns = SYNONYMS[t];
    if (syns) syns.forEach((s) => expanded.add(s));
    // light stemming: plurals / trailing s
    if (t.endsWith("ies") && t.length > 4) expanded.add(`${t.slice(0, -3)}y`);
    if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) {
      expanded.add(t.slice(0, -1));
    }
  }
  return [...expanded];
}

function scoreDoc(doc: KnowledgeDoc, tokens: string[], rawQ: string): number {
  const hay = `${doc.title}\n${doc.aliases.join(" ")}\n${doc.text}`.toLowerCase();
  const title = doc.title.toLowerCase();
  const aliases = doc.aliases.map((a) => a.toLowerCase());
  let score = 0;

  for (const t of tokens) {
    if (t.length < 3) continue;
    if (title.includes(t)) score += 6;
    if (
      aliases.some((a) => {
        if (!a || a.length < 3) return false;
        return a.includes(t) || (t.length >= 4 && t.includes(a) && a.length >= 4);
      })
    ) {
      score += 4;
    }
    if (hay.includes(t)) score += 1.5;
    let from = 0;
    let hits = 0;
    while (hits < 4) {
      const idx = hay.indexOf(t, from);
      if (idx < 0) break;
      hits += 1;
      from = idx + t.length;
      score += 0.35;
    }
  }

  // phrase boost for multi-word query fragments
  const phrase = rawQ.toLowerCase().trim();
  if (phrase.length > 5 && hay.includes(phrase)) score += 10;

  // section intent boosts (word-boundary to avoid false hits like "emb" in "unrelated")
  if (/\b(project|portfolio|deliver|ship)\b/.test(phrase) && doc.section === "projects")
    score += 3;
  if (/\b(case|study|lenskart|gumroad|amazon|astrotalk)\b/.test(phrase) && doc.section === "case-studies")
    score += 3;
  if (/\b(skill|skills|competenc|capabilit)\b/.test(phrase) && doc.section === "skills")
    score += 3;
  if (/\b(experience|career|work|job|oraczen|emb|filmboard|ibm)\b/.test(phrase) && doc.section === "experience")
    score += 3;
  if (/\b(testimonial|recommend|review|client said)\b/.test(phrase) && doc.section === "testimonials")
    score += 3;
  if (/\b(achieve|award|certif|download|trophy)\b/.test(phrase) && doc.section === "achievements")
    score += 3;
  if (/\b(tech|stack|tool|platform)\b/.test(phrase) && doc.section === "tech-stack")
    score += 3;
  if (/\b(contact|email|phone|linkedin|hire)\b/.test(phrase) && doc.section === "contact")
    score += 5;
  if (/\b(about|who is|profile|summary|bio)\b/.test(phrase) && doc.section === "about")
    score += 4;

  // Prefer exact company / title hits for experience docs
  if (doc.section === "experience") {
    for (const a of aliases) {
      if (a.length > 2 && phrase.includes(a)) score += 8;
    }
  }
  // Prefer exact project title / slug hits
  if (doc.section === "projects" || doc.section === "case-studies") {
    for (const a of aliases) {
      if (a.length > 3 && phrase.includes(a)) score += 8;
    }
  }

  return score;
}

function retrieve(
  query: string,
  limit = 6,
): { doc: KnowledgeDoc; score: number }[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const scored = DOCS.map((doc) => ({
    doc,
    score: scoreDoc(doc, tokens, query),
  }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length || scored[0].score < 2) {
    const loose = DOCS.map((doc) => {
      const hay = `${doc.title} ${doc.aliases.join(" ")} ${doc.text}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (t.length < 3) continue;
        if (hay.includes(t)) score += 1;
      }
      return { doc, score };
    })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
    return loose.slice(0, limit);
  }

  return scored.slice(0, limit);
}

function docsInSection(section: string): KnowledgeDoc[] {
  return DOCS.filter((d) => d.section === section);
}

function formatDocAnswer(doc: KnowledgeDoc, maxChars = 900): string {
  const lines = doc.text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let out = "";
  for (const line of lines) {
    if (out.length + line.length > maxChars) break;
    out += (out ? "\n" : "") + line;
  }
  return out || doc.text.slice(0, maxChars);
}

function listProjects(): string {
  return [
    `Tushant has ${cms.projects.length} projects documented on the site:`,
    ...cms.projects.map(
      (p, i) =>
        `${i + 1}. ${p.title} (${p.status}, ${p.category}) - ${p.tagline}. Details: /projects/${p.slug}`,
    ),
  ].join("\n");
}

function listCaseStudies(): string {
  return [
    `${cms.caseStudies.length} case studies on the site:`,
    ...cms.caseStudies.map(
      (c, i) =>
        `${i + 1}. ${c.title} @ ${c.company} (${c.period})${c.featured ? " · Featured" : ""}. /case-studies/${c.slug}`,
    ),
  ].join("\n");
}

function listSkills(): string {
  return [
    "Skills from the Skill Galaxy / CMS:",
    ...cms.skills.map(
      (s) =>
        `• ${s.name} [${s.tier}] - ${s.example} Tools: ${s.tools.join(", ")}`,
    ),
  ].join("\n");
}

function listExperience(): string {
  return [
    "Career journey:",
    ...cms.experience.map(
      (j) =>
        `• ${j.role} @ ${j.company} (${j.period}${j.active ? ", current" : ""}) - key metrics: ${j.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}`,
    ),
  ].join("\n");
}

function listAchievements(): string {
  return [
    "Achievements & certifications:",
    ...cms.achievements.map((a) => {
      const metrics =
        a.metrics && Object.keys(a.metrics).length
          ? ` (${Object.entries(a.metrics)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")})`
          : "";
      return `• ${a.title} · ${a.org} · ${a.year}${metrics}`;
    }),
  ].join("\n");
}

function listTestimonials(): string {
  return [
    "Client testimonials from the Notion portfolio:",
    ...cms.testimonials.map((t) => {
      const highlight =
        "highlight" in t && t.highlight ? String(t.highlight) : t.quote;
      return `• ${t.name} (${t.role}${t.company ? `, ${t.company}` : ""}): "${highlight}"`;
    }),
  ].join("\n");
}

function listTechStack(): string {
  return [
    "Technology stack on the site:",
    ...Object.entries(cms.techStack).map(
      ([group, items]) => `• ${group}: ${(items as string[]).join(", ")}`,
    ),
  ].join("\n");
}

function smartSummary(): string {
  const r = cms.resume;
  return [
    `${r.name} is an ${r.title} based in ${r.location}.`,
    r.summary,
    `Headline metrics: ${r.metrics
      .map((m) => `${m.label} ${m.prefix || ""}${m.value}${m.suffix || ""}`)
      .join("; ")}.`,
    `He has ${cms.projects.length} documented projects, ${cms.caseStudies.length} case studies, ${cms.skills.length} skill domains, and ${cms.testimonials.length} client testimonials on this site.`,
    `Contact: ${r.email} · ${r.phone} · ${r.linkedin}`,
  ].join("\n\n");
}

function synthesizeFromDocs(docs: KnowledgeDoc[], question: string): string {
  if (!docs.length) {
    return "";
  }

  // Single strong doc → full structured answer
  if (docs.length === 1 || (docs[0] && docs.slice(1).every((d) => d.section !== docs[0].section))) {
    const primary = docs[0];
    const related = docs
      .slice(1, 3)
      .map((d) => `• ${d.title}: ${d.text.split("\n").slice(0, 2).join(" | ")}`);
    return [
      `From the website (${primary.section}): ${primary.title}`,
      formatDocAnswer(primary),
      related.length ? `\nRelated:\n${related.join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  // Multiple docs → grouped bullets
  const bySection = new Map<string, KnowledgeDoc[]>();
  for (const d of docs) {
    const list = bySection.get(d.section) || [];
    list.push(d);
    bySection.set(d.section, list);
  }

  const parts: string[] = [
    `Here's what the website has for “${question.trim()}”:`,
  ];
  for (const [section, list] of bySection) {
    parts.push(`\n[${section}]`);
    for (const d of list.slice(0, 3)) {
      const snippet = formatDocAnswer(d, 420);
      parts.push(`• ${d.title}\n${snippet}`);
    }
  }
  return parts.join("\n");
}

/** Portfolio site agent - answers from all CMS / website content. */
export function answerFromPortfolio(question: string): {
  answer: string;
  sources: string[];
} {
  const raw = question.trim();
  const q = raw.toLowerCase();

  if (!q) {
    return {
      answer:
        "Ask me anything about Tushant's profile, experience, projects, case studies, skills, tech stack, achievements, testimonials, or contact details - I answer from the data on this website.",
      sources: [],
    };
  }

  if (/(who are you|what can you|help|commands|how do you work)/.test(q)) {
    return {
      answer: [
        "I'm the Command Center Agent for this portfolio site.",
        "I answer using the website CMS: resume, experience, projects, case studies, skills, tech stack, achievements, testimonials, and contact.",
        `Coverage right now: ${cms.projects.length} projects · ${cms.caseStudies.length} case studies · ${cms.experience.length} roles · ${cms.skills.length} skills · ${cms.achievements.length} achievements · ${cms.testimonials.length} testimonials.`,
        "Try: “summarize Tushant”, “list projects”, “what did he do at Oraczen?”, “Bharatlabs outcome”, “client testimonials”, or “how do I contact him?”",
      ].join("\n"),
      sources: ["agent-policy", "site.navigation"],
    };
  }

  if (
    /(summar|overview|elevator|tell me about tushant|who is tushant|profile|about him|about tushant)/.test(
      q,
    )
  ) {
    return {
      answer: smartSummary(),
      sources: ["resume.profile", "resume.contact"],
    };
  }

  if (
    /(^|\b)(list|show|all|every)\b.*\bprojects?\b|\bprojects?\b.*(list|all|every|show)/.test(
      q,
    ) ||
    q === "projects" ||
    q === "what projects" ||
    /what (projects|products) (has|did|does)/.test(q)
  ) {
    return { answer: listProjects(), sources: docsInSection("projects").map((d) => d.id) };
  }

  if (
    /(list|show|all).*(case stud)|case stud.*(list|all|show)|what case stud/.test(
      q,
    )
  ) {
    return {
      answer: listCaseStudies(),
      sources: docsInSection("case-studies").map((d) => d.id),
    };
  }

  if (
    /(list|show|all).*(skills?)|(skills?|skill galaxy).*(list|show|have|has)|what (are|is|skills)|(his|tushant.?s?) skills?|skills? does/.test(
      q,
    )
  ) {
    return { answer: listSkills(), sources: docsInSection("skills").map((d) => d.id) };
  }

  if (
    /(list|show|all).*(experience|jobs|roles|career)|career (path|journey)|where (has|did) he work|work history/.test(
      q,
    )
  ) {
    return {
      answer: listExperience(),
      sources: docsInSection("experience").map((d) => d.id),
    };
  }

  if (/(list|show|all).*(achieve|award|certif|troph)|achievements?|certifications?/.test(q)) {
    return {
      answer: listAchievements(),
      sources: docsInSection("achievements").map((d) => d.id),
    };
  }

  if (/(list|show|all).*testimonial|testimonial|recommendation|what (do )?clients? say|reviews?/.test(q)) {
    return {
      answer: listTestimonials(),
      sources: docsInSection("testimonials").map((d) => d.id),
    };
  }

  if (/(tech(nology)? stack|tools? (he |tushant )?uses?|what (tech|tools)|platforms?)/.test(q)) {
    return {
      answer: listTechStack(),
      sources: ["tech-stack"],
    };
  }

  if (/(veda|mkc|kalshi|play store|app download|1l\+|1m\+|10l\+|downloads)/.test(q)) {
    const hits = DOCS.filter(
      (d) =>
        d.id.includes("veda") ||
        d.id.includes("mkc") ||
        /veda|kalshi|mkc|download/i.test(d.text),
    );
    return {
      answer: synthesizeFromDocs(hits.slice(0, 3), raw) || listAchievements(),
      sources: hits.slice(0, 3).map((d) => d.id),
    };
  }

  if (/(contact|email|phone|linkedin|reach|hire|connect with)/.test(q)) {
    return {
      answer: [
        "Contact channels from the site:",
        `• Email: ${cms.resume.email}`,
        `• Phone: ${cms.resume.phone}`,
        `• LinkedIn: ${cms.resume.linkedin}`,
        `• Resume PDF: ${cms.site.social.resume}`,
        "• Resume page: /resume",
        `• Notion portfolio: ${cms.site.notion}`,
      ].join("\n"),
      sources: ["resume.contact"],
    };
  }

  if (/\b(resume|cv)\b/.test(q) && !/summary|summarize/.test(q)) {
    return {
      answer: [
        "Resume is sourced from the PDF on this site.",
        `• Download: ${cms.site.social.resume}`,
        "• Page: /resume",
        `• ${cms.resume.name} - ${cms.resume.title}`,
        cms.resume.summary,
      ].join("\n"),
      sources: ["resume.profile", "resume.contact"],
    };
  }

  const hits = retrieve(raw, 7);

  // Prefer experience when asking what someone did at a company
  let ranked = hits;
  if (/(what did|role at|work(?:ed)? at|at oraczen|at emb|at filmboard|at ibm|do at)/.test(q)) {
    ranked = [...hits].sort((a, b) => {
      const ae = a.doc.section === "experience" ? 1 : 0;
      const be = b.doc.section === "experience" ? 1 : 0;
      if (ae !== be) return be - ae;
      return b.score - a.score;
    });
  }

  const top = ranked[0]?.score ?? 0;
  const usable = ranked.filter((h) => h.score >= Math.max(4, top * 0.35));

  if (!usable.length || top < 4) {
    return {
      answer: [
        "I couldn't match that to a specific page section, but I can answer from anything on this website.",
        "Try asking about: experience (Oraczen, EMB, Filmboard, IBM), a project by name (Bharatlabs, Finixpe, Modulars 4 You), case studies (Lenskart, Gumroad, Amazon miniTV), skills, tech stack, achievements, testimonials, or contact.",
        `Or say "list projects" / "list case studies" / "summarize Tushant".`,
      ].join("\n\n"),
      sources: [],
    };
  }

  const docs = usable.map((h) => h.doc);
  return {
    answer: synthesizeFromDocs(docs, raw),
    sources: docs.map((d) => d.id),
  };
}
