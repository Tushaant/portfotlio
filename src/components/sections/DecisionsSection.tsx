"use client";

import { useState } from "react";
import { productDecisions } from "@/data/profile";

export function DecisionsSection() {
  const [open, setOpen] = useState<string>(productDecisions[0].question);
  return (
    <section id="decisions" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">Judgement</p>
        <h2 className="display mt-3 text-3xl text-[var(--text-primary)] md:text-5xl">Product decisions</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
          Verified items are recorded in the portfolio. Perspective items are how he approaches the question, grounded in those records, not a claim that every option was a formal decision memo.
        </p>
        <div className="mt-8 space-y-3">
          {productDecisions.map((decision) => {
            const expanded = open === decision.question;
            return (
              <article key={decision.question} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? "" : decision.question)}
                >
                  <span className="text-[var(--text-primary)]">{decision.question}</span>
                  <span className="shrink-0 text-[11px] tracking-wide text-[var(--accent-indigo)]">
                    {decision.kind === "verified" ? "Verified" : "Perspective"}
                  </span>
                </button>
                {expanded ? (
                  <dl className="grid gap-4 border-t border-[var(--border)] px-5 py-5 text-sm md:grid-cols-2">
                    {(
                      [
                        ["Context", decision.context],
                        ["Options", decision.options],
                        ["Trade-off", decision.tradeoff],
                        ["Decision", decision.decision],
                        ["Outcome", decision.outcome],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[11px] tracking-[0.14em] text-[var(--text-muted)]">{label}</dt>
                        <dd className="mt-1 text-[var(--text-secondary)]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
