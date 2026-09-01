"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useUIStore } from "@/store/ui-store";
import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { GlobalMotionBackground } from "@/components/effects/GlobalMotionBackground";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ChatAgent } from "@/components/agent/ChatAgent";
import { VoiceAgent } from "@/components/agent/VoiceAgent";
import { FloatingControls } from "@/components/layout/FloatingControls";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";

export function Providers({ children }: { children: React.ReactNode }) {
  const hologramMode = useUIStore((s) => s.hologramMode);
  const agentOpen = useUIStore((s) => s.agentOpen);
  const voiceAgentOpen = useUIStore((s) => s.voiceAgentOpen);
  const paletteOpen = useUIStore((s) => s.paletteOpen);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Freeze page scroll while agent or command palette is open
  useEffect(() => {
    const locked = agentOpen || voiceAgentOpen || paletteOpen;
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevPad = body.style.paddingRight;

    if (locked) {
      const scrollbar = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
      body.classList.add("scroll-locked");
    } else {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.paddingRight = prevPad;
      body.classList.remove("scroll-locked");
    }

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
      body.classList.remove("scroll-locked");
      lenisRef.current?.start();
    };
  }, [agentOpen, voiceAgentOpen, paletteOpen]);

  useEffect(() => {
    document.body.classList.toggle("hologram-light", hologramMode === "light");
    document.documentElement.style.colorScheme =
      hologramMode === "light" ? "light" : "dark";
  }, [hologramMode]);

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t") {
        e.preventDefault();
        useUIStore.getState().toggleHologram();
      }
      if (e.key === "Escape") {
        useUIStore.getState().setPaletteOpen(false);
        useUIStore.getState().setAgentOpen(false);
        useUIStore.getState().setVoiceAgentOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <GlobalMotionBackground />
      <Preloader />
      <Header />
      <div className="theme-switch-dock">
        <ThemeSwitch />
      </div>
      <main className="relative z-10">{children}</main>
      <CommandPalette />
      <ChatAgent />
      <VoiceAgent />
      <VisitorTracker />
      <FloatingControls />
    </>
  );
}
