import { cms } from "@/lib/cms";

/** Internal resume version. Not shown to recruiters. */
export const RESUME_VERSION = "2026.10";

export type PortfolioLens = "executive" | "product" | "technical";

export type EvidenceKind = "verified" | "perspective" | "framework";

const resume = cms.resume;
const oraczen = cms.experience.find((job) => job.id === "oraczen");
const emb = cms.experience.find((job) => job.id === "emb");
const oraczenStudy = cms.caseStudies.find((study) => study.slug === "agentic-ai-banking-platform");

export const contact = {
  name: resume.name,
  location: resume.location,
  email: resume.email,
  phone: resume.phone,
  linkedin: resume.linkedin,
  github: "https://github.com/Tushaant",
  notion: cms.site.notion,
} as const;

export const positioning = {
  brand: "TUSHANT.AI",
  name: resume.name,
  role: "AI Product Manager / Acting Director of Product Management",
  statement: "AI Product Leader building enterprise AI from 0 to 1 and 1 to N.",
  summary:
    "AI product leader with more than ten years of experience across enterprise AI, agentic systems, and SaaS. He currently serves as AI Product Manager and Acting Director of Product Management at Oraczen in Hyderabad, owning a $6.4M agentic portfolio for a $12.4B U.S. banking client. His scope covers product strategy, roadmaps, commercial outcomes, and cross-functional leadership, with product direction across RAG, MCP, evaluation, voice, and governance.",
} as const;

export const heroMetrics = [
  {
    value: "10+",
    label: "Years",
    context: "Enterprise AI and SaaS",
    where: "Career",
    when: "2016 to present",
  },
  {
    value: "$6.4M",
    label: "AI portfolio",
    context: "Agentic AI P&L",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "$12.4B",
    label: "Enterprise client",
    context: "U.S. banking enterprise",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "40+",
    label: "Leadership scope",
    context: "Cross-functional, as stated in the resume summary. Direct org hired and managed is 8+.",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "26",
    label: "Products",
    context: "Fintech and SaaS portfolio",
    where: "EMB Global",
    when: "Sep 2022 to Apr 2025",
  },
  {
    value: "₹7.78 Cr",
    label: "Revenue",
    context: "Category portfolio",
    where: "EMB Global",
    when: "Sep 2022 to Apr 2025",
  },
] as const;

export const impactMetrics = [
  {
    value: "$6.4M",
    label: "Agentic AI portfolio",
    detail: "P&L accountability for the multi-product AI portfolio at Oraczen.",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "40+",
    label: "Cross-functional leadership",
    detail:
      "The resume summary describes leadership of 40+ cross-functional members. The organization he hired and managed is documented as 8+: 3 product managers, 3 developers, 1 QA, and 1 designer.",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "26",
    label: "Products at EMB",
    detail: "Fintech and SaaS products under category ownership.",
    where: "EMB Global",
    when: "Sep 2022 to Apr 2025",
  },
  {
    value: "₹7.78 Cr",
    label: "Revenue",
    detail: "Revenue attributed to the EMB portfolio he led.",
    where: "EMB Global",
    when: "Sep 2022 to Apr 2025",
  },
  {
    value: "+30%",
    label: "Release velocity",
    detail: "Increase after Agile restructuring of the Oraczen product organization.",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "92-95%",
    label: "LLM evaluation accuracy",
    detail: "Evaluation harness using Langfuse, Grafana, and Promptfoo red-teaming.",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "<1.5s",
    label: "P95 latency",
    detail: "Latency bar instituted alongside accuracy, error rate under 0.75%, and a 99%+ uptime SLA.",
    where: "Oraczen",
    when: "May 2025 to present",
  },
  {
    value: "+82%",
    label: "Enterprise retention",
    detail: "Retention improvement from GTM work on enterprise SaaS adoption.",
    where: "EMB Global",
    when: "Sep 2022 to Apr 2025",
  },
] as const;

export const ownership = [
  "Product strategy",
  "P&L",
  "Roadmap",
  "Customer",
  "GTM",
  "Team",
  "Delivery",
  "Quality",
  "AI governance",
  "Executive stakeholders",
] as const;

export const executiveBrief = {
  title: "30-second brief",
  text: positioning.summary,
  speech:
    "Tushant is an AI product leader with more than ten years of experience. He is AI Product Manager and Acting Director of Product Management at Oraczen, owning a six point four million dollar agentic portfolio for a twelve point four billion dollar U.S. banking client. He leads product strategy, roadmaps, and cross-functional teams, and he directs work across retrieval, MCP, evaluation, voice, and governance. Before Oraczen he led twenty six fintech and SaaS products at EMB Global, generating seven point seven eight crore rupees in revenue.",
};

export const architectureLayers = [
  {
    id: "user",
    name: "User",
    meaning: "Start from the person doing the work and the job they cannot finish with the current process.",
    applied: "Four or more process-discovery workshops with business stakeholders at Oraczen, documenting current-state workflows and bottlenecks before a model decision.",
    project: "Oraczen agentic platform",
    technology: "Stakeholder workshops",
    outcome: "A current-state map that separated what should stay conventional from what needed retrieval or an agent.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "experience",
    name: "Experience",
    meaning: "The product surface is the conversation, the workflow, or the decision the user actually touches.",
    applied: "Chat Agents and Voice Agents are named products in the Oraczen platform strategy, built from customer problems into SaaS.",
    project: "Chat Agents and Voice Agents",
    technology: "Conversational and voice AI",
    outcome: "Customer and end-user problems turned into market-ready product surfaces.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "agent",
    name: "Agent / orchestration",
    meaning: "An agent is a product boundary: which tasks it may complete, which it must hand back, and how work is sequenced.",
    applied: "Multi-product strategy spanning Chat Agents, Voice Agents, Lending AI, Spend Intelligence, and Risk Intelligence.",
    project: "Oraczen agentic portfolio",
    technology: "Agentic AI",
    outcome: "A $6.4M portfolio with a path from 0 to 1 surfaces toward 1 to N scaling.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "rag",
    name: "RAG / knowledge",
    meaning: "Retrieval is the product choice when the answer depends on enterprise documents rather than a retrained model.",
    applied:
      "The Oraczen case study records a discovery split: deterministic work stayed conventional, context-heavy work used RAG, and conversation-driven work used agents. Enterprise RAG pipelines and a knowledge graph were then introduced.",
    project: "Enterprise knowledge workflows",
    technology: "RAG, knowledge graph",
    outcome: "Manual, context-heavy processes replaced with AI-driven workflows grounded in enterprise knowledge.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "mcp",
    name: "MCP / tools / APIs",
    meaning: "Tools should be a shared protocol, not a new integration for every agent.",
    applied: "RAG pipelines were integrated with Model Context Protocol so agents could reach enterprise systems.",
    project: "Oraczen platform",
    technology: "MCP",
    outcome: "Agents connected to enterprise systems through a protocol instead of one-off manual handoffs.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "evaluation",
    name: "Evaluation",
    meaning: "A model claim is not a launch decision until accuracy, latency, and failure modes are measured.",
    applied: "LLM evaluation with Langfuse, Grafana, and Promptfoo red-teaming.",
    project: "Oraczen AI quality",
    technology: "Langfuse, Promptfoo",
    outcome: "92-95% accuracy, P95 latency under 1.5 seconds, and an error rate under 0.75%.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "observability",
    name: "Observability",
    meaning: "Production AI needs the same operational visibility as any other critical workflow.",
    applied: "Grafana and Langfuse are part of the instituted quality and operations stack, with a 99%+ uptime SLA.",
    project: "Oraczen AI quality and ops",
    technology: "Grafana, Langfuse",
    outcome: "Accuracy, latency, and uptime reported as operating bars rather than anecdotes.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "governance",
    name: "Governance",
    meaning: "Release governance is part of the product, especially when HIPAA, PCI-DSS, or GDPR applies.",
    applied: "Architecture Review Board release governance at 95% adherence, with HIPAA, PCI-DSS, and GDPR compliance across AI deployments.",
    project: "Oraczen releases",
    technology: "ARB, compliance controls",
    outcome: "Deployments gated by review and compliance sign-off.",
    kind: "verified" as EvidenceKind,
  },
  {
    id: "outcome",
    name: "Business outcome",
    meaning: "The architecture is finished only when it changes a commercial or operating result.",
    applied: "Portfolio ownership, release velocity, and enterprise client context are the recorded outcomes.",
    project: "Oraczen and EMB",
    technology: "Product operating cadence",
    outcome: "$6.4M portfolio, +30% release velocity at Oraczen, and ₹7.78 Cr across 26 EMB products.",
    kind: "verified" as EvidenceKind,
  },
] as const;

export const productDecisions = [
  {
    question: "Why RAG for context-heavy work?",
    kind: "verified" as EvidenceKind,
    context: "Banking workflows mixed deterministic steps, document-heavy judgement, and conversation.",
    options: "The recorded discovery split work into conventional automation, retrieval, and agents.",
    tradeoff: "Retrieval keeps answers tied to enterprise documents. It adds a knowledge system that has to be governed.",
    decision: "Context-heavy processes used enterprise RAG and a knowledge graph. Conversation-driven processes used agents.",
    outcome: "Manual document handling was replaced with knowledge workflows inside the agentic platform.",
  },
  {
    question: "Why MCP instead of a new integration for every agent?",
    kind: "verified" as EvidenceKind,
    context: "Several agent products needed access to the same enterprise systems.",
    options: "Point-to-point integrations per agent, or a shared tool protocol.",
    tradeoff: "A protocol costs an upfront platform decision. Separate integrations cost more every time a new agent ships.",
    decision: "RAG pipelines were integrated with Model Context Protocol.",
    outcome: "Agents reached enterprise systems through MCP rather than manual handoffs.",
  },
  {
    question: "How do you balance model quality and latency?",
    kind: "verified" as EvidenceKind,
    context: "Executive sponsors needed accuracy they could defend, and workflows needed to stay fast.",
    options: "Optimize only for accuracy, or publish a joint quality bar.",
    tradeoff: "A stricter accuracy target can slow the path. A latency-only target can ship answers the business cannot trust.",
    decision: "The instituted bar measured both: 92-95% accuracy and P95 latency under 1.5 seconds, plus error rate and uptime.",
    outcome: "Quality and latency shipped as one operating standard, not competing anecdotes.",
  },
  {
    question: "How do you handle AI governance?",
    kind: "verified" as EvidenceKind,
    context: "Deployments sat under HIPAA, PCI-DSS, and GDPR, with an Architecture Review Board.",
    options: "Treat review as a late gate, or build it into the release path.",
    tradeoff: "Early review slows the first release and reduces rework later.",
    decision: "ARB-compliant release governance, recorded at 95% adherence.",
    outcome: "Compliance sign-off became part of deployment rather than a surprise at the end.",
  },
  {
    question: "How do you prioritize AI features?",
    kind: "perspective" as EvidenceKind,
    context: "The Oraczen case study sequences work by risk-adjusted value: high-volume manual processes with clear evaluation criteria first.",
    options: "RICE and MoSCoW are part of his toolkit. The recorded sequence favored provable surfaces before expanding scope.",
    tradeoff: "Shipping the clearest evaluation case first delays flashier surface area.",
    decision: "My product perspective is to prove accuracy on the highest-volume workflow before widening the agent.",
    outcome: "The portfolio expanded from Chat Agents toward voice, lending, spend, and risk only as the platform held.",
  },
  {
    question: "When is an AI feature ready for production?",
    kind: "perspective" as EvidenceKind,
    context: "Early Oraczen iterations could not defend accuracy claims to the ARB without an evaluation harness.",
    options: "Launch on a demo, or launch when evaluation, red-teaming, and governance are in place.",
    tradeoff: "Waiting for a harness delays the first demo. Shipping without it fails executive review.",
    decision: "I treat evaluation infrastructure as a launch requirement. Happy-path testing is not enough.",
    outcome: "Promptfoo red-teaming exposed failure modes that had not appeared in happy-path testing, and those became part of the release bar.",
  },
  {
    question: "How do you measure AI product success?",
    kind: "perspective" as EvidenceKind,
    context: "The measures already instituted at Oraczen are accuracy, latency, error rate, uptime, governance adherence, and release velocity. At EMB they were revenue, retention, and onboarding time.",
    options: "Model benchmarks alone, or operating and commercial outcomes together.",
    tradeoff: "Benchmarks without a business result do not tell a leadership story. Business results without quality bars do not tell an AI story.",
    decision: "I read success as the pair: a quality bar the operator can defend, and a commercial or delivery outcome.",
    outcome: "Those pairs are the numbers on this site. I do not add a metric that the portfolio does not record.",
  },
] as const;

export const learningStory = {
  kind: "verified" as EvidenceKind,
  source: "Oraczen case study, failures and lessons already in the portfolio.",
  happened:
    "Early iterations showed that model quality alone did not survive enterprise scrutiny. Without a formal evaluation harness, accuracy claims could not be defended to the Architecture Review Board.",
  impact: "Accuracy claims were not credible to the review board, so the product could not move as a governed release.",
  cause: "Evaluation was not treated as a launch requirement. Happy-path testing missed failure modes.",
  action: "LLM evaluation was instituted with Langfuse, Grafana, and Promptfoo red-teaming, alongside ARB release governance.",
  lesson: "Evaluation infrastructure is a launch requirement. Governance early turns the review board into part of delivery, and agentic scope should expand only after the current surface holds its accuracy bar.",
};

export const skillEvidence: Record<
  string,
  { category: string; where: string; project: string; outcome: string }
> = {
  agentic: {
    category: "AI product",
    where: "Oraczen",
    project: "Enterprise agentic AI",
    outcome: "$6.4M portfolio across chat, voice, lending, spend, and risk.",
  },
  rag: {
    category: "AI product",
    where: "Oraczen",
    project: "Enterprise knowledge workflows",
    outcome: "Manual document processes replaced with RAG and a knowledge graph.",
  },
  "llm-eval": {
    category: "AI product",
    where: "Oraczen",
    project: "AI quality and ops",
    outcome: "92-95% accuracy and P95 latency under 1.5 seconds.",
  },
  enterprise: {
    category: "Product leadership",
    where: "Oraczen, EMB, Filmboard, IBM",
    project: "Portfolio and category ownership",
    outcome: "Roadmap and P&L ownership, including ₹7.78 Cr at EMB.",
  },
  voice: {
    category: "AI product",
    where: "Oraczen",
    project: "Voice Agents",
    outcome: "Voice included in the multi-product AI strategy.",
  },
};

export type TechLevel = "Hands-on" | "Product ownership" | "Working knowledge";

const TECH_LEVELS: Record<string, { level: TechLevel; where: string; usedFor: string; project: string }> = {
  RAG: {
    level: "Product ownership",
    where: "Oraczen",
    usedFor: "Enterprise retrieval for context-heavy workflows",
    project: "Agentic AI platform",
  },
  MCP: {
    level: "Product ownership",
    where: "Oraczen",
    usedFor: "Connecting agents to enterprise systems",
    project: "Agentic AI platform",
  },
  Langfuse: {
    level: "Product ownership",
    where: "Oraczen",
    usedFor: "LLM evaluation and observability",
    project: "AI quality and ops",
  },
  Promptfoo: {
    level: "Product ownership",
    where: "Oraczen",
    usedFor: "Red-teaming before release",
    project: "AI quality and ops",
  },
  Grafana: {
    level: "Product ownership",
    where: "Oraczen",
    usedFor: "Operational visibility for AI services",
    project: "AI quality and ops",
  },
  "Azure OpenAI": {
    level: "Product ownership",
    where: "Oraczen",
    usedFor: "Model platform for agent products",
    project: "Agentic AI platform",
  },
  "OpenAI SDK": {
    level: "Working knowledge",
    where: "Resume toolkit",
    usedFor: "Listed with voice and model tooling",
    project: "Voice and agent products",
  },
};

export function techEvidence(name: string) {
  return (
    TECH_LEVELS[name] ?? {
      level: "Working knowledge" as TechLevel,
      where: "Resume technical toolkit",
      usedFor: "Listed on the resume. A specific project outcome is not separately documented for this item.",
      project: "See the matching experience section",
    }
  );
}

export function bulletMatchesLens(text: string, lens: PortfolioLens) {
  const value = text.toLowerCase();
  if (lens === "executive") {
    return /p&l|portfolio|revenue|client|stakeholder|c-suite|gtm|retention|hired|director|crore|enterprise|coo|cto|svp/.test(
      value,
    );
  }
  if (lens === "product") {
    return /roadmap|strategy|product|customer|onboarding|discovery|workshop|feature|user|retention|feedback|market/.test(
      value,
    );
  }
  return /rag|mcp|llm|api|model|dashboard|latency|grafana|langfuse|evaluat|architect|compliance|hipaa|pci|gdpr|voice|agent|analytics|knowledge graph/.test(
    value,
  );
}

export const flagshipStudies = [
  "agentic-ai-banking-platform",
  "enterprise-saas-category-turnaround",
  "b2b-marketplace-churn-reduction",
  "credit-risk-analytics",
] as const;

export const researchStudies = [
  "gumroad-creator-commerce",
  "amazon-minitv-growth",
  "astrotalk-india-traction",
  "lenskart-virtual-try-on",
] as const;

export function profileContradictions() {
  const issues: string[] = [];
  if (!oraczen) issues.push("Missing Oraczen experience.");
  if (oraczen && !/May 2025/.test(oraczen.period)) issues.push("Oraczen dates drifted.");
  if (oraczen && !oraczen.metrics.some((metric) => metric.value === "$6.4M")) issues.push("Missing $6.4M.");
  if (emb && !emb.metrics.some((metric) => metric.value === "₹7.78 Cr")) issues.push("Missing EMB revenue.");
  if (!heroMetrics.some((metric) => metric.value === "40+" && /8\+/.test(metric.context))) {
    issues.push("40+ leadership scope is missing its 8+ direct-org context.");
  }
  if (oraczen && !oraczen.responsibilities.some((line) => /8\+ member/.test(line))) {
    issues.push("Direct 8+ organization bullet missing.");
  }
  if (!oraczenStudy?.failures) issues.push("Learning story has no case-study source.");
  if (contact.email !== "Tushant.s4@gmail.com") issues.push("Email drifted.");
  return issues;
}
