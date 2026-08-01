"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cms } from "@/lib/cms";

type Testimonial = (typeof cms.testimonials)[number];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsSection() {
  const items = cms.testimonials as Testimonial[];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);

  const count = items.length;
  const current = items[index];

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((i) => (i + dir + count) % count);
      progress.set(0);
    },
    [count, progress],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 7,
      ease: "linear",
      onComplete: () => go(1),
    });
    return () => controls.stop();
  }, [index, paused, count, go, progress]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
  };

  if (!count) return null;

  return (
    <section id="testimonials" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--surface-soft)] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-[rgba(var(--accent-rgb),0.8)]">
          03B · SIGNAL LOG
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Client <span className="neon-text">testimonials</span>
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Recommendations pulled from the Notion portfolio — leaders and
          founders on working with Tushant.
        </p>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="glass relative overflow-hidden rounded-[2rem] border border-[color:rgba(var(--accent-rgb),0.28)] p-6 md:p-10">
            <Quote
              className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-[rgba(var(--accent-rgb),0.15)] md:h-24 md:w-24"
              aria-hidden
            />

            <div className="relative min-h-[280px] md:min-h-[240px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 80, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: direction * -80, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={onDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <p className="display text-xl leading-relaxed text-[var(--text)] md:text-2xl md:leading-relaxed">
                    “{current.quote}”
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:rgba(var(--accent-rgb),0.45)] bg-[var(--surface-2)] display text-sm text-[var(--gold)] shadow-[0_0_24px_rgba(var(--accent-rgb),0.25)]">
                      {initials(current.name)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[var(--text)]">
                        {current.name}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {current.role}
                        {current.company ? ` · ${current.company}` : ""}
                      </p>
                      {"date" in current && current.date ? (
                        <p className="mt-0.5 font-mono text-[10px] tracking-wider text-[rgba(var(--accent-rgb),0.75)]">
                          {String(current.date)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* controls */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => go(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgba(var(--accent-rgb),0.35)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => go(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgba(var(--accent-rgb),0.35)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {items.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-label={`Show testimonial ${i + 1}`}
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                      progress.set(0);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? "w-8 bg-[var(--gold)]"
                        : "w-2 bg-[color:rgba(var(--accent-rgb),0.35)] hover:bg-[color:rgba(var(--accent-rgb),0.6)]"
                    }`}
                  />
                ))}
              </div>

              <p className="hidden font-mono text-[11px] tracking-wider text-[var(--muted)] sm:block">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </p>
            </div>

            {/* autoplay progress */}
            <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-[color:rgba(var(--accent-rgb),0.15)]">
              <motion.div
                className="h-full origin-left bg-[var(--gold)]"
                style={{ scaleX: progress }}
              />
            </div>
          </div>

          <a
            href={cms.site.notion}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-xs text-[rgba(var(--accent-rgb),0.85)] underline-offset-4 hover:underline"
          >
            Source: Notion portfolio →
          </a>
        </div>
      </div>
    </section>
  );
}
