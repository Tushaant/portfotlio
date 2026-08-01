"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cms } from "@/lib/cms";
import { cn } from "@/lib/utils";

type Testimonial = (typeof cms.testimonials)[number];

function TestimonialCard({
  item,
  active,
  expanded,
  onSelect,
  onToggleMore,
}: {
  item: Testimonial;
  active: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleMore: () => void;
}) {
  const highlight =
    "highlight" in item && item.highlight ? item.highlight : item.quote;
  const roleLine = `${item.role}${item.company ? ` at ${item.company}` : ""}`;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "testimonial-termite group relative flex h-full min-h-[340px] w-full cursor-pointer flex-col overflow-hidden rounded-3xl border p-7 text-left outline-none md:min-h-[360px] md:p-8",
        active && "testimonial-termite--active",
      )}
    >
      <div className="flex h-full flex-col justify-between gap-2">
        {/* Header, name + role */}
        <header>
          <strong className="display block text-lg font-bold tracking-tight text-[var(--text)] md:text-xl">
            {item.name}
          </strong>
          <p className="mt-1 text-sm text-[var(--muted)] opacity-80">{roleLine}</p>
          {"date" in item && item.date ? (
            <p className="mt-1 font-mono text-[10px] tracking-wider text-[rgba(var(--accent-rgb),0.7)]">
              {String(item.date)}
            </p>
          ) : null}
        </header>

        {/* Footer, quotes, body, view more */}
        <div className="flex flex-col items-start gap-4">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 fill-[var(--text)] opacity-90 md:h-12 md:w-12"
            aria-hidden
          >
            <path d="M4.58341 17.3211C3.55316 16.2274 3 15 3 13.0103C3 9.51086 5.45651 6.37366 9.03059 4.82318L9.92328 6.20079C6.58804 8.00539 5.93618 10.346 5.67564 11.822C6.21263 11.5443 6.91558 11.4466 7.60471 11.5105C9.40908 11.6778 10.8312 13.159 10.8312 15C10.8312 16.933 9.26416 18.5 7.33116 18.5C6.2581 18.5 5.23196 18.0095 4.58341 17.3211ZM14.5834 17.3211C13.5532 16.2274 13 15 13 13.0103C13 9.51086 15.4565 6.37366 19.0306 4.82318L19.9233 6.20079C16.588 8.00539 15.9362 10.346 15.6756 11.822C16.2126 11.5443 16.9156 11.4466 17.6047 11.5105C19.4091 11.6778 20.8312 13.159 20.8312 15C20.8312 16.933 19.2642 18.5 17.3312 18.5C16.2581 18.5 15.232 18.0095 14.5834 17.3211Z" />
          </svg>

          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={expanded ? "full" : "short"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="z-[1] text-[15px] leading-relaxed text-[var(--text)] opacity-80 md:text-base"
            >
              {expanded ? item.quote : highlight}
            </motion.p>
          </AnimatePresence>

          <button
            type="button"
            className="testimonial-termite__more"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMore();
            }}
          >
            <span>{expanded ? "View less" : "View more"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const items = cms.testimonials as Testimonial[];
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1 || expandedId) return;
    const id = window.setInterval(() => go(1), 5500);
    return () => window.clearInterval(id);
  }, [paused, count, go, expandedId]);

  // Keep carousel card in view horizontally only — never scroll the page
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    const target =
      card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
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
          Three signals from the Notion portfolio, founders and product leaders
          on shipping with Tushant.
        </p>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-visible px-1 py-3 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-7 md:overflow-visible md:px-2 md:py-4 [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.48,
                  delay: i * 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="w-[min(100%,300px)] shrink-0 snap-center md:w-auto"
              >
                <TestimonialCard
                  item={item}
                  active={index === i}
                  expanded={expandedId === item.id}
                  onSelect={() => setIndex(i)}
                  onToggleMore={() =>
                    setExpandedId((id) => (id === item.id ? null : item.id))
                  }
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
