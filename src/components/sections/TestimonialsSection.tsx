"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cms } from "@/lib/cms";
import { cn } from "@/lib/utils";

type Testimonial = (typeof cms.testimonials)[number];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TestimonialCard({
  item,
  active,
  onSelect,
}: {
  item: Testimonial;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "testimonial-uiverse group relative flex h-full min-h-[280px] w-full flex-col justify-end overflow-visible rounded-xl text-left outline-none",
        active && "z-[1]",
      )}
      title={item.quote}
    >
      <span className="testimonial-uiverse__border" aria-hidden />
      <span className="testimonial-uiverse__glow" aria-hidden />

      <div className="relative z-[1] flex h-full min-h-[280px] flex-col justify-end gap-3 rounded-[10px] bg-black p-5 md:min-h-[320px] md:p-6">
        {/* Part 1 — highlight quote */}
        <div className="space-y-3">
          <Quote
            className="h-7 w-7 text-[rgb(var(--accent-rgb))] opacity-70"
            aria-hidden
          />
          <p className="display text-[17px] font-bold leading-snug tracking-tight text-white md:text-[19px]">
            “{"highlight" in item && item.highlight ? item.highlight : item.quote}”
          </p>
        </div>

        {/* Part 2 — role / company */}
        <p className="text-sm leading-snug text-white/70">
          {item.role}
          {item.company ? ` · ${item.company}` : ""}
          {"date" in item && item.date ? (
            <span className="mt-1 block font-mono text-[10px] tracking-wider text-white/40">
              {String(item.date)}
            </span>
          ) : null}
        </p>

        {/* Part 3 — name (accent) */}
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.12)] text-[11px] font-bold text-[rgb(var(--accent-rgb))]">
            {initials(item.name)}
          </span>
          <p className="text-sm font-semibold text-[rgb(var(--accent-rgb))]">
            {item.name}
          </p>
        </div>
      </div>
    </button>
  );
}

export function TestimonialsSection() {
  const items = cms.testimonials as Testimonial[];
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => go(1), 5500);
    return () => window.clearInterval(id);
  }, [paused, count, go]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    card.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

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
        <p className="mt-4 max-w-2xl text-[var(--muted)]">
          Three signals from the Notion portfolio — founders and product leaders
          on shipping with Tushant.
        </p>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Mobile / tablet: snap carousel · Desktop: 3-up grid */}
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-2 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "w-[min(100%,320px)] shrink-0 snap-center md:w-auto",
                  index === i ? "scale-[1.02]" : "scale-100 opacity-90 md:opacity-100",
                )}
                style={{ transition: "transform 0.4s ease, opacity 0.4s ease" }}
              >
                <TestimonialCard
                  item={item}
                  active={index === i}
                  onSelect={() => setIndex(i)}
                />
              </motion.div>
            ))}
          </div>

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
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index
                      ? "w-8 bg-[var(--gold)]"
                      : "w-2 bg-[color:rgba(var(--accent-rgb),0.35)] hover:bg-[color:rgba(var(--accent-rgb),0.6)]",
                  )}
                />
              ))}
            </div>

            <p className="hidden font-mono text-[11px] tracking-wider text-[var(--muted)] sm:block">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </p>
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
