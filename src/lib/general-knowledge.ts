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
      "RAG, retrieval-augmented generation, is how teams ground a language model in an organization's own knowledge. You ingest documents, chunk them, embed them, retrieve the most relevant pieces, optionally rerank, assemble context, then generate. The business problem is trust: fewer hallucinations, better citations, and answers that can stay fresh without retraining the model. Trade-offs are latency, cost, access control, and retrieval quality. RAG is not magic. It is a product system with evaluation, freshness, and failure modes.",
    verifiedNote: ragVerified(),
  },
  {
    id: "mcp",
    match: /\bmcp\b|model context protocol/i,
    title: "MCP",
    explanation:
      "Model Context Protocol is an interoperability idea. It lets an AI client discover tools, resources, and prompts from MCP servers instead of hard-wiring every API. Think of it as a standard way to give an agent context and capabilities, with authorization and permission boundaries. It is not the same as a REST API, and it is not the same as a single function call. In enterprise settings the product questions are identity, least privilege, observability, and governance.",
    verifiedNote: mcpVerified(),
  },
  {
    id: "agentic",
    match: /\bagentic\b|ai agents?\b|multi-agent|tool calling|function calling/i,
    title: "Agentic AI",
    explanation:
      "Agentic AI is when a model can plan, use tools, and work across a workflow instead of answering one prompt. The product job is to bound that autonomy: clear goals, human-in-the-loop, evaluation, cost, latency, and safe failure. Treat agents as workflow software, not magic.",
    verifiedNote: cms.skills.some((s) => /agentic/i.test(s.name))
      ? "The portfolio shows Tushant owning a multi-product agentic AI strategy at Oraczen across chat agents, voice agents, lending AI, spend intelligence, and risk intelligence."
      : undefined,
  },
  {
    id: "llm-eval",
    match: /\bevaluat(e|ion)\b|langfuse|promptfoo|hallucin|groundedness|observab/i,
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
  for (const topic of GENERAL_TOPICS) {
    if (topic.match.test(question)) return topic;
  }
  return null;
}

export function formatGeneralAnswer(topic: GeneralTopic, spoken: boolean) {
  const parts = [topic.explanation];
  if (topic.verifiedNote) {
    parts.push(spoken ? topic.verifiedNote : `Verified in the portfolio: ${topic.verifiedNote}`);
  } else {
    parts.push(
      "I am keeping that as general industry knowledge, not as a personal implementation claim for Tushant, unless the portfolio verifies it.",
    );
  }
  return parts.join(spoken ? " " : "\n\n");
}
