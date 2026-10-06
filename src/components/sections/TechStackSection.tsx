"use client";

import { useState } from "react";
import { cms } from "@/lib/cms";
import { techEvidence } from "@/data/profile";

export function TechStackSection() {
  const [selected, setSelected] = useState("RAG");
  const evidence = techEvidence(selected);

  return (
    <section id="technology" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">Technology</p>
        <h2 className="display mt-3 text-3xl md:text-5xl">Evidence-backed stack</h2>
        <p className="mt-4 max-w-xl text-[var(--text-muted)]">
          Select a tool. Levels stay conservative: product ownership only where a portfolio outcome names the tool, otherwise working knowledge.
        </p>
        <article className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs tracking-[0.16em] text-[var(--accent-indigo)]">{evidence.level}</p>
          <h3 className="mt-2 text-xl text-[var(--text-primary)]">{selected}</h3>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-[var(--text-muted)]">Where</dt>
              <dd>{evidence.where}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Used for</dt>
              <dd>{evidence.usedFor}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Project</dt>
              <dd>{evidence.project}</dd>
            </div>
          </dl>
        </article>
        <div className="mt-10 space-y-8">
          {Object.entries(cms.techStack).map(([group, items]) => (
            <div key={group}>
              <h3 className="mb-3 text-xs tracking-[0.2em] text-[var(--text-muted)]">{group.toUpperCase()}</h3>
              <div className="flex flex-wrap gap-2">
                {(items as string[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelected(item)}
                    aria-pressed={selected === item}
                    className={`rounded-full border px-3 py-2 text-sm ${
                      selected === item
                        ? "border-[var(--accent-violet)] text-[var(--text-primary)]"
                        : "border-[var(--border)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
