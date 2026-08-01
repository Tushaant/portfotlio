"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";

export function CaseStudiesSection() {
 return (
 <section id="case-studies" className="relative scroll-mt-24 py-24 md:py-32">
 <div className="mx-auto max-w-7xl px-4 md:px-6">
 <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
 04 · CASE STUDIES
 </p>
 <h2 className="display mt-3 text-3xl md:text-5xl">
 The decisions behind the{" "}
 <span className="neon-text">numbers</span>
 </h2>
        <p className="mt-4 max-w-xl text-slate-400">
          Career delivery stories plus Notion Featured Work research case
          studies covering:
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
          <li className="list-disc list-inside">Challenge</li>
          <li className="list-disc list-inside">Research</li>
          <li className="list-disc list-inside">Discovery</li>
          <li className="list-disc list-inside">Architecture</li>
          <li className="list-disc list-inside">KPIs</li>
          <li className="list-disc list-inside">Failures</li>
          <li className="list-disc list-inside">Retrospectives</li>
        </ul>

 <div className="mt-12 space-y-5">
 {cms.caseStudies.map((c, i) => (
 <motion.div
 key={c.slug}
 initial={{ opacity: 0, x: i % 2 ? 24 : -24 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 whileHover={{ scale: 1.01 }}
 className="glass group rounded-3xl p-6 md:p-8"
 >
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="font-mono text-xs text-slate-500">
 {c.company} · {c.period}
 {"source" in c && c.source === "notion" ? " · Notion Featured Work" : ""}
 </p>
 <h3 className="display mt-2 max-w-2xl text-2xl md:text-3xl">
 {c.title}
 </h3>
 <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
 {c.summary}
 </p>
 </div>
 <div className="flex shrink-0 flex-col items-end gap-2">
 {"notionUrl" in c && c.notionUrl ? (
 <a
 href={String(c.notionUrl)}
 target="_blank"
 rel="noreferrer"
 className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
 >
 Open in Notion
 </a>
 ) : null}
 <Link
 href={`/case-studies/${c.slug}`}
 className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
 >
 Read the full story
 </Link>
 </div>
 </div>
 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
 {c.metrics.map((m) => (
 <div
 key={m.label}
 className="rounded-xl border border-white/12 bg-black/30 p-3"
 >
 <p className="display text-lg text-cyan-300 md:text-xl">
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
 </section>
 );
}
