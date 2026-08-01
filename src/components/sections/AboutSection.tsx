"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cms } from "@/lib/cms";

function Counter({
 value,
 prefix = "",
 suffix = "",
}: {
 value: number;
 prefix?: string;
 suffix?: string;
}) {
 const ref = useRef<HTMLSpanElement>(null);
 const inView = useInView(ref, { once: true, margin: "-40px" });
 const [n, setN] = useState(0);

 useEffect(() => {
 if (!inView) return;
 const start = performance.now();
 const dur = 1400;
 const frame = (t: number) => {
 const p = Math.min(1, (t - start) / dur);
 const eased = 1 - Math.pow(1 - p, 3);
 setN(Number((value * eased).toFixed(value % 1 ? 2 : 0)));
 if (p < 1) requestAnimationFrame(frame);
 };
 requestAnimationFrame(frame);
 }, [inView, value]);

 return (
 <span ref={ref} className="display text-3xl md:text-4xl neon-text">
 {prefix}
 {n}
 {suffix}
 </span>
 );
}

export function AboutSection() {
 const r = cms.resume;
 return (
 <section id="about" className="relative scroll-mt-24 py-24 md:py-32">
 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--surface-soft)] to-transparent" />
 <div className="relative mx-auto max-w-7xl px-4 md:px-6">
 <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
 01 · PROFILE DASHBOARD
 </p>
 <h2 className="display mt-3 text-3xl md:text-5xl">
 System readout of a{" "}
 <span className="neon-text">product operator</span>
 </h2>
 <p className="mt-4 max-w-2xl text-slate-400">
 Live telemetry from a decade of enterprise AI and SaaS product
 leadership, plus mobile learning products at scale: Veda Academy at 1L+
 downloads and Major Kalshi Classes at 1M+ (10L+) on Google Play.
 </p>

 <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {r.metrics.map((m, i) => (
 <motion.div
 key={m.label}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.05 }}
 whileHover={{ y: -6, scale: 1.02 }}
 className="glass rounded-2xl p-5"
 >
 <Counter
 value={m.value}
 prefix={"prefix" in m ? String(m.prefix || "") : ""}
 suffix={m.suffix}
 />
 <p className="mt-2 text-sm font-medium text-slate-100">
 {m.label}
 </p>
 <p className="text-xs text-slate-400">{m.hint}</p>
 </motion.div>
 ))}
 </div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="glass mt-8 rounded-3xl p-6 md:p-8"
 >
 <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
 <motion.div
 initial={{ opacity: 0, scale: 0.92 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
 className="relative shrink-0"
 >
 <div
 className="absolute -inset-3 rounded-full opacity-70 blur-2xl"
 style={{
 background:
 "radial-gradient(circle, rgba(var(--accent-rgb),0.35) 0%, transparent 70%)",
 }}
 />
 <motion.div
 className="relative h-36 w-36 overflow-hidden rounded-full border border-[color:rgba(var(--accent-rgb),0.5)] md:h-44 md:w-44"
 animate={{
 boxShadow: [
 "0 0 0 0 rgba(var(--accent-rgb),0)",
 "0 0 28px 4px rgba(var(--accent-rgb),0.35)",
 "0 0 0 0 rgba(var(--accent-rgb),0)",
 ],
 }}
 transition={{ duration: 3.6, repeat: Infinity }}
 >
 <Image
 src="/profile/tushant-circle.png"
 alt="Tushant Sharma — Director of Product Management"
 width={176}
 height={176}
 className="h-full w-full object-cover"
 priority
 />
 </motion.div>
 <p className="relative mt-3 text-center font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
 OPERATOR ID · TS
 </p>
 </motion.div>

 <div className="min-w-0 flex-1">
 <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--gold)]">
 PROFESSIONAL SUMMARY
 </p>
 <p className="mt-4 text-base leading-relaxed text-[var(--text)] md:text-lg">
 {r.summary}
 </p>
 <p className="mt-4 text-base leading-relaxed text-[var(--text)] md:text-lg">
 Highlighted consumer scale: shipped the Veda Academy Learning App to{" "}
 <span className="font-semibold text-[var(--gold)]">1L+ downloads</span>{" "}
 and the Major Kalshi Classes Learning App to{" "}
 <span className="font-semibold text-[var(--gold)]">
 1M+ (10L+) downloads
 </span>{" "}
 on Google Play.
 </p>
 <div className="mt-6 flex flex-wrap gap-2">
 {r.tags.map((t) => (
 <span
 key={t}
 className="rounded-full border border-[color:rgba(var(--accent-rgb),0.35)] bg-[color:rgba(var(--accent-rgb),0.1)] px-3 py-1 text-xs text-[var(--text)]"
 >
 {t}
 </span>
 ))}
 <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
 10+ yrs
 </span>
 <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
 0→1 and 1→N
 </span>
 </div>
 </div>
 </div>
 </motion.div>

 <div className="mt-8">
 <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-[var(--gold)]">
 CORE COMPETENCY MATRIX
 </p>
 <div className="flex flex-wrap gap-2">
 {r.coreCompetencies.map((c) => (
 <span
 key={c}
 className="rounded-lg border border-[color:rgba(var(--accent-rgb),0.45)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text)] shadow-[inset_0_1px_0_rgba(var(--accent-rgb),0.1)] transition hover:border-[var(--gold)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
 >
 {c}
 </span>
 ))}
 </div>
 </div>
 </div>
 </section>
 );
}
