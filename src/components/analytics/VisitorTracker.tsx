"use client";

import { useEffect, useRef } from "react";
import { getSessionId, getVisitorId, trackEvent } from "@/lib/analytics";

const SECTIONS = [
  "top",
  "about",
  "journey",
  "projects",
  "testimonials",
  "case-studies",
  "achievements",
  "skills",
  "gallery",
  "contact",
];

export function VisitorTracker() {
  const started = useRef(false);
  const engaged = useRef(false);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    getVisitorId();
    getSessionId();
    if (!started.current) {
      started.current = true;
      trackEvent("session_started");
      trackEvent("portfolio_viewed");
    }
    const markEngaged = () => {
      if (engaged.current) return;
      engaged.current = true;
      trackEvent("session_engaged");
    };

    const heartbeat = window.setInterval(() => {
      getSessionId();
    }, 20000);

    const onHide = () => trackEvent("session_ended");
    window.addEventListener("pagehide", onHide);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
          const id = entry.target.id;
          if (!id || seen.current.has(id)) continue;
          window.setTimeout(() => {
            if (entry.isIntersecting) {
              seen.current.add(id);
              trackEvent("section_viewed", { section: id });
              if (seen.current.size >= 2) markEngaged();
            }
          }, 1000);
        }
      },
      { threshold: [0.5] },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", onHide);
      obs.disconnect();
    };
  }, []);

  return null;
}
