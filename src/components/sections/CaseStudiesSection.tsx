"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";

type CaseStudy = (typeof cms.caseStudies)[number] & {
  source?: string;
  image?: string | null;
  galleryTitle?: string;
  notionUrl?: string;
  featured?: boolean;
  priority?: number;
};

export function CaseStudiesSection() {
  const all = cms.caseStudies as CaseStudy[];
  const featured = all.filter((c) => c.source === "notion");
  const secondary = all.filter((c) => c.source !== "notion");

  return (
    <section id="case-studies" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-[#00D95A]/80">
          04 · CASE STUDIES
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Featured <span className="neon-text">Work</span>
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Primary case studies from Notion Featured Work on branding and
          UI/UX research. Career delivery stories follow below.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-3xl border border-[#00D95A]/45 bg-[#121212] shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
            >
              <Link href={`/case-studies/${c.slug}`} className="block">
                <div className="relative aspect-[5/3] bg-[#0B0B0B]">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.galleryTitle || c.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 25vw"
                    />
                  ) : null}
                </div>
                <div className="border-t border-[#00D95A]/25 p-4">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-[#00D95A]">
                    FEATURED WORK
                  </p>
                  <h3 className="mt-2 display text-lg text-[#FFFFFF]">
                    {c.galleryTitle || c.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs text-[#999999]">
                    {c.summary}
                  </p>
                </div>
              </Link>
              <div className="flex items-center justify-between gap-2 border-t border-[#00D95A]/20 px-4 py-3">
                <Link
                  href={`/case-studies/${c.slug}`}
                  className="text-sm font-semibold text-[#00D95A]"
                >
                  Read case study →
                </Link>
                {c.notionUrl ? (
                  <a
                    href={c.notionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#999999] hover:text-[#00D95A]"
                  >
                    Notion
                  </a>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <p className="font-mono text-xs tracking-[0.28em] text-[#999999]">
            SECONDARY · CAREER DELIVERY
          </p>
          <h3 className="display mt-2 text-2xl text-[#FFFFFF] md:text-3xl">
            More product decisions
          </h3>
          <div className="mt-8 space-y-5">
            {secondary.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, x: i % 2 ? 24 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                className="glass group rounded-3xl border border-[#00D95A]/25 p-6 md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-slate-500">
                      {c.company} · {c.period}
                    </p>
                    <h3 className="display mt-2 max-w-2xl text-2xl md:text-3xl">
                      {c.title}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
                      {c.summary}
                    </p>
                  </div>
                  <Link
                    href={`/case-studies/${c.slug}`}
                    className="shrink-0 rounded-full border border-[#00D95A]/40 px-4 py-2 text-sm text-[#00D95A] transition hover:bg-[#00D95A]/10"
                  >
                    Read the full story
                  </Link>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {c.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border border-[#00D95A]/25 bg-[#121212] p-3"
                    >
                      <p className="display text-lg text-[#00D95A] md:text-xl">
                        {m.value}
                      </p>
                      <p className="text-[11px] text-slate-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
