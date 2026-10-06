import { ownership } from "@/data/profile";

export function OwnershipSection() {
  return (
    <section id="ownership" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">Scope</p>
        <h2 className="display mt-3 text-3xl text-[var(--text-primary)] md:text-5xl">What I own</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
          Director-level scope recorded at Oraczen: strategy, P&L, the roadmap, the team, quality, governance, and the executive relationship. All of it points at a business outcome.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <ul className="grid grid-cols-2 gap-3">
            {ownership.slice(0, 5).map((item) => (
              <li key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text-secondary)]">
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[var(--accent-violet)] bg-[var(--surface-elevated)] text-center text-xs tracking-[0.16em] text-[var(--text-primary)]">
              TUSHANT
            </div>
            <div className="hidden h-10 w-px bg-[var(--border)] lg:block" />
            <p className="rounded-full border border-[var(--border)] px-4 py-2 text-xs tracking-[0.16em] text-[var(--accent-cyan)]">
              BUSINESS OUTCOME
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {ownership.slice(5).map((item) => (
              <li key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text-secondary)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
