"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useUIStore } from "@/store/ui-store";
import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ChatAgent } from "@/components/agent/ChatAgent";
import { FloatingControls } from "@/components/layout/FloatingControls";

export function Providers({ children }: { children: React.ReactNode }) {
  const hologramMode = useUIStore((s) => s.hologramMode);
  const terminalMode = useUIStore((s) => s.terminalMode);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("hologram-light", hologramMode === "light");
    document.body.classList.toggle("terminal-mode", terminalMode);
  }, [hologramMode, terminalMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useUIStore.getState().setPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        useUIStore.getState().setAgentOpen(true);
      }
      if (e.key === "Escape") {
        useUIStore.getState().setPaletteOpen(false);
        useUIStore.getState().setAgentOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Preloader />
      <CustomCursor />
      <Header />
      <main>{children}</main>
      <CommandPalette />
      <ChatAgent />
      <FloatingControls />
    </>
  );
}
