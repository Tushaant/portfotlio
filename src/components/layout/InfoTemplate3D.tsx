"use client";

import Image from "next/image";

/** 3D atmosphere is global - this template focuses content with glass panels. */
export function InfoTemplate3D({
 eyebrow,
 title,
 subtitle,
 children,
 actions,
 avatarSrc,
}: {
 eyebrow?: string;
 title: string;
 subtitle?: string;
 children: React.ReactNode;
 actions?: React.ReactNode;
 avatarSrc?: string;
}) {
 return (
 <div className="relative min-h-screen">
 <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-28 md:px-6">
 {eyebrow && (
 <p className="font-mono text-xs tracking-[0.28em] text-cyan-300/80">
 {eyebrow}
 </p>
 )}
 <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center">
 {avatarSrc && (
 <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[color:rgba(var(--accent-rgb),0.5)] shadow-[0_0_28px_rgba(var(--accent-rgb),0.28)] md:h-28 md:w-28">
 <Image
 src={avatarSrc}
 alt={title}
 width={112}
 height={112}
 className="h-full w-full object-cover"
 priority
 />
 </div>
 )}
 <div className="min-w-0">
 <h1 className="display text-4xl neon-text md:text-6xl">{title}</h1>
 {subtitle && (
 <p className="mt-3 max-w-2xl text-lg text-slate-300">{subtitle}</p>
 )}
 </div>
 </div>
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
 <section className="glass rounded-3xl p-6 md:p-8 transition hover:shadow-[0_0_40px_rgba(56,248,255,0.12)]">
 <h2 className="font-mono text-[11px] tracking-[0.22em] text-cyan-300/80">
 {label}
 </h2>
 <div className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
 {children}
 </div>
 </section>
 );
}
