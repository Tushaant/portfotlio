"use client";

import { motion, useInView } from "framer-motion";
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
 className="skill-card rounded-2xl p-5"
 >
 <Counter
 value={m.value}
 prefix={"prefix" in m ? String(m.prefix || "") : ""}
 suffix={m.suffix}
 />
 <p className="mt-2 text-sm font-medium text-[var(--text)]">
 {m.label}
 </p>
 <p className="text-xs text-[var(--muted)]">{m.hint}</p>
 </motion.div>
 ))}
 </div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="skill-card mt-8 rounded-3xl p-6 md:p-8"
 >
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
 <span className="font-semibold text-[var(--gold)]">1M+ (10L+) downloads</span>{" "}
 on Google Play.
 </p>
 <div className="mt-6 flex flex-wrap gap-2">
 {r.tags.map((t) => (
 <span
 key={t}
 className="rounded-full border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] px-3 py-1 text-xs font-medium text-[var(--text)]"
 >
 {t}
 </span>
 ))}
 <span className="metric-chip rounded-full px-3 py-1 text-xs text-[var(--muted)]">
 10+ yrs
 </span>
 <span className="metric-chip rounded-full px-3 py-1 text-xs text-[var(--muted)]">
 0→1 and 1→N
 </span>
 </div>
 </motion.div>

 <div className="mt-8">
 <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-[var(--muted)]">
 CORE COMPETENCY MATRIX
 </p>
 <div className="flex flex-wrap gap-2">
 {r.coreCompetencies.map((c) => (
 <span
 key={c}
 className="metric-chip rounded-lg px-2.5 py-1 text-[11px] font-medium text-[var(--text)] transition hover:border-[var(--gold)]"
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
