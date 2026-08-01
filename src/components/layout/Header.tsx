"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cms } from "@/lib/cms";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Menu, X, Command } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const setPaletteOpen = useUIStore((s) => s.setPaletteOpen);
  const agentOpen = useUIStore((s) => s.agentOpen);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      setScrolled(y > 16);

      if (y < 80) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true);
        setOpen(false);
      } else if (delta < -6) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shouldHide = hidden || agentOpen;

  return (
    <motion.header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-[padding] duration-300",
        scrolled ? "py-2" : "py-4",
      )}
      initial={false}
      animate={{
        y: shouldHide ? "-110%" : "0%",
        opacity: shouldHide ? 0 : 1,
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-6 rounded-2xl transition-all duration-300",
          scrolled
            ? "header-solid mx-3 md:mx-auto shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
            : "bg-transparent",
        )}
      >
        <Link
          href="/#top"
          className="group flex items-center gap-2.5 justify-self-start py-2"
        >
          <motion.span
            className="relative flex h-9 w-9 overflow-hidden rounded-full border border-[color:rgba(var(--accent-rgb),0.55)] bg-[var(--surface)]"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(var(--accent-rgb),0)",
                "0 0 18px 2px rgba(var(--accent-rgb),0.4)",
                "0 0 0 0 rgba(var(--accent-rgb),0)",
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            <Image
              src="/profile/tushant-circle.png"
              alt="Tushant Sharma"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </motion.span>
          <span className="display text-sm tracking-wider">
            <span className="text-[var(--text)]">Tushant</span>
            <span className="text-[var(--gold)]">.AI</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-0.5 justify-self-center">
          {cms.site.nav.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
            >
              <Link
                href={item.href}
                className="inline-flex items-center px-2.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-amber-300"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end max-lg:mr-[4.75rem]">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="header-solid hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--muted)] hover:text-amber-300"
            aria-label="Open command palette"
          >
            <Command className="h-3.5 w-3.5" />
            <span>⌘K</span>
          </button>
          <button
            type="button"
            className="lg:hidden header-solid rounded-lg p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && !shouldHide && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden header-solid mx-3 mt-2 rounded-2xl p-4 flex flex-col gap-2"
          >
            {cms.site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-[var(--text)] hover:bg-amber-400/10 hover:text-amber-300"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
