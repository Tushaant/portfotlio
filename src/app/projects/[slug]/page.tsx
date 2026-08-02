import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cms, getProject } from "@/lib/cms";
import { InfoBlock, InfoTemplate3D } from "@/components/layout/InfoTemplate3D";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return cms.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.tagline,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  return (
    <InfoTemplate3D
      eyebrow="PROJECT CASE FILE"
      title={p.title}
      subtitle={p.tagline}
      actions={
        <>
          <Link
            href="/#projects"
            className="glass rounded-full px-4 py-2 text-sm text-slate-300"
          >
            ← back to command center
          </Link>
          {p.liveUrl && (
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm text-cyan-200"
            >
              Live site →
            </a>
          )}
          <span
            className={`rounded-full px-3 py-2 text-xs ${
              p.status === "DELIVERED"
                ? "bg-green-400/15 text-green-300"
                : "bg-fuchsia-400/15 text-fuchsia-300"
            }`}
          >
            {p.status} · {p.category}
          </span>
        </>
      }
    >
      {p.image && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={p.image}
            alt={`${p.title} interface`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {p.highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {p.highlights.map((h) => (
            <div key={h.label} className="glass rounded-2xl p-4">
              <p className="display text-xl text-cyan-300">{h.value}</p>
              <p className="text-xs text-slate-500">{h.label}</p>
            </div>
          ))}
        </div>
      )}

      <InfoBlock label="OVERVIEW">{p.overview}</InfoBlock>
      <InfoBlock label="PROBLEM">{p.problem}</InfoBlock>
      <InfoBlock label="BUSINESS CONTEXT">{p.businessContext}</InfoBlock>
      <InfoBlock label="USERS">
        <ul className="list-disc space-y-1 pl-5">
          {p.users.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="DISCOVERY">{p.discovery}</InfoBlock>
      <InfoBlock label="RESEARCH">{p.research}</InfoBlock>
      <InfoBlock label="PRD">
        <ul className="list-disc space-y-1 pl-5">
          {p.prd?.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="ARCHITECTURE">
        <ul className="list-disc space-y-1 pl-5">
          {p.architecture.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="WIREFRAMES & PROTOTYPING">{p.wireframes}</InfoBlock>
      <InfoBlock label="USER FLOW">
        <div className="flex flex-wrap gap-2">
          {p.flow.map((step, i) => (
            <span
              key={step}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs"
            >
              <span className="text-cyan-400">{i + 1}</span>
              {step}
            </span>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock label="CHALLENGES">
        <ul className="list-disc space-y-1 pl-5">
          {p.challenges.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="TRADEOFFS">
        <ul className="list-disc space-y-1 pl-5">
          {p.tradeoffs.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="OUTCOME">{p.outcome}</InfoBlock>
      <InfoBlock label="LEARNINGS">
        <ul className="list-disc space-y-1 pl-5">
          {p.learnings.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </InfoBlock>
      {p.roadmap.length > 0 && (
        <InfoBlock label="FUTURE ROADMAP">
          <ul className="list-disc space-y-1 pl-5">
            {p.roadmap.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </InfoBlock>
      )}
      <InfoBlock label="TECHNOLOGY STACK">
        <div className="flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <span
              key={t}
              className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
            >
              {t}
            </span>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock label="BUSINESS VALUE">{p.businessValue}</InfoBlock>
    </InfoTemplate3D>
  );
}
