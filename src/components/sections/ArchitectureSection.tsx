"use client";

import { useState } from "react";
import { architectureLayers } from "@/data/profile";

export function ArchitectureSection() {
  const [active, setActive] = useState<string>(architectureLayers[0].id);
  const layer = architectureLayers.find((item) => item.id === active) ?? architectureLayers[0];

  return (
    <section id="how-i-build" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">06 · How I build AI products</p>
        <h2 className="display mt-3 text-3xl text-[var(--text-primary)] md:text-5xl">How I build AI products</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
          Each layer is clickable. Applied notes come from the portfolio. The short definition is how the layer is used in product work.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          <ol className="space-y-2">
            {architectureLayers.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(item.id)}
                  aria-pressed={item.id === active}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm ${
                    item.id === active
                      ? "border-[var(--accent-violet)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="text-[11px] text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span>
                  {item.name}
                </button>
              </li>
            ))}
          </ol>
          <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <p className="text-[11px] tracking-[0.16em] text-[var(--accent-indigo)]">
              {layer.kind === "verified" ? "Portfolio evidence" : "Product thinking"}
            </p>
            <h3 className="display mt-2 text-2xl text-[var(--text-primary)]">{layer.name}</h3>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-[var(--text-muted)]">What it means</dt>
                <dd className="mt-1 text-[var(--text-secondary)]">{layer.meaning}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Where applied</dt>
                <dd className="mt-1 text-[var(--text-secondary)]">{layer.applied}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Example</dt>
                <dd className="mt-1 text-[var(--text-secondary)]">{layer.project}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Technology</dt>
                <dd className="mt-1 text-[var(--text-secondary)]">{layer.technology}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Business outcome</dt>
                <dd className="mt-1 text-[var(--text-secondary)]">{layer.outcome}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
