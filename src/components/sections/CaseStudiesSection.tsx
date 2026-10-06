"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { flagshipStudies, researchStudies } from "@/data/profile";

type CaseStudy = (typeof cms.caseStudies)[number] & {
  source?: string;
  image?: string | null;
  galleryTitle?: string;
  notionUrl?: string;
};

function ordered(slugs: readonly string[]) {
  const all = cms.caseStudies as CaseStudy[];
  return slugs
    .map((slug) => all.find((study) => study.slug === slug))
    .filter((study): study is CaseStudy => Boolean(study));
}

export function CaseStudiesSection() {
  const career = ordered(flagshipStudies);
  const research = ordered(researchStudies);

  return (
    <section id="case-studies" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">Flagship career work</p>
        <h2 className="display mt-3 text-3xl md:text-5xl">Case studies</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
          Employment first: Oraczen, EMB Global, Filmboard, and IBM. Research studies below are not jobs.
        </p>
        <div className="mt-10 space-y-5">
          {career.map((study) => (
            <article key={study.slug} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
              <p className="text-xs text-[var(--text-muted)]">
                Employment · {study.company} · {study.period}
              </p>
              <h3 className="display mt-2 text-2xl text-[var(--text-primary)] md:text-3xl">{study.title}</h3>
              <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)]">{study.summary}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {study.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-[var(--border)] p-3">
                    <p className="display text-lg text-[var(--text-primary)]">{metric.value}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{metric.label}</p>
                  </div>
                ))}
              </div>
              <Link href={`/case-studies/${study.slug}`} className="mt-6 inline-flex text-sm text-[var(--accent-violet)]">
                Read the full story
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <p className="text-xs tracking-[0.28em] text-[var(--text-muted)]">Independent product research</p>
          <h3 className="display mt-2 text-2xl md:text-3xl">Not employment</h3>
          <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
            Lenskart, Amazon miniTV, Gumroad, and Astrotalk are research case studies.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {research.map((study, index) => (
              <motion.article
                key={study.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <Link href={`/case-studies/${study.slug}`} className="block">
                  <div className="relative aspect-[5/3] bg-[var(--bg-primary)]">
                    {study.image ? (
                      <Image src={study.image} alt={study.galleryTitle || study.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] tracking-[0.16em] text-[var(--accent-indigo)]">RESEARCH</p>
                    <h3 className="mt-2 text-lg text-[var(--text-primary)]">{study.galleryTitle || study.title}</h3>
                    <p className="mt-2 line-clamp-3 text-xs text-[var(--text-muted)]">{study.summary}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
