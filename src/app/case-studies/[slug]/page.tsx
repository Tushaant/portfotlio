import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { cms, getCaseStudy } from "@/lib/cms";
import { InfoBlock, InfoTemplate3D } from "@/components/layout/InfoTemplate3D";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return cms.caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return { title: "Case Study" };
  return { title: cs.title, description: cs.summary };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  return (
    <InfoTemplate3D
      eyebrow={`${c.company} · ${c.period}`}
      title={c.title}
      subtitle={c.summary}
      actions={
        <Link
          href="/#case-studies"
          className="glass rounded-full px-4 py-2 text-sm text-slate-300"
        >
          ← back to command center
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {c.metrics.map((m) => (
          <div key={m.label} className="glass rounded-2xl p-4">
            <p className="display text-2xl text-cyan-300">{m.value}</p>
            <p className="text-xs text-slate-500">{m.label}</p>
          </div>
        ))}
      </div>

      <InfoBlock label="CHALLENGE">{c.challenge}</InfoBlock>
      <InfoBlock label="RESEARCH">{c.research}</InfoBlock>
      <InfoBlock label="DISCOVERY">{c.discovery}</InfoBlock>
      <InfoBlock label="STAKEHOLDERS">
        <ul className="list-disc space-y-1 pl-5">
          {c.stakeholders.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="PRIORITIZATION">{c.prioritization}</InfoBlock>
      <InfoBlock label="ROADMAP">
        <ol className="list-decimal space-y-1 pl-5">
          {c.roadmap.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </InfoBlock>
      <InfoBlock label="USER STORIES">
        <ul className="space-y-2">
          {c.userStories.map((u) => (
            <li
              key={u}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            >
              {u}
            </li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="ARCHITECTURE">
        <ul className="list-disc space-y-1 pl-5">
          {c.architecture.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="LAUNCH">{c.launch}</InfoBlock>
      <InfoBlock label="KPIs">
        <div className="flex flex-wrap gap-2">
          {c.kpis.map((k) => (
            <span
              key={k}
              className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs text-green-200"
            >
              {k}
            </span>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock label="FAILURES & PIVOTS">{c.failures}</InfoBlock>
      <InfoBlock label="LESSONS">
        <ul className="list-disc space-y-1 pl-5">
          {c.lessons.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </InfoBlock>
      <InfoBlock label="RETROSPECTIVE">{c.retrospective}</InfoBlock>
    </InfoTemplate3D>
  );
}
