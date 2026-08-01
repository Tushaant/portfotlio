"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cms } from "@/lib/cms";

const ROLES = [
  "AI Product Manager",
  "Director of Product Management",
  "Agentic AI",
  "LLMs",
  "Enterprise AI",
];

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tiltX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const word = ROLES[roleIndex];
    let i = 0;
    let deleting = false;

    const tick = () => {
      if (cancelled) return;
      if (!deleting) {
        i += 1;
        setTyped(word.slice(0, i));
        if (i === word.length) {
          deleting = true;
          timer = setTimeout(tick, 1400);
          return;
        }
      } else {
        i -= 1;
        setTyped(word.slice(0, i));
        if (i === 0) {
          deleting = false;
          setRoleIndex((r) => (r + 1) % ROLES.length);
          return;
        }
      }
      timer = setTimeout(tick, deleting ? 28 : 55);
    };
    timer = setTimeout(tick, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [roleIndex]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const ctas = [
    { label: "Resume", href: "/resume" },
    { label: "Projects", href: "/#projects" },
    { label: "Case Studies", href: "/#case-studies" },
    { label: "Contact", href: "/#contact" },
    { label: "LinkedIn", href: cms.site.social.linkedin, external: true },
    { label: "Github", href: "https://github.com/Tushaant", external: true },
  ];

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Floating holographic HUD frames — motion everywhere in the banner */}
      <motion.div
        style={{ rotateX: tiltX, rotateY: tiltY }}
        className="pointer-events-none absolute inset-0 perspective-[1200px]"
      >
        <div className="animate-float absolute left-[6%] top-[22%] hidden h-28 w-40 rounded-2xl border border-cyan-400/25 bg-cyan-400/5 backdrop-blur-md md:block" />
        <div
          className="animate-float absolute right-[8%] top-[30%] hidden h-36 w-28 rounded-2xl border border-purple-400/25 bg-purple-400/5 backdrop-blur-md md:block"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="animate-float absolute bottom-[18%] left-[18%] hidden h-20 w-52 rounded-xl border border-blue-400/20 bg-blue-400/5 backdrop-blur-md lg:block"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute right-[12%] top-[18%] font-mono text-[10px] tracking-widest text-cyan-300/50 animate-pulse-glow">
          NEURAL LINK · ACTIVE
        </div>
        <div
          className="absolute left-[10%] bottom-[22%] font-mono text-[10px] tracking-widest text-cyan-300/40 animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        >
          STREAM 0xAI · P95 &lt;1.5s
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 md:px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 font-mono text-xs tracking-[0.28em] text-cyan-300/80"
        >
          COMMAND CENTER ONLINE · {cms.resume.location}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="display text-5xl font-bold leading-[1.05] md:text-7xl lg:text-8xl"
        >
          <span className="neon-text">{cms.resume.name}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-5 flex flex-wrap items-center gap-3"
        >
          <p className="text-lg text-slate-200 md:text-xl">
            {cms.resume.title.split(" and ")[0]}
            <span className="text-slate-500"> / </span>
            Acting Director of Product Management
          </p>
        </motion.div>

        <div className="mt-4 h-8 font-mono text-cyan-300">
          <span className="text-slate-500">operating on </span>
          <span>{typed}</span>
          <span className="animate-pulse-glow ml-0.5 inline-block h-5 w-[2px] bg-cyan-300 align-middle" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 max-w-2xl text-base text-slate-400 md:text-lg"
        >
          Mission Control for AI Products — Agentic systems, enterprise RAG, and
          P&amp;L-owned platforms that prove product thinking in motion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          {ctas.map((c, i) => (
            <motion.div
              key={c.label}
              className="animate-float"
              style={{ animationDelay: `${i * 0.35}s` }}
              whileHover={{ scale: 1.06 }}
            >
              {c.external ? (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass inline-flex rounded-full px-5 py-2.5 text-sm tracking-wide text-cyan-100 transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,248,255,0.35)]"
                >
                  {c.label}
                </a>
              ) : (
                <Link
                  href={c.href}
                  className="glass inline-flex rounded-full px-5 py-2.5 text-sm tracking-wide text-cyan-100 transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,248,255,0.35)]"
                >
                  {c.label}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
