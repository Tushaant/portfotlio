import { cms } from "./cms";

export type GeneralTopic = {
  id: string;
  match: RegExp;
  title: string;
  explanation: string;
  verifiedNote?: string;
};

function ragVerified() {
  return cms.skills.some((s) => /rag/i.test(s.name))
    ? "Tushant's portfolio documents enterprise RAG at Oraczen, including semantic, hybrid, self, memory, and graph retrieval, integrated with Model Context Protocol."
    : undefined;
}

function mcpVerified() {
  return cms.resume.coreCompetencies.some((c) => /\bMCP\b/i.test(c))
    ? "The resume lists MCP platform and servers as a core competency, and Oraczen experience describes RAG pipelines integrated with Model Context Protocol."
    : undefined;
}

export const GENERAL_TOPICS: GeneralTopic[] = [
  {
    id: "rag",
    match: /\brag\b|retrieval[- ]augmented|vector search|embeddings?\b|ground(ed|ing) (knowledge|response)/i,
    title: "RAG",
    explanation:
      "RAG, retrieval-augmented generation, is how you give a model relevant information at runtime instead of hoping it memorized your enterprise knowledge. You retrieve the best pieces, put them in context, then generate. The product question is whether that actually improves trust, freshness, latency, and operational value, not whether the diagram looks complete.",
    verifiedNote: ragVerified(),
  },
  {
    id: "mcp",
    match: /\bmcp\b|model context protocol/i,
    title: "MCP",
    explanation:
      "MCP, Model Context Protocol, is a standard way for an AI application to connect to tools and sources of context. Think of it as a common interface rather than a one-off integration for every system. In enterprises the interesting questions are identity, permissions, and governance, not the acronym itself.",
    verifiedNote: mcpVerified(),
  },
  {
    id: "agentic",
    match: /\bagentic\b|ai agents?\b|multi-agent|tool calling|function calling/i,
    title: "Agentic AI",
    explanation:
      "Agentic AI is when a system can plan, use tools, and move through a workflow instead of answering a single prompt. The product job is to bound that autonomy: goals, human review, evaluation, cost, and what happens when it is wrong.",
    verifiedNote: cms.skills.some((s) => /agentic/i.test(s.name))
      ? "The portfolio shows Tushant owning a multi-product agentic AI strategy at Oraczen across chat agents, voice agents, lending AI, spend intelligence, and risk intelligence."
      : undefined,
  },
  {
    id: "knowledge-graph",
    match: /\bknowledge graphs?\b|\bgraph rag\b|\bgraphrag\b/i,
    title: "Knowledge Graphs",
    explanation:
      "A knowledge graph stores entities and relationships, not just documents. Graph RAG uses those links so retrieval can follow connections, not only nearest-neighbor text. The product value shows up when the question is about how things relate. The cost is modeling discipline and data quality.",
    verifiedNote: cms.experience.some((j) =>
      j.responsibilities.some((r) => /knowledge graph/i.test(r)),
    )
      ? "Oraczen experience documents introducing a knowledge graph alongside enterprise RAG pipelines integrated with MCP."
      : undefined,
  },
  {
    id: "observability",
    match: /\b(ai observability|observability|tracing)\b/i,
    title: "AI Observability",
    explanation:
      "AI observability is how you see what the system did in production: traces, latency, errors, retrieval quality, and outcomes. Without that, evaluation stays a lab exercise.",
    verifiedNote: cms.experience.some((j) => /Grafana/i.test(j.technologies.join(" ")))
      ? "Verified Oraczen work includes LLM evaluation with Langfuse, Grafana, and Promptfoo."
      : undefined,
  },
  {
    id: "voice-ai",
    match: /\b(voice ai|speech to text|text to speech|realtime voice)\b/i,
    title: "Voice AI",
    explanation:
      "Voice AI is a pipeline: capture audio, turn it into text, reason, then speak back. Interruption, permissions, and latency are product problems, not polish.",
    verifiedNote: cms.experience.some((j) => /Voice Agents/i.test(j.technologies.join(" ")))
      ? "Oraczen's documented AI platform strategy includes Voice Agents, and the tech stack lists AssemblyAI, GPT-4o Transcribe, Azure OpenAI Realtime, Agora, and Twilio."
      : undefined,
  },
  {
    id: "llm-eval",
    match: /\bevaluat(e|ion)\b|langfuse|promptfoo|hallucin|groundedness/i,
    title: "AI evaluation",
    explanation:
      "AI evaluation is how you know a product is safe to operate. You measure accuracy, groundedness, latency, error rate, and failure modes. You watch production with tracing and quality gates. You do not ship a demo and hope. The leadership questions are: can we measure it, can we govern it, and can we keep it inside an SLA.",
    verifiedNote: cms.skills.some((s) => /evaluat/i.test(s.name))
      ? "Verified Oraczen work includes an evaluation harness and red-teaming, with documented accuracy around 92 to 95 percent, P95 under 1.5 seconds, error rate under 0.75 percent, and 99 percent plus uptime."
      : undefined,
  },
  {
    id: "auth",
    match: /\b(oauth|oidc|openid|jwt|sso|authentication|authorization|rbac|iam|mfa)\b/i,
    title: "Authentication and security",
    explanation:
      "Authentication answers who you are. Authorization answers what you may do. A session is how the app keeps that state. JWT is a token format for claims. SSO lets people sign in across apps through one identity provider. OAuth is an authorization framework. OIDC is the identity layer on top of OAuth. In products, get token lifetime, rotation, revocation, least privilege, and audit logs right before you talk about features.",
  },
  {
    id: "docker",
    match: /\bdocker\b|containers?\b|dockerfile/i,
    title: "Docker",
    explanation:
      "Docker packages an app and its runtime into a container image so it runs the same way on a laptop and in production. That helps consistency and deploy speed. The product trade-offs are operational complexity, image security, and how you handle secrets, networking, and volumes. Docker is not the same as a full orchestrator.",
  },
  {
    id: "kubernetes",
    match: /\bkubernetes\b|\bk8s\b|orchestration|pods?\b/i,
    title: "Kubernetes",
    explanation:
      "Kubernetes orchestrates containers across a cluster: pods, deployments, services, scaling, and health checks. Organizations use it when they need availability and scale, not because the diagram looks impressive. The real trade-off is operational maturity versus reliability, cost, and team skill.",
  },
  {
    id: "system-design",
    match: /\bsystem design\b|microservices?|event-driven|load balanc|horizontal scal|architecture diagram/i,
    title: "System design",
    explanation:
      "Good system design starts with the business requirement, then users, traffic, data, and constraints. Then you choose APIs, services, storage, caching, and whether work is synchronous or queued. Then you talk availability, security, cost, and operational complexity. Architecture is a set of trade-offs, not a trophy.",
  },
  {
    id: "pm",
    match: /\b(product management|product strategy|roadmap|prioritiz|rice\b|moscow|okrs?\b|north star|product-market fit|jobs to be done|discovery)\b/i,
    title: "Product management",
    explanation:
      "Product management is choosing what to build, for whom, and why now. You frame the customer problem, size the opportunity, weigh options, prioritize under constraints, ship, measure, and learn. Frameworks like RICE or MoSCoW are tools, not a personality. The job is judgment: impact, effort, risk, and sequencing.",
  },
  {
    id: "governance",
    match: /\b(responsible ai|ai governance|prompt injection|data leakage|compliance|pci|hipaa|gdpr)\b/i,
    title: "Enterprise AI governance",
    explanation:
      "Enterprise AI is not only can we build it. It is should we, can we operate it safely, can we measure it, and can we govern it. That includes access control, human oversight, evaluation, monitoring, privacy, and change management. A product that cannot be audited is not an enterprise product.",
    verifiedNote: /HIPAA|PCI|GDPR/i.test(cms.resume.summary)
      ? "Tushant's resume documents regulatory experience including PCI-DSS, HIPAA, and GDPR in enterprise AI and SaaS delivery."
      : undefined,
  },
];

export function matchGeneralTopic(question: string): GeneralTopic | null {
  const prioritized = [
    ...GENERAL_TOPICS.filter((t) => t.id === "knowledge-graph"),
    ...GENERAL_TOPICS.filter((t) => t.id !== "knowledge-graph"),
  ];
  for (const topic of prioritized) {
    if (topic.match.test(question)) return topic;
  }
  return null;
}

export function formatGeneralAnswer(topic: GeneralTopic, spoken: boolean) {
  const general = spoken
    ? `In general, ${topic.explanation}`
    : `In general: ${topic.explanation}`;
  const parts = [general];
  if (topic.verifiedNote) {
    parts.push(
      spoken
        ? `In Tushant's documented experience, ${topic.verifiedNote}`
        : `In Tushant's documented experience: ${topic.verifiedNote}`,
    );
  } else {
    parts.push(
      spoken
        ? "I'm keeping that as general professional knowledge, not as Tushant's personal implementation unless the portfolio verifies it."
        : "I am keeping that as general industry knowledge, not as a personal implementation claim for Tushant, unless the portfolio verifies it.",
    );
  }
  return parts.join(spoken ? " " : "\n\n");
}
