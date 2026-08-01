"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cms } from "@/lib/cms";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Menu, X, Command } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const setPaletteOpen = useUIStore((s) => s.setPaletteOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 rounded-2xl transition-all",
          scrolled && "glass mx-3 md:mx-auto shadow-[0_0_40px_rgba(56,248,255,0.08)]",
        )}
      >
        <Link href="/#top" className="group flex items-center gap-2 py-2">
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 display text-sm text-cyan-300"
            animate={{ boxShadow: ["0 0 0 rgba(56,248,255,0)", "0 0 24px rgba(56,248,255,0.45)", "0 0 0 rgba(56,248,255,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            TS
          </motion.span>
          <span className="display text-sm tracking-wider">
            <span className="text-white">Tushant</span>
            <span className="text-cyan-300">.AI</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {cms.site.nav.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
            >
              <Link
                href={item.href}
                className="px-2.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-300/80 transition hover:text-cyan-300"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="glass hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-300"
            aria-label="Open command palette"
          >
            <Command className="h-3.5 w-3.5" />
            <span>⌘K</span>
          </button>
          <button
            type="button"
            className="lg:hidden glass rounded-lg p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass mx-3 mt-2 rounded-2xl p-4 flex flex-col gap-2">
          {cms.site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5 hover:text-cyan-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
