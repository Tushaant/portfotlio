"use client";

import { ReactNode, UIEvent, useEffect, useRef } from "react";

export function AgentScroll({
  children,
  className = "",
  follow = true,
  onFollowChange,
  scrollKey,
}: {
  children: ReactNode;
  className?: string;
  follow?: boolean;
  onFollowChange?: (follow: boolean) => void;
  scrollKey?: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !follow) return;
    el.scrollTop = el.scrollHeight;
  }, [follow, scrollKey]);

  return (
    <div
      ref={ref}
      data-agent-scroll
      onScroll={(e: UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        onFollowChange?.(el.scrollHeight - el.scrollTop - el.clientHeight < 56);
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className={`agent-scroll min-h-0 flex-1 overflow-y-scroll overscroll-y-contain ${className}`}
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      aria-label="Conversation transcript"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
