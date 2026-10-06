import { learningStory } from "@/data/profile";

export function LearningSection() {
  const steps = [
    ["What happened", learningStory.happened],
    ["Impact", learningStory.impact],
    ["Root cause", learningStory.cause],
    ["Action", learningStory.action],
    ["Lesson", learningStory.lesson],
  ] as const;
  return (
    <section id="learning" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--accent-violet)]">11 · Failure, then learning</p>
        <h2 className="display mt-3 text-3xl text-[var(--text-primary)] md:text-5xl">Failure, then learning</h2>
        <p className="mt-4 max-w-2xl text-[var(--text-muted)]">{learningStory.source}</p>
        <ol className="mt-8 grid gap-4 md:grid-cols-5">
          {steps.map(([label, value], index) => (
            <li key={label} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[11px] text-[var(--accent-indigo)]">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-sm text-[var(--text-primary)]">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{value}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
