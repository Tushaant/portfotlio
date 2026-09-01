import resume from "../../content/cms/resume.json";
import experience from "../../content/cms/experience.json";
import projects from "../../content/cms/projects.json";
import caseStudies from "../../content/cms/case-studies.json";
import achievements from "../../content/cms/achievements.json";
import skills from "../../content/cms/skills.json";
import techStack from "../../content/cms/tech-stack.json";
import testimonials from "../../content/cms/testimonials.json";
import voiceAgent from "../../content/cms/voice-agent.json";
import site from "../../content/cms/site.json";

export type Resume = typeof resume;
export type Experience = (typeof experience)[number];
export type Project = (typeof projects)[number];
export type CaseStudy = (typeof caseStudies)[number];
export type Achievement = (typeof achievements)[number];
export type Skill = (typeof skills)[number];
export type Testimonial = (typeof testimonials)[number];
export type VoiceAgentConfig = typeof voiceAgent;

export const cms = {
  resume,
  experience,
  projects,
  caseStudies,
  achievements,
  skills,
  techStack,
  testimonials,
  voiceAgent,
  site,
};

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}

export type KnowledgeDoc = {
  id: string;
  section: string;
  title: string;
  /** Extra keywords that should boost retrieval for this doc */
  aliases: string[];
  text: string;
};

function joinList(items: unknown, sep = "; "): string {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        if ("label" in o && "value" in o) return `${o.label}: ${o.value}`;
        return JSON.stringify(item);
      }
      return String(item);
    })
    .join(sep);
}

function pushDoc(
  docs: KnowledgeDoc[],
  id: string,
  section: string,
  title: string,
  aliases: string[],
  parts: Array<string | false | null | undefined>,
) {
  const text = parts.filter(Boolean).join("\n").trim();
  if (!text) return;
  docs.push({
    id,
    section,
    title,
    aliases: aliases.map((a) => a.trim()).filter((a) => a.length >= 2),
    text,
  });
}

/**
 * Structured knowledge documents covering every CMS field on the website.
 * Used by the chat agent for retrieval-grounded answers.
 */
export function buildKnowledgeDocs(): KnowledgeDoc[] {
  const docs: KnowledgeDoc[] = [];

  pushDoc(
    docs,
    "resume.profile",
    "about",
    "Profile and summary",
    [
      "tushant",
      "sharma",
      "about",
      "bio",
      "profile",
      "who",
      "background",
      "summary",
      "hyderabad",
      "director",
      "product manager",
    ],
    [
      `NAME: ${resume.name}`,
      `TITLE: ${resume.title}`,
      `LOCATION: ${resume.location}`,
      `TAGS: ${resume.tags.join(", ")}`,
      `SUMMARY: ${resume.summary}`,
      `CORE COMPETENCIES: ${resume.coreCompetencies.join(", ")}`,
      `HEADLINE METRICS: ${joinList(resume.metrics)}`,
      `SITE BRAND: ${site.brand} · ${site.theme}`,
      `NOTION PORTFOLIO: ${site.notion}`,
    ],
  );

  pushDoc(
    docs,
    "resume.contact",
    "contact",
    "Contact and social",
    ["contact", "email", "phone", "linkedin", "reach", "hire", "connect"],
    [
      `EMAIL: ${resume.email}`,
      `PHONE: ${resume.phone}`,
      `LINKEDIN: ${resume.linkedin}`,
      `RESUME PDF: ${site.social.resume}`,
      `RESUME PAGE: /resume`,
      `NOTION: ${site.notion}`,
    ],
  );

  pushDoc(
    docs,
    "resume.education",
    "education",
    "Education and certifications",
    ["education", "degree", "college", "university", "pmp", "certification"],
    [
      "EDUCATION:",
      ...resume.education.map(
        (e) => `${e.degree} | ${e.institution} | ${e.year}`,
      ),
    ],
  );

  for (const job of experience) {
    pushDoc(
      docs,
      `experience.${job.id}`,
      "experience",
      `${job.role} at ${job.company}`,
      [
        job.company,
        job.role,
        job.id,
        "experience",
        "career",
        "work",
        "job",
        ...(job.active ? ["current", "present", "now"] : []),
      ],
      [
        `COMPANY: ${job.company}`,
        `ROLE: ${job.role}`,
        `PERIOD: ${job.period}`,
        `LOCATION: ${job.location}`,
        job.active ? "STATUS: Current role" : "",
        `METRICS: ${joinList(job.metrics)}`,
        "RESPONSIBILITIES:",
        ...job.responsibilities.map((r) => `- ${r}`),
        `TECHNOLOGIES: ${job.technologies.join(", ")}`,
        `LESSON: ${job.lesson}`,
      ],
    );
  }

  for (const p of projects) {
    pushDoc(
      docs,
      `project.${p.slug}`,
      "projects",
      p.title,
      [
        p.slug,
        p.title,
        p.category,
        p.status,
        "project",
        "delivered",
        "portfolio",
        ...p.tech,
      ],
      [
        `PROJECT: ${p.title}`,
        `SLUG: ${p.slug}`,
        `STATUS: ${p.status}`,
        `CATEGORY: ${p.category}`,
        `TAGLINE: ${p.tagline}`,
        p.liveUrl ? `LIVE URL: ${p.liveUrl}` : "",
        `TECH: ${p.tech.join(", ")}`,
        `HIGHLIGHTS: ${joinList(p.highlights)}`,
        `OVERVIEW: ${p.overview}`,
        `PROBLEM: ${p.problem}`,
        `BUSINESS CONTEXT: ${p.businessContext}`,
        `USERS: ${joinList(p.users)}`,
        `DISCOVERY: ${p.discovery}`,
        `RESEARCH: ${p.research}`,
        `PRD: ${joinList(p.prd)}`,
        `ARCHITECTURE: ${joinList(p.architecture)}`,
        `WIREFRAMES: ${p.wireframes}`,
        `FLOW: ${joinList(p.flow, " → ")}`,
        `CHALLENGES: ${joinList(p.challenges)}`,
        `TRADEOFFS: ${joinList(p.tradeoffs)}`,
        `METRICS: ${joinList(p.metrics)}`,
        `OUTCOME: ${p.outcome}`,
        `LEARNINGS: ${joinList(p.learnings)}`,
        `ROADMAP: ${joinList(p.roadmap)}`,
        `BUSINESS VALUE: ${p.businessValue}`,
        `DETAIL PAGE: /projects/${p.slug}`,
      ],
    );
  }

  for (const c of caseStudies) {
    pushDoc(
      docs,
      `case.${c.slug}`,
      "case-studies",
      c.title,
      [
        c.slug,
        c.title,
        c.company,
        "case study",
        "casestudy",
        ...(c.featured ? ["featured"] : []),
      ],
      [
        `CASE STUDY: ${c.title}`,
        `COMPANY: ${c.company}`,
        `PERIOD: ${c.period}`,
        c.featured ? "FEATURED: Yes" : "",
        `SUMMARY: ${c.summary}`,
        `CHALLENGE: ${c.challenge}`,
        `RESEARCH: ${c.research}`,
        `DISCOVERY: ${c.discovery}`,
        `STAKEHOLDERS: ${joinList(c.stakeholders)}`,
        `PRIORITIZATION: ${c.prioritization}`,
        `ROADMAP: ${joinList(c.roadmap)}`,
        `USER STORIES: ${joinList(c.userStories)}`,
        `ARCHITECTURE: ${joinList(c.architecture)}`,
        `LAUNCH: ${c.launch}`,
        `KPIS: ${joinList(c.kpis)}`,
        `METRICS: ${joinList(c.metrics)}`,
        `FAILURES: ${c.failures}`,
        `LESSONS: ${joinList(c.lessons)}`,
        `RETROSPECTIVE: ${c.retrospective}`,
        c.notionUrl ? `NOTION: ${c.notionUrl}` : "",
        `DETAIL PAGE: /case-studies/${c.slug}`,
      ],
    );
  }

  for (const a of achievements) {
    const metrics =
      a.metrics && Object.keys(a.metrics).length
        ? Object.entries(a.metrics)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ")
        : "";
    const desc =
      "description" in a && a.description ? String(a.description) : "";
    pushDoc(
      docs,
      `achievement.${a.id}`,
      "achievements",
      a.title,
      [
        a.id,
        a.title,
        a.org,
        a.type,
        "achievement",
        "award",
        "certification",
        "trophy",
        "milestone",
      ],
      [
        `ACHIEVEMENT: ${a.title}`,
        `TYPE: ${a.type}`,
        `ORG: ${a.org}`,
        `YEAR: ${a.year}`,
        desc ? `DESCRIPTION: ${desc}` : "",
        metrics ? `METRICS: ${metrics}` : "",
        "link" in a && a.link ? `LINK: ${a.link}` : "",
      ],
    );
  }

  for (const s of skills) {
    pushDoc(
      docs,
      `skill.${s.id}`,
      "skills",
      s.name,
      [s.id, s.name, s.tier, "skill", "capability", "competency", ...s.tools],
      [
        `SKILL: ${s.name}`,
        `TIER: ${s.tier}`,
        `EXPERIENCE: ${s.experience}`,
        `PROJECTS: ${joinList(s.projects)}`,
        `TOOLS: ${joinList(s.tools)}`,
        `EXAMPLE: ${s.example}`,
      ],
    );
  }

  pushDoc(
    docs,
    "tech-stack",
    "tech-stack",
    "Technology stack",
    ["tech", "stack", "tools", "platforms", "integrations", "technology"],
    [
      "TECH STACK:",
      ...Object.entries(techStack).map(
        ([group, items]) => `${group}: ${(items as string[]).join(", ")}`,
      ),
    ],
  );

  for (const t of testimonials) {
    const highlight =
      "highlight" in t && t.highlight ? String(t.highlight) : "";
    pushDoc(
      docs,
      `testimonial.${t.id}`,
      "testimonials",
      `${t.name} recommendation`,
      [
        t.id,
        t.name,
        t.company || "",
        "testimonial",
        "recommendation",
        "review",
        "client",
      ],
      [
        `TESTIMONIAL FROM: ${t.name}`,
        `ROLE: ${t.role}${t.company ? ` at ${t.company}` : ""}`,
        "date" in t && t.date ? `DATE: ${t.date}` : "",
        highlight ? `HIGHLIGHT: ${highlight}` : "",
        `QUOTE: ${t.quote}`,
      ],
    );
  }

  pushDoc(
    docs,
    "site.navigation",
    "site",
    "Website sections",
    ["website", "portfolio", "sections", "pages", "site", "navigate"],
    [
      `BRAND: ${site.brand}`,
      `THEME: ${site.theme}`,
      `SECTIONS: ${site.nav.map((n) => `${n.label} (${n.href})`).join(", ")}`,
      `PROJECT COUNT: ${projects.length}`,
      `CASE STUDY COUNT: ${caseStudies.length}`,
      `SKILL COUNT: ${skills.length}`,
      `ACHIEVEMENT COUNT: ${achievements.length}`,
      `TESTIMONIAL COUNT: ${testimonials.length}`,
      `EXPERIENCE ROLES: ${experience.length}`,
    ],
  );

  return docs;
}

/** Flattened corpus string (legacy helpers / debugging). */
export function buildKnowledgeBase(): string {
  return buildKnowledgeDocs()
    .map((d) => `[${d.section}] ${d.title}\n${d.text}`)
    .join("\n\n");
}
