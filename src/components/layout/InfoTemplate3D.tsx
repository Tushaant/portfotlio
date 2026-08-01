"use client";

/** 3D atmosphere is global - this template focuses content with glass panels. */
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
