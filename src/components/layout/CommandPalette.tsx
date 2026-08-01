"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { cms } from "@/lib/cms";
import { Search } from "lucide-react";

type Item = { label: string; href: string; group: string };

export function CommandPalette() {
  const open = useUIStore((s) => s.paletteOpen);
  const setOpen = useUIStore((s) => s.setPaletteOpen);
  const setAgent = useUIStore((s) => s.setAgentOpen);
  const [q, setQ] = useState("");
  const router = useRouter();

  const items = useMemo<Item[]>(() => {
    const base: Item[] = [
      ...cms.site.nav.map((n) => ({
        label: n.label,
        href: n.href,
        group: "Navigate",
      })),
      {
        label: "Open AI Agent",
        href: "__agent__",
        group: "Actions",
      },
      {
        label: "Download Resume PDF",
        href: cms.site.social.resume,
        group: "Actions",
      },
      ...cms.projects.map((p) => ({
        label: p.title,
        href: `/projects/${p.slug}`,
        group: "Projects",
      })),
      ...cms.caseStudies.map((c) => ({
        label: c.title,
        href: `/case-studies/${c.slug}`,
        group: "Case Studies",
      })),
    ];
    if (!q.trim()) return base;
    const qq = q.toLowerCase();
    return base.filter((i) => i.label.toLowerCase().includes(qq));
  }, [q]);

  const run = (item: Item) => {
    setOpen(false);
    setQ("");
    if (item.href === "__agent__") {
      setAgent(true);
      return;
    }
    if (item.href.startsWith("http") || item.href.endsWith(".pdf")) {
      window.open(item.href, "_blank");
      return;
    }
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="header-solid w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_0_60px_rgba(255,179,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-amber-300" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search portfolio, projects, commands…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                ESC
              </kbd>
            </div>
            <ul className="max-h-80 overflow-auto overscroll-contain p-2">
              {items.map((item) => (
                <li key={`${item.group}-${item.label}`}>
                  <button
                    type="button"
                    onClick={() => run(item)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-amber-400/10"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {item.group}
                    </span>
                  </button>
                </li>
              ))}
              {!items.length && (
                <li className="px-3 py-6 text-center text-sm text-slate-500">
                  No matches in command center.
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
