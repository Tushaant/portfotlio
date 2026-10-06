"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { researchStudies } from "@/data/profile";
import { JourneySection } from "@/components/sections/JourneySection";

type CaseStudy = (typeof cms.caseStudies)[number] & {
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
  const research = ordered(researchStudies);

  return (
    <section id="case-studies" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">05 · Case studies</p>
        <h2 className="display mt-3 text-3xl md:text-5xl">Case studies</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
          Product research first. Professional product work follows. Research companies are not employers.
        </p>

        <div className="mt-12">
          <p className="text-xs tracking-[0.22em] text-[var(--text-muted)]">Product research</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      <Image
                        src={study.image}
                        alt={study.galleryTitle || study.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 25vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] tracking-[0.16em] text-[var(--accent-indigo)]">PRODUCT RESEARCH</p>
                    <h3 className="mt-2 text-lg text-[var(--text-primary)]">{study.galleryTitle || study.company}</h3>
                    <p className="mt-2 line-clamp-3 text-xs text-[var(--text-muted)]">{study.summary}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <JourneySection />
        </div>
      </div>
    </section>
  );
}
