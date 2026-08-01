"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cms } from "@/lib/cms";
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Download,
  GraduationCap,
  IndianRupee,
  Mic2,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  pmp: Award,
  analytics: BarChart3,
  "mkc-downloads": Download,
  "veda-downloads": Download,
  portfolio: Briefcase,
  "llm-quality": Bot,
  revenue: IndianRupee,
  retention: Users,
  governance: ShieldCheck,
  velocity: Zap,
  btech: GraduationCap,
  workshops: Mic2,
  arb: ShieldCheck,
  notion: BookOpen,
};

type Achievement = (typeof cms.achievements)[number] & {
  icon?: string | null;
  image?: string | null;
  description?: string;
  link?: string | null;
};

function AchievementGlyph({
  item,
  active,
  size = 28,
}: {
  item: Achievement;
  active?: boolean;
  size?: number;
}) {
  if (item.icon) {
    return (
      <Image
        src={item.icon}
        alt=""
        width={size}
        height={size}
        className="rounded-md object-cover"
      />
    );
  }

  const Icon = ACHIEVEMENT_ICONS[item.id] || Trophy;
  return (
    <Icon
      className={active ? "text-[#D4AF37]" : "text-[#F3EBD8]/80"}
      style={{ width: size * 0.85, height: size * 0.85 }}
    />
  );
}

export function AchievementsSection() {
  const achievements = cms.achievements as Achievement[];
  const [active, setActive] = useState(
    achievements.find((a) => a.id === "mkc-downloads")?.id ||
      achievements[0].id,
  );
  const item = achievements.find((a) => a.id === active)!;

  return (
    <section id="achievements" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-[#D4AF37]/80">
          05 · TROPHY ROOM
        </p>
        <h2 className="display mt-3 text-3xl md:text-5xl">
          Unlocked <span className="neon-text">achievements</span>
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Highlighted mobile scale: Veda Academy at 1L+ downloads and Major
          Kalshi Classes at 1M+ (10L+) downloads on Google Play.
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
          <li className="list-disc list-inside">Certifications</li>
          <li className="list-disc list-inside">Milestones</li>
          <li className="list-disc list-inside">App downloads</li>
          <li className="list-disc list-inside">Recognition</li>
        </ul>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {(["veda-downloads", "mkc-downloads"] as const)
            .map((id) => achievements.find((a) => a.id === id))
            .filter((a): a is Achievement => Boolean(a))
            .map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActive(a.id)}
                className={`skill-card overflow-hidden rounded-3xl text-left transition ${
                  active === a.id ? "ring-2 ring-[#D4AF37]/60" : ""
                }`}
              >
                {a.image && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={a.image}
                      alt={a.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/45 bg-[#121212]/95">
                      <AchievementGlyph item={a} active size={36} />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="display text-2xl text-[#D4AF37]">
                        {a.metrics?.Downloads || ""}
                      </p>
                      <p className="text-sm text-white">{a.title}</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[360px] rounded-3xl border border-[#D4AF37]/20 bg-[radial-gradient(ellipse_at_center,#161616_0%,#0B0B0B_70%)] p-6">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative flex flex-wrap items-center justify-center gap-4 py-8">
              {achievements.map((a, i) => (
                <motion.button
                  key={a.id}
                  type="button"
                  onClick={() => setActive(a.id)}
                  className="animate-float"
                  style={{ animationDelay: `${(i % 5) * 0.4}s` }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.96 }}
                  title={a.title}
                >
                  <div
                    className={`flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-full border ${
                      active === a.id
                        ? "border-[#D4AF37] bg-[#1A1A1A] shadow-[0_0_40px_rgba(212,175,55,0.35)]"
                        : "border-[#D4AF37]/30 bg-[#121212]"
                    }`}
                  >
                    <AchievementGlyph item={a} active={active === a.id} size={34} />
                    <span className="mt-1 text-[8px] uppercase tracking-wider text-[#A8946B]">
                      {a.type.slice(0, 4)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="skill-card rounded-3xl p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/40 bg-[#121212]">
                  <AchievementGlyph item={item} active size={36} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--gold)]">
                    {item.type}
                  </p>
                  <h3 className="display mt-1 text-2xl text-[var(--text)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.org} · {item.year}
                  </p>
                </div>
              </div>
              {item.image && (
                <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--gold)_35%,transparent)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              )}
              {item.description && (
                <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--text)]">
                  {item.description}
                </p>
              )}
              {item.metrics && Object.keys(item.metrics).length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {Object.entries(item.metrics).map(([k, v]) => (
                    <div key={k} className="metric-chip rounded-xl p-3">
                      <p className="display text-lg text-[var(--gold)]">{v}</p>
                      <p className="text-[11px] font-medium text-[var(--muted)]">
                        {k}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm font-semibold text-[var(--gold)]"
                >
                  {item.id.includes("downloads") || item.id === "mkc-downloads" || item.id === "veda-downloads"
                    ? "Open Play Store →"
                    : "Open link →"}
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
