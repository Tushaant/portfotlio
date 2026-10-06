"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { bulletMatchesLens } from "@/data/profile";
import { useUIStore } from "@/store/ui-store";
import { ViewSwitcher } from "@/components/ui/ViewSwitcher";
import signature from "../../../content/brain/signature-products.json";

const CASE_LINKS: Record<string, string> = {
  oraczen: "agentic-ai-banking-platform",
  emb: "enterprise-saas-category-turnaround",
  filmboard: "b2b-marketplace-churn-reduction",
  ibm: "credit-risk-analytics",
};

export function JourneySection() {
 const [active, setActive] = useState(cms.experience[0].id);
 const lens = useUIStore((state) => state.lens);
 const job = cms.experience.find((e) => e.id === active)!;
 const emphasized = job.responsibilities.filter((line) => bulletMatchesLens(line, lens));
 const responsibilities = emphasized.length ? emphasized : job.responsibilities;

 return (
 <div id="professional-work" className="relative scroll-mt-24">
 <div id="journey" className="absolute -top-24" />
 <div id="timeline" className="absolute -top-24" />
 <div>
 <p className="font-mono text-xs tracking-[0.3em] text-[var(--accent-violet)]">
 Professional product work
 </p>
 <h3 className="display mt-3 text-2xl md:text-4xl">
 Roles and products on record
 </h3>
        <p className="mt-4 max-w-xl text-slate-400">
          The {lens} view emphasizes matching responsibilities. Dates, titles, and the full record stay here.
        </p>
        <ViewSwitcher />
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
          <li className="list-disc list-inside">Responsibilities</li>
          <li className="list-disc list-inside">Impact</li>
          <li className="list-disc list-inside">Metrics</li>
          <li className="list-disc list-inside">Technologies</li>
          <li className="list-disc list-inside">Lessons learned</li>
        </ul>

 <div className="mt-12 grid gap-8 lg:grid-cols-[280px_1fr]">
 <div className="relative">
 <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400 via-purple-500 to-transparent" />
 <ul className="space-y-3">
 {cms.experience.map((e) => (
 <li key={e.id}>
 <button
 type="button"
 onClick={() => setActive(e.id)}
 className={cn(
 "relative w-full rounded-2xl border border-transparent pl-10 pr-3 py-3 text-left transition",
 active === e.id
 ? "glass shadow-[0_0_24px_rgba(255,179,0,0.12)]"
 : "border-white/8 bg-black/20 hover:border-white/15 hover:bg-black/35",
 )}
 >
 <span
 className={cn(
 "absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2",
 active === e.id
 ? "border-cyan-300 bg-cyan-300 shadow-[0_0_16px_#38F8FF]"
 : "border-slate-600 bg-[#05060B]",
 )}
 />
 <p className="font-mono text-[10px] text-slate-500">
 {e.period}
 {e.active ? " · ACTIVE" : ""}
 </p>
 <p className="text-sm font-medium text-slate-100">
 {e.company}
 </p>
 </button>
 </li>
 ))}
 </ul>
 </div>

 <AnimatePresence mode="wait">
 <motion.div
 key={job.id}
 initial={{ opacity: 0, x: 24 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -16 }}
 className="glass rounded-3xl p-6 md:p-8"
 >
 <p className="font-mono text-xs text-cyan-300/80">{job.period}</p>
 <h3 className="display mt-2 text-2xl md:text-3xl">{job.company}</h3>
 <p className="mt-1 text-slate-300">{job.role}</p>
 <p className="text-xs tracking-[0.14em] text-[var(--accent-violet)]">Professional product work</p>
 <p className="text-sm text-slate-500">{job.location}</p>
 {CASE_LINKS[job.id] ? (
 <Link href={`/case-studies/${CASE_LINKS[job.id]}`} className="mt-3 inline-flex text-sm text-cyan-300">
 Read the case study
 </Link>
 ) : null}

 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
 {job.metrics.map((m) => (
 <div
 key={m.label}
 className="rounded-xl border border-white/12 bg-black/30 p-3"
 >
 <p className="display text-lg text-cyan-300">{m.value}</p>
 <p className="text-[11px] text-slate-400">{m.label}</p>
 </div>
 ))}
 </div>

 <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-purple-300">
 RESPONSIBILITIES & IMPACT
 </p>
 <ul className="mt-3 space-y-2">
 {responsibilities.map((r) => (
 <li
 key={r.slice(0, 40)}
 className="border-l border-cyan-400/30 pl-3 text-sm leading-relaxed text-slate-300"
 >
 {r}
 </li>
 ))}
 </ul>

 <div className="mt-6 flex flex-wrap gap-2">
 {job.technologies.map((t) => (
 <span
 key={t}
 className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs text-blue-200"
 >
 {t}
 </span>
 ))}
 </div>

 {job.id === "oraczen" ? (
 <div className="mt-6 space-y-3">
 <p className="font-mono text-[11px] tracking-[0.2em] text-purple-300">
 DOCUMENTED PRODUCTS
 </p>
 {signature.products.map((product) => (
 <div key={product.id} className="rounded-xl border border-white/10 p-3">
 <p className="text-sm text-slate-100">{product.name}</p>
 <p className="text-xs text-slate-400">
 {product.kind}
 {product.client ? ` · ${product.client}` : ""}
 </p>
 <p className="mt-2 text-sm text-slate-300">{product.solution}</p>
 </div>
 ))}
 </div>
 ) : null}

 <div className="mt-6 rounded-2xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 p-4">
 <p className="font-mono text-[10px] tracking-widest text-[#C4B5FD]">
 LESSON LEARNED
 </p>
 <p className="mt-2 text-sm text-slate-200">{job.lesson}</p>
 </div>
 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
