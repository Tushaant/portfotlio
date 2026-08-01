"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false },
);

/** 3D-rendered atmospheric template wrapped around every information surface. */
export function InfoTemplate3D({
  eyebrow,
  title,
  subtitle,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 h-[70vh] opacity-50">
        <HeroScene />
      </div>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-28 md:px-6">
        {eyebrow && (
          <p className="font-mono text-xs tracking-[0.28em] text-cyan-300/80">
            {eyebrow}
          </p>
        )}
        <h1 className="display mt-3 text-4xl neon-text md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{subtitle}</p>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        <div className="mt-12 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h2 className="font-mono text-[11px] tracking-[0.22em] text-cyan-300/80">
        {label}
      </h2>
      <div className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
        {children}
      </div>
    </section>
  );
}
