import { cms } from "./cms";
import { formatGeneralAnswer, matchGeneralTopic, type GeneralTopic } from "./general-knowledge";
import type { AgentChannel } from "./agent-types";

export type BrainResult = {
  answer: string;
  sources: string[];
  knowledgeGap?: boolean;
  topic?: string;
  intent?: string;
};

function spokenWrap(channel: AgentChannel, text: string) {
  if (channel !== "voice") return text;
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/•/g, "")
    .trim();
}

function oraczen() {
  return cms.experience.find((j) => j.id === "oraczen");
}

function jobById(id: string) {
  return cms.experience.find((j) => j.id === id);
}

function findProject(q: string) {
  const n = q.toLowerCase();
  return cms.projects.find(
    (p) => n.includes(p.slug) || n.includes(p.title.toLowerCase()),
  );
}

export function composeFromBrain(
  question: string,
  channel: AgentChannel,
): BrainResult | null {
  const q = question.toLowerCase().trim();
  if (!q) return null;

  const general = matchGeneralTopic(question);
  const aboutTushant = /\b(tushant|his |he |him|resume|portfolio|career|oraczen|emb|filmboard|ibm|byju|extramarks)\b/i.test(
    q,
  );
  const wantsPersonal =
    aboutTushant ||
    /\b(your|you have|you work|experience with|worked with|his experience)\b/i.test(q);

  if (/(who are you|what can you do|how do you work)/.test(q) && !/tushant/.test(q)) {
    return {
      answer: spokenWrap(
        channel,
        channel === "voice"
          ? "I'm Tushant's AI companion. I can talk through his verified work, and I can also explain things like RAG, MCP, or product strategy in plain language. I won't invent experience he doesn't have on record."
          : "I'm Tushant's AI companion for this portfolio. I answer from verified resume, project, and CMS data, and I can explain general professional topics separately from his documented experience.",
      ),
      sources: ["system-prompt"],
      intent: "Portfolio Exploration",
      topic: "Portfolio",
    };
  }

  if (/(current role|present role|what does he do now|acting director|where does he work now)/.test(q)) {
    return currentRole(channel);
  }

  if (/(who is tushant|tell me about tushant|about him|smart summary|elevator|profile|overview of tushant)/.test(q) && !/current role|projects|education|career/.test(q)) {
    return whoIs(channel);
  }

  if (
    /(career|companies has he|where (has|did) he work|work history|professional journey|roles has he)/.test(
      q,
    )
  ) {
    return career(channel);
  }

  if (/(education|degree|b\.?tech|certification|pmp|edupristine)/.test(q)) {
    return education(channel);
  }

  if (/(strongest|strengths|good at|areas of expertise|core competenc)/.test(q)) {
    return strengths(channel);
  }

  if (/(product strategy|how does (he|tushant) (approach|priorit)|work with engineering|product risk)/.test(q)) {
    return productThinking(channel, q);
  }

  if (/(why (should|would).{0,12}hire|hire him|what makes him different)/.test(q)) {
    return hire(channel);
  }

  if (/difference between rag and mcp|rag (vs|versus|and) mcp|mcp (vs|versus) rag/.test(q)) {
    return ragVsMcp(channel);
  }

  if (general && isConceptQuestion(q) && !wantsPersonal) {
    return generalFirst(general, channel, false);
  }

  if (general && (wantsPersonal || /experience (with|in)|how has tushant|his (rag|mcp|agentic)/.test(q))) {
    return generalFirst(general, channel, true);
  }

  if (
    /ai projects|agentic projects|projects.{0,24}(ai|agentic|rag|mcp)/.test(q) ||
    /tell me about (his |the )?projects|what (are|were) his projects/.test(q) ||
      /^(his )?projects$/.test(q) ||
      /list (all )?projects/.test(q)) {
    return projectsOverview(channel, /ai|agentic|rag|mcp/.test(q));
  }

  const project = findProject(q);
  if (project && /(tell me|what is|about|project|problem|users|architecture)/.test(q)) {
    return projectDeepDive(project, channel);
  }

  if (/(contact|email|phone|linkedin|reach him|how do i (contact|reach))/.test(q)) {
    const r = cms.resume;
    return {
      answer: spokenWrap(
        channel,
        `The documented channels are ${r.email}, ${r.phone}, and his LinkedIn profile. The resume PDF is also on this site.`,
      ),
      sources: ["resume.contact"],
      intent: "Contact / Hiring",
      topic: "Contact / Hiring",
    };
  }

  return null;
}

function isConceptQuestion(q: string) {
  return /what is|what's|explain|how does|difference|tell me about (rag|mcp|agentic|kubernetes|docker|jwt|sso|oauth|graph rag|knowledge graph|observab|evaluation)/.test(
    q,
  );
}

function whoIs(channel: AgentChannel): BrainResult {
  const r = cms.resume;
  const job = oraczen();
  const chat = [
    `${r.name} is a senior product executive with more than ten years leading enterprise AI and SaaS organizations.`,
    `He's currently ${r.title} at ${job?.company ?? "Oraczen"}, based in ${r.location}.`,
    job
      ? `The documented scope is director-level: a ${job.metrics.find((m) => /portfolio/i.test(m.label))?.value ?? "$6.4M"} Agentic AI portfolio, P&L accountability, and a $12.4B U.S. banking enterprise client.`
      : r.summary.split(".")[0] + ".",
    `The through-line in the portfolio is enterprise AI product work: agentic systems, RAG, MCP, evaluation, and governance, plus earlier FinTech and SaaS delivery.`,
  ].join(" ");
  const voice = `Tushant Sharma is a senior product executive with over ten years in enterprise AI and SaaS. Right now he's AI Product Manager and Acting Director of Product Management at Oraczen, based in Hyderabad. The documented scope is pretty enterprise-heavy: a $6.4 million Agentic AI portfolio, P&L accountability, and a large U.S. banking client. His recent focus is scaling AI products, RAG, MCP, and enterprise data foundations.`;
  return {
    answer: spokenWrap(channel, channel === "voice" ? voice : chat),
    sources: ["resume.profile", "experience.oraczen"],
    intent: "Career / Experience",
    topic: "Career",
  };
}

function currentRole(channel: AgentChannel): BrainResult {
  const job = oraczen();
  if (!job) return whoIs(channel);
  const voice = `Currently, Tushant is at Oraczen as AI Product Manager and Acting Director of Product Management. That's May 2025 to present. The work is enterprise AI: agentic products, RAG pipelines with MCP, knowledge-graph oriented data foundations, and a $6.4 million portfolio tied to a $12.4 billion U.S. banking client. Documented quality bars include accuracy around 92 to 95 percent and P95 latency under 1.5 seconds.`;
  const chat = [
    `Tushant is currently ${job.role} at ${job.company} (${job.period}), based in ${job.location}.`,
    `Documented ownership includes ${job.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}.`,
    `Focus areas on record: enterprise AI, agentic products, RAG integrated with MCP, knowledge graphs, product strategy, cross-functional leadership, and AI governance.`,
  ].join(" ");
  return {
    answer: spokenWrap(channel, channel === "voice" ? voice : chat),
    sources: ["experience.oraczen"],
    intent: "Career / Experience",
    topic: "Enterprise AI",
  };
}

function career(channel: AgentChannel): BrainResult {
  const lines = cms.experience.map((j) => {
    const beat = j.responsibilities[0]?.split(":")[0] ?? j.role;
    return `${j.role} at ${j.company}, ${j.period}. ${beat}.`;
  });
  const voice = `The documented journey is fairly linear. He started in product-adjacent engineering at Byju's, moved through product and sales at Extramarks, then credit and risk analytics at IBM. Filmboard was senior PM in fintech and martech. EMB Global was category-head work across enterprise SaaS and fintech. The current chapter is Oraczen, leading enterprise agentic AI. I can go deeper on any one of those.`;
  return {
    answer: spokenWrap(channel, channel === "voice" ? voice : lines.join(" ")),
    sources: cms.experience.map((j) => `experience.${j.id}`),
    intent: "Career / Experience",
    topic: "Career",
  };
}

function education(channel: AgentChannel): BrainResult {
  const edu = cms.resume.education
    .map((e) => `${e.degree} from ${e.institution} (${e.year})`)
    .join(". ");
  return {
    answer: spokenWrap(
      channel,
      `On record: ${edu}. I won't add degrees or certifications that aren't in the resume.`,
    ),
    sources: ["resume.education"],
    intent: "Career / Experience",
    topic: "Career",
  };
}

function strengths(channel: AgentChannel): BrainResult {
  const voice = `The strongest documented areas are enterprise AI product leadership, agentic systems, RAG and MCP, evaluation and governance, and FinTech or banking product work. Underneath that is a fairly practical product muscle: roadmaps, GTM, cross-functional teams, and talking to executives without inventing certainty.`;
  return {
    answer: spokenWrap(
      channel,
      channel === "voice"
        ? voice
        : `Strongest documented areas: ${cms.resume.coreCompetencies.slice(0, 10).join("; ")}. These come from the resume, not from inferred skills.`,
    ),
    sources: ["resume.profile", "experience.oraczen"],
    intent: "Interview",
    topic: "Leadership",
  };
}

function productThinking(channel: AgentChannel, q: string): BrainResult {
  const orz = oraczen();
  const emb = jobById("emb");
  if (/engineering/.test(q)) {
    return {
      answer: spokenWrap(
        channel,
        `The documented pattern is close partnership with engineering, design, and QA rather than throwing requirements over a wall. At Oraczen he hired and led a cross-functional group including PMs, developers, QA, and design, and the resume credits Agile restructuring with a 30% release-velocity lift. I don't have a private playbook beyond what's on record.`,
      ),
      sources: ["experience.oraczen"],
      intent: "Product Management",
      topic: "Product Leadership",
    };
  }
  if (/risk/.test(q)) {
    return {
      answer: spokenWrap(
        channel,
        `On AI product risk, the verified stance is measurement and governance, not model novelty. Oraczen work includes evaluation with Langfuse and Promptfoo, latency and error SLAs, and Architecture Review Board release governance with HIPAA, PCI-DSS, and GDPR called out. In general, the product job is to bound autonomy, watch failure modes, and keep humans in the loop where the cost of being wrong is high.`,
      ),
      sources: ["experience.oraczen", "general.governance"],
      intent: "AI Strategy",
      topic: "AI Governance",
    };
  }
  if (/priorit/.test(q)) {
    return {
      answer: spokenWrap(
        channel,
        `Prioritization in the portfolio is described as balancing strategic enterprise needs with customer value, using Agile delivery and explicit trade-offs. At EMB that showed up as a 26-product portfolio with retention and onboarding metrics. I don't have an unpublished scoring spreadsheet, so I won't invent one. In general he would weigh impact, effort, risk, and sequencing.`,
      ),
      sources: emb ? ["experience.emb"] : ["resume.profile"],
      intent: "Product Management",
      topic: "Product Strategy",
    };
  }
  return {
    answer: spokenWrap(
      channel,
      `The documented product approach is customer problem, to workflow, to a bounded AI or SaaS capability, then evaluation. ${orz ? "At Oraczen that meant process-discovery workshops, RAG and MCP to replace slow manual work, and quality bars before scale." : ""} ${emb ? "At EMB it was portfolio leadership, GTM, and onboarding time as a retention lever." : ""} I can walk a specific company if that's more useful.`,
    ),
    sources: ["experience.oraczen", "experience.emb"],
    intent: "Product Management",
    topic: "Product Strategy",
  };
}

function hire(channel: AgentChannel): BrainResult {
  return {
    answer: spokenWrap(
      channel,
      `What the portfolio actually supports is a mix of AI product strategy, enterprise delivery, and documented outcomes. Current scope is director-level at Oraczen on a $6.4M agentic portfolio for a large U.S. bank, with evaluation and compliance on the page. Earlier chapters add FinTech SaaS, marketplace and CRM work, and credit-risk analytics at IBM. I won't add claims that aren't sourced.`,
    ),
    sources: ["resume.profile", "experience.oraczen"],
    intent: "Interview",
    topic: "Leadership",
  };
}

function generalFirst(topic: GeneralTopic, channel: AgentChannel, connect: boolean): BrainResult {
  const base = formatGeneralAnswer(topic, channel === "voice");
  const extra =
    connect && topic.verifiedNote
      ? ""
      : connect
        ? " I don't have a verified personal implementation claim for Tushant on that specific toolset beyond what's in the resume."
        : "";
  return {
    answer: spokenWrap(channel, base + extra),
    sources: [`general.${topic.id}`, topic.verifiedNote ? "cms-verified" : "general-only"],
    intent: connect ? "AI Strategy" : "General Professional Question",
    topic: topic.title,
  };
}

function ragVsMcp(channel: AgentChannel): BrainResult {
  const voice = `They're solving different jobs. RAG is about what information the model should retrieve before it answers. MCP is about how an AI application talks to external tools and sources of context in a more standard way. You can use them together: MCP to reach a knowledge service, RAG to decide which chunks actually go into the prompt. Tushant's resume specifically documents enterprise RAG pipelines integrated with MCP, so that pairing is part of his verified work, not a generic blog claim.`;
  const chat = [
    "RAG retrieves relevant knowledge or context so the model is grounded before it generates.",
    "MCP standardizes how an AI system can access tools and context.",
    "RAG answers: what information should I retrieve?",
    "MCP helps answer: how can the AI application interact with external capabilities or context?",
    "Together they can complement each other: MCP as the interface, RAG as the retrieval strategy.",
    "Verified connection: Tushant's Oraczen experience documents enterprise-grade RAG pipelines integrated with Model Context Protocol and a knowledge graph.",
  ].join(" ");
  return {
    answer: spokenWrap(channel, channel === "voice" ? voice : chat),
    sources: ["general.rag", "general.mcp", "experience.oraczen"],
    intent: "Technical Architecture",
    topic: "RAG",
  };
}

function projectsOverview(channel: AgentChannel, aiLens: boolean): BrainResult {
  const highlights = cms.projects.slice(0, 4);
  const names = highlights.map((p) => `${p.title} (${p.category}: ${p.tagline})`).join(". ");
  const voiceAi = `The recent documented AI work sits at Oraczen: chat agents, voice agents, lending AI, spend and risk intelligence, plus enterprise RAG pipelines integrated with MCP. I don't have a separate public case study named Dairy Profit Intelligence in this CMS, so I won't invent one. The public project grid is mostly earlier SaaS and FinTech delivery, like ${highlights.map((p) => p.title).join(", ")}. I can go deeper on architecture or a specific product if you name it.`;
  const voiceAll = `There are ${cms.projects.length} delivered products on the site. A few to start with: ${names}. Recent enterprise AI work is documented under Oraczen rather than as those same consumer titles. Tell me which one you want, and I'll stay inside verified details.`;
  return {
    answer: spokenWrap(channel, channel === "voice" || aiLens ? (aiLens ? voiceAi : voiceAll) : `Documented projects: ${names}. Recent AI product work is described in the Oraczen experience, not as a separate unlabeled invention. Ask for a slug if you want the problem, users, and outcomes.`),
    sources: ["projects", "experience.oraczen"],
    intent: "Project Deep Dive",
    topic: "Projects",
  };
}

function projectDeepDive(
  project: (typeof cms.projects)[number],
  channel: AgentChannel,
): BrainResult {
  const bits = [
    `${project.title} is a ${project.category} product. ${project.overview}`,
    project.problem ? `The problem on record: ${project.problem}` : "",
    project.users?.length ? `Users: ${project.users.slice(0, 3).join("; ")}.` : "",
    project.outcome ? `Outcome: ${project.outcome}` : "",
    project.metrics?.length
      ? `Metrics: ${project.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    answer: spokenWrap(channel, bits),
    sources: [`projects.${project.slug}`],
    intent: "Project Deep Dive",
    topic: "Projects",
  };
}
