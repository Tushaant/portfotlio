"use client";

import { useEffect } from "react";
import { useUIStore, type PortfolioLens } from "@/store/ui-store";

const LENSES: { id: PortfolioLens; label: string; hint: string }[] = [
  { id: "executive", label: "Executive", hint: "P&L, clients, leadership, outcomes" },
  { id: "product", label: "Product", hint: "Discovery, roadmap, customers, delivery" },
  { id: "technical", label: "Technical", hint: "Agents, RAG, MCP, evaluation, governance" },
];

export function ViewSwitcher() {
  const lens = useUIStore((state) => state.lens);
  const setLens = useUIStore((state) => state.setLens);

  useEffect(() => {
    const stored = window.localStorage.getItem("portfolio-lens");
    if (stored === "executive" || stored === "product" || stored === "technical") setLens(stored);
  }, [setLens]);

  return (
    <div className="sticky top-20 z-30 mx-auto mt-6 w-full max-w-3xl px-4">
      <div
        className="flex rounded-full border border-[var(--border)] bg-[var(--surface)]/90 p-1 backdrop-blur"
        role="tablist"
        aria-label="Portfolio emphasis"
      >
        {LENSES.map((item) => {
          const selected = lens === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              title={item.hint}
              onClick={() => {
                setLens(item.id);
                window.localStorage.setItem("portfolio-lens", item.id);
              }}
              className={`min-h-11 min-w-0 flex-1 rounded-full px-2 text-[10px] tracking-[0.08em] uppercase sm:px-3 sm:text-xs sm:tracking-[0.14em] ${
                selected ? "bg-[var(--accent-violet)] text-white" : "text-[var(--text-muted)]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
