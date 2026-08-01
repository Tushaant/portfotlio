"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";

export function ContactSection() {
 const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
 const [lines, setLines] = useState<string[]>([
 "> establishing secure channel…",
 "> channel encrypted",
 `> operator: ${cms.resume.name}`,
 "> awaiting transmission",
 ]);

 const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 const fd = new FormData(e.currentTarget);
 const name = String(fd.get("name") || "");
 const email = String(fd.get("email") || "");
 const message = String(fd.get("message") || "");
 setLines((l) => [
 ...l,
 `> inbound from ${name || "anonymous"} <${email}>`,
 `> ${message.slice(0, 120)}`,
 ]);
 try {
 const res = await fetch("/api/contact", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name, email, message }),
 });
 if (!res.ok) throw new Error("fail");
 setStatus("sent");
 setLines((l) => [...l, "> transmission acknowledged", "$"]);
 e.currentTarget.reset();
 } catch {
 setStatus("error");
 setLines((l) => [
 ...l,
 "> channel busy - use direct email / LinkedIn",
 "$",
 ]);
 }
 };

 return (
 <section id="contact" className="relative scroll-mt-24 py-24 md:py-32">
 <div className="mx-auto max-w-7xl px-4 md:px-6">
 <p className="font-mono text-xs tracking-[0.3em] text-cyan-300/70">
 09 · COMMUNICATION CONSOLE
 </p>
 <h2 className="display mt-3 text-3xl md:text-5xl">
 Open a <span className="neon-text">channel</span>
 </h2>
 <p className="mt-4 max-w-xl text-slate-400">
 Send a message, download the resume, or connect directly.
 </p>

 <div className="mt-12 grid gap-6 lg:grid-cols-2">
 <div className="overflow-hidden rounded-3xl border border-green-400/20 bg-black/60 font-mono text-sm shadow-[0_0_40px_rgba(0,245,160,0.08)]">
 <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs text-slate-500">
 <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
 <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
 <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
 <span className="ml-2">
 tushant@command-center: ~/contact
 </span>
 </div>
 <div className="scanlines relative max-h-64 space-y-1 overflow-auto p-4 text-green-300/90">
 {lines.map((l, i) => (
 <p key={`${i}-${l}`}>{l}</p>
 ))}
 </div>
 <form onSubmit={onSubmit} className="space-y-3 border-t border-white/10 p-4">
 <input
 name="name"
 required
 placeholder="name"
 className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-green-200 outline-none focus:border-green-400/50"
 />
 <input
 name="email"
 type="email"
 required
 placeholder="email"
 className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-green-200 outline-none focus:border-green-400/50"
 />
 <textarea
 name="message"
 required
 rows={3}
 placeholder="message payload"
 className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-green-200 outline-none focus:border-green-400/50"
 />
 <button
 type="submit"
 className="rounded-lg bg-green-400/20 px-4 py-2 text-green-200 transition hover:bg-green-400/30"
 >
 $ Message transmit
 </button>
 {status === "sent" && (
 <p className="text-xs text-green-300">Message logged locally.</p>
 )}
 {status === "error" && (
 <p className="text-xs text-amber-300">
 Fallback: email {cms.resume.email}
 </p>
 )}
 </form>
 </div>

 <div className="glass rounded-3xl p-6 md:p-8">
 <p className="font-mono text-[11px] tracking-[0.2em] text-cyan-300">
 DIRECT CHANNELS
 </p>
 <ul className="mt-6 space-y-4">
 {[
 {
 label: "Email",
 href: `mailto:${cms.resume.email}`,
 value: cms.resume.email,
 },
 {
 label: "Phone",
 href: `tel:${cms.resume.phone}`,
 value: cms.resume.phone,
 },
 {
 label: "LinkedIn",
 href: cms.resume.linkedin,
 value: "Open profile",
 },
 {
 label: "Schedule meeting",
 href: `mailto:${cms.resume.email}?subject=Schedule%20a%20meeting`,
 value: "Request a slot",
 },
 {
 label: "Download resume",
 href: cms.site.social.resume,
 value: "PDF · resume only",
 },
 ].map((c) => (
 <li key={c.label}>
 <a
 href={c.href}
 target={c.href.startsWith("http") || c.href.endsWith(".pdf") ? "_blank" : undefined}
 rel="noreferrer"
 className="group flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
 >
 <span className="text-sm text-slate-400">{c.label}</span>
 <span className="text-sm text-cyan-200 group-hover:translate-x-1 transition">
 {c.value}
 </span>
 </a>
 </li>
 ))}
 </ul>

 <div className="mt-8 border-t border-white/10 pt-6">
 <p className="font-mono text-[11px] tracking-[0.2em] text-slate-500">
 EDUCATION & CERTIFICATIONS
 </p>
 <ul className="mt-3 space-y-2 text-sm text-slate-300">
 {cms.resume.education.map((e) => (
                  <li key={e.degree}>
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-amber-400/80 align-middle" />
                    {e.degree} · {e.institution} · {e.year}
                  </li>
 ))}
 </ul>
 </div>
 </div>
 </div>

 <motion.footer
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 className="mt-16 border-t border-white/10 pt-8 text-center text-xs text-slate-500"
 >
 <p>
 {cms.resume.name} · AI Product Manager · {cms.resume.location}
 </p>
 <p className="mt-2">Press ⌘K to search · ⌘J for AI agent</p>
 </motion.footer>
 </div>
 </section>
 );
}
