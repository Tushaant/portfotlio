import resume from "../../content/cms/resume.json";
import experience from "../../content/cms/experience.json";
import projects from "../../content/cms/projects.json";
import caseStudies from "../../content/cms/case-studies.json";
import achievements from "../../content/cms/achievements.json";
import skills from "../../content/cms/skills.json";
import techStack from "../../content/cms/tech-stack.json";
import testimonials from "../../content/cms/testimonials.json";
import site from "../../content/cms/site.json";

export type Resume = typeof resume;
export type Experience = (typeof experience)[number];
export type Project = (typeof projects)[number];
export type CaseStudy = (typeof caseStudies)[number];
export type Achievement = (typeof achievements)[number];
export type Skill = (typeof skills)[number];
export type Testimonial = (typeof testimonials)[number];

export const cms = {
 resume,
 experience,
 projects,
 caseStudies,
 achievements,
 skills,
 techStack,
 testimonials,
 site,
};

export function getProject(slug: string) {
 return projects.find((p) => p.slug === slug);
}

export function getCaseStudy(slug: string) {
 return caseStudies.find((c) => c.slug === slug);
}

/** Build a searchable knowledge corpus strictly from resume + CMS portfolio data. */
export function buildKnowledgeBase(): string {
 const lines: string[] = [];
 lines.push(`NAME: ${resume.name}`);
 lines.push(`TITLE: ${resume.title}`);
 lines.push(`LOCATION: ${resume.location}`);
 lines.push(`EMAIL: ${resume.email}`);
 lines.push(`PHONE: ${resume.phone}`);
 lines.push(`LINKEDIN: ${resume.linkedin}`);
 lines.push(`SUMMARY: ${resume.summary}`);
 lines.push(`CORE COMPETENCIES: ${resume.coreCompetencies.join(", ")}`);
 lines.push("EXPERIENCE:");
 for (const job of experience) {
 lines.push(
 `${job.company} | ${job.role} | ${job.period} | ${job.location}`,
 );
 job.responsibilities.forEach((r) => lines.push(`- ${r}`));
 lines.push(`Technologies: ${job.technologies.join(", ")}`);
 lines.push(`Lesson: ${job.lesson}`);
 }
 lines.push("EDUCATION:");
 resume.education.forEach((e) =>
 lines.push(`${e.degree} | ${e.institution} | ${e.year}`),
 );
 lines.push("TECH STACK:");
 Object.entries(techStack).forEach(([group, items]) =>
 lines.push(`${group}: ${(items as string[]).join(", ")}`),
 );
 lines.push("PROJECTS:");
 for (const p of projects) {
 lines.push(
 `${p.title} (${p.status}, ${p.category}): ${p.tagline}. ${p.overview} Outcome: ${p.outcome} Business value: ${p.businessValue}`,
 );
 }
 lines.push("CASE STUDIES:");
 for (const c of caseStudies) {
 lines.push(
 `${c.title} @ ${c.company}: ${c.summary} Challenge: ${c.challenge} Lessons: ${c.lessons.join("; ")}`,
 );
 }
 lines.push("ACHIEVEMENTS:");
 for (const a of achievements) {
  const metrics =
   a.metrics && Object.keys(a.metrics).length
    ? ` Metrics: ${Object.entries(a.metrics)
       .map(([k, v]) => `${k}=${v}`)
       .join(", ")}.`
    : "";
  const desc =
   "description" in a && a.description ? ` ${a.description}` : "";
  lines.push(`${a.title} · ${a.org} (${a.year}).${desc}${metrics}`);
 }
 lines.push("TESTIMONIALS:");
 for (const t of testimonials) {
  lines.push(
   `${t.name} (${t.role}${t.company ? `, ${t.company}` : ""}): "${t.quote}"`,
  );
 }
 lines.push(
  "APP SCALE HIGHLIGHTS: Veda Academy Learning App has 1L+ Google Play downloads (4.6★). Major Kalshi Classes (MKC) Learning App has 1M+ downloads listed as 10L+ on Google Play (4.3★).",
 );
 return lines.join("\n");
}
