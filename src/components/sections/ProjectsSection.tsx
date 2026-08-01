"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";

export function ProjectsSection() {
 return (
 <section id="projects" className="relative scroll-mt-24 py-24 md:py-32">
 <div className="mx-auto max-w-7xl px-4 md:px-6">
 <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
 03 · DELIVERED PROJECTS
 </p>
 <h2 className="display mt-3 text-3xl md:text-5xl">
 {cms.projects.length} shipped{" "}
 <span className="neon-text">products</span>
 </h2>
 <p className="mt-4 max-w-2xl text-slate-400">
          Sourced from the Notion delivery portfolio. Every project has a
          dedicated page with problem, discovery, PRD, architecture, metrics and
          learnings. Images attached from delivered interfaces.
 </p>
 <a
 href={cms.site.notion}
 target="_blank"
 rel="noreferrer"
 className="mt-3 inline-block text-xs text-cyan-400/80 underline-offset-4 hover:underline"
 >
 Open Notion source →
 </a>

 <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {cms.projects.map((p, i) => (
 <motion.div
 key={p.slug}
 initial={{ opacity: 0, y: 24 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-40px" }}
 transition={{ delay: (i % 3) * 0.06 }}
 whileHover={{ y: -8 }}
 className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
 >
 <div className="relative aspect-[16/10] overflow-hidden bg-[#08111F]">
 {p.image ? (
 <Image
 src={p.image}
 alt={`${p.title} delivered interface`}
 fill
 className="object-cover transition duration-700 group-hover:scale-105"
 sizes="(max-width:768px) 100vw, 33vw"
 />
 ) : (
 <div className="flex h-full items-center justify-center display text-4xl neon-text">
 {p.title.slice(0, 2)}
 </div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-[#05060B] via-transparent to-transparent" />
 <span
 className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] tracking-wider ${
 p.status === "DELIVERED"
 ? "bg-green-400/20 text-green-300"
 : "bg-fuchsia-400/20 text-fuchsia-300"
 }`}
 >
 {p.status}
 </span>
 </div>
 <div className="p-5">
 <p className="text-[11px] uppercase tracking-wider text-slate-500">
 {p.category}
 </p>
 <h3 className="display mt-1 text-xl">{p.title}</h3>
 <p className="mt-2 line-clamp-2 text-sm text-slate-400">
 {p.tagline}
 </p>
 <div className="mt-3 flex flex-wrap gap-1.5">
 {p.tech.slice(0, 3).map((t) => (
 <span
 key={t}
 className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-slate-400"
 >
 {t}
 </span>
 ))}
 </div>
 <Link
 href={`/projects/${p.slug}`}
 className="mt-4 inline-flex text-sm text-cyan-300 transition group-hover:translate-x-1"
 >
 Open case file →
 </Link>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </section>
 );
}
