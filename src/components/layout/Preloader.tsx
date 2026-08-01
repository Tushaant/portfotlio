"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui-store";

export function Preloader() {
  const done = useUIStore((s) => s.preloaderDone);
  const setDone = useUIStore((s) => s.setPreloaderDone);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        clearInterval(id);
        setTimeout(() => setDone(true), 420);
      } else {
        setProgress(Math.floor(p));
      }
    }, 120);
    return () => clearInterval(id);
  }, [setDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05060B]"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 grid-bg opacity-60" />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center"
          >
            <p className="display text-xs tracking-[0.35em] text-cyan-300/80 mb-4">
              INITIALIZING COMMAND CENTER
            </p>
            <h1 className="display text-3xl md:text-5xl neon-text mb-8">
              Tushant.AI
            </h1>
            <div className="mx-auto h-[2px] w-56 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 font-mono text-sm text-cyan-200/70">
              {progress}% · boot sequence
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
