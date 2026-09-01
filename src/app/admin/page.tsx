"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Intel = {
  kpis: Record<string, number>;
  topics: { label: string; volume: number; reach: number; chat: number; voice: number }[];
  questions: {
    label: string;
    occurrences: number;
    visitors: number;
    topic: string;
    intent: string;
    chat: number;
    voice: number;
  }[];
  edges: { a: string; b: string; count: number }[];
  knowledgeGaps: { question: string; frequency: number; visitors: number; coverage: string }[];
  insights: string[];
  attribution: { windowHours: number; model: string; contactByAgent: { chat: number; voice: number } };
  sampleNotes: Record<string, string>;
};

const NAV = [
  "Overview",
  "Analytics",
  "AI Engagement",
  "Conversation Intelligence",
  "Knowledge Graph",
  "Conversions",
] as const;

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#71717A]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#A1A1AA]">{hint}</p> : null}
    </div>
  );
}

function fmtMs(ms: number) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof NAV)[number]>("Overview");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Intel | null>(null);
  const [error, setError] = useState("");
  const [agent, setAgent] = useState<"all" | "chat" | "voice">("all");

  useEffect(() => {
    setError("");
    void fetch(`/api/intelligence?days=${days}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load intelligence.");
        setData((await r.json()) as Intel);
      })
      .catch(() => setError("Could not load dashboard data."));
  }, [days]);

  const k = data?.kpis;
  const topics = (data?.topics || []).filter((t) => {
    if (agent === "chat") return t.chat > 0;
    if (agent === "voice") return t.voice > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#A78BFA]">Private</p>
            <h1 className="mt-1 text-3xl font-semibold">Portfolio Intelligence</h1>
            <p className="mt-2 max-w-xl text-sm text-[#A1A1AA]">
              Behavioral data associated with visitors. Not causation. No recordings. Opening an agent is not a conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-full px-3 py-1.5 text-xs ${days === d ? "bg-[#8B5CF6] text-white" : "border border-white/10 text-[#A1A1AA]"}`}
              >
                {d}d
              </button>
            ))}
            <Link href="/admin/cms" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#22D3EE]">
              CMS
            </Link>
            <Link href="/" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#A1A1AA]">
              Site
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {NAV.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTab(n)}
              className={`rounded-full px-3 py-1.5 text-xs ${tab === n ? "bg-[#FF3CAC]/20 text-[#F472B6]" : "border border-white/10 text-[#71717A]"}`}
            >
              {n}
            </button>
          ))}
        </div>

        {error ? <p className="mt-8 text-sm text-[#F472B6]">{error}</p> : null}
        {!data && !error ? <p className="mt-8 text-sm text-[#71717A]">Loading…</p> : null}

        {data && k ? (
          <div className="mt-8 space-y-8">
            {(tab === "Overview" || tab === "Analytics") && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card label="Unique visitors" value={String(k.uniqueVisitors)} hint="COUNT DISTINCT visitor_id" />
                <Card label="Sessions" value={String(k.sessions)} hint="30 minute inactivity timeout" />
                <Card label="Returning" value={`${k.returningRate}%`} hint={`${k.returningVisitors} visitors`} />
                <Card label="Avg session" value={fmtMs(k.avgSessionMs)} hint={`Median ${fmtMs(k.medianSessionMs)}`} />
                <Card label="AI engagement" value={`${k.aiEngagementRate}%`} hint="AI users / unique visitors" />
                <Card label="Chat sessions" value={String(k.chatSessions)} />
                <Card label="Voice sessions" value={String(k.voiceSessions)} />
                <Card label="AI conversations" value={String(k.aiConversations)} hint="Message required" />
              </div>
            )}

            {tab === "AI Engagement" && (
              <>
                <div className="flex gap-2">
                  {(["all", "chat", "voice"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAgent(a)}
                      className={`rounded-full px-3 py-1 text-xs capitalize ${agent === a ? "bg-[#22D3EE]/20 text-[#22D3EE]" : "border border-white/10"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Card label="Chat opens" value={String(k.chatOpens)} hint="Open ≠ conversation" />
                  <Card label="Voice opens" value={String(k.voiceOpens)} hint="Open ≠ conversation" />
                  <Card label="Chat messages" value={String(k.chatMessages)} />
                  <Card label="Voice messages" value={String(k.voiceMessages)} hint="Final transcripts only" />
                </div>
              </>
            )}

            {(tab === "Conversation Intelligence" || tab === "Overview") && (
              <section>
                <h2 className="text-sm uppercase tracking-[0.16em] text-[#A1A1AA]">What visitors are asking</h2>
                {!topics.length ? (
                  <p className="mt-3 text-sm text-[#71717A]">Insufficient data.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="text-[10px] uppercase tracking-wider text-[#71717A]">
                        <tr>
                          <th className="px-3 py-2">Topic</th>
                          <th className="px-3 py-2">Volume</th>
                          <th className="px-3 py-2">Reach</th>
                          <th className="px-3 py-2">Chat</th>
                          <th className="px-3 py-2">Voice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topics.map((t) => (
                          <tr key={t.label} className="border-t border-white/5">
                            <td className="px-3 py-2 text-[#F472B6]">{t.label}</td>
                            <td className="px-3 py-2">{t.volume}</td>
                            <td className="px-3 py-2">{t.reach}</td>
                            <td className="px-3 py-2 text-[#22D3EE]">{t.chat}</td>
                            <td className="px-3 py-2 text-[#8B5CF6]">{t.voice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <h3 className="mt-8 text-sm uppercase tracking-[0.16em] text-[#A1A1AA]">Most asked clusters</h3>
                {!data.questions.length ? (
                  <p className="mt-3 text-sm text-[#71717A]">Insufficient data.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {data.questions.slice(0, 10).map((q) => (
                      <li key={q.label} className="rounded-xl border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm">
                        <span className="text-white">{q.label}</span>
                        <span className="ml-2 text-xs text-[#71717A]">
                          {q.occurrences} · {q.visitors} visitors · {q.topic} · {q.intent}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {tab === "Knowledge Graph" && (
              <section>
                <h2 className="text-sm uppercase tracking-[0.16em] text-[#A1A1AA]">Visitor knowledge graph</h2>
                <p className="mt-2 text-xs text-[#71717A]">
                  What visitors want to know. Edges require {data.sampleNotes.relationship}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <span
                      key={t.label}
                      className="rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#C4B5FD]"
                    >
                      {t.label} · {t.volume}
                    </span>
                  ))}
                </div>
                {!data.edges.length ? (
                  <p className="mt-4 text-sm text-[#71717A]">Insufficient data.</p>
                ) : (
                  <ul className="mt-4 space-y-2 text-sm">
                    {data.edges.map((e) => (
                      <li key={`${e.a}-${e.b}`} className="text-[#22D3EE]">
                        {e.a} ↔ {e.b} · {e.count} conversations
                      </li>
                    ))}
                  </ul>
                )}
                <h3 className="mt-8 text-sm uppercase tracking-[0.16em] text-[#A1A1AA]">Knowledge gaps</h3>
                {!data.knowledgeGaps.length ? (
                  <p className="mt-3 text-sm text-[#71717A]">Insufficient data.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {data.knowledgeGaps.map((g) => (
                      <li key={g.question} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
                        {g.question} · {g.visitors} visitors · {g.coverage}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {(tab === "Conversions" || tab === "Overview") && (
              <section>
                <h2 className="text-sm uppercase tracking-[0.16em] text-[#A1A1AA]">Outcomes</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Card label="Contact clicks" value={String(k.contactClicks)} hint={`${k.contactRate}% unique`} />
                  <Card label="LinkedIn clicks" value={String(k.linkedinClicks)} />
                  <Card label="Resume actions" value={String(k.resumeActions)} />
                  <Card
                    label="AI → Contact"
                    value={`${k.aiToContact}%`}
                    hint={`${data.attribution.windowHours}h last AI touch`}
                  />
                </div>
                <p className="mt-3 text-xs text-[#71717A]">
                  Associated with Chat {data.attribution.contactByAgent.chat} / Voice {data.attribution.contactByAgent.voice}. Not caused by.
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4">
              <h2 className="text-sm uppercase tracking-[0.16em] text-[#F472B6]">What visitors are telling me</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#A1A1AA]">
                {data.insights.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
