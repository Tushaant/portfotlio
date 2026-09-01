"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CmsBundle = {
 achievements: unknown[];
 projects: unknown[];
 caseStudies: unknown[];
 experience: unknown[];
};

/**
 * Lightweight JSON CMS console.
 * Edit files in /content/cms/*.json and rebuild - or paste JSON here to preview.
 * Production writes stay file-based (no DB) for Vercel-ready deploys.
 */
export default function AdminPage() {
 const [bundle, setBundle] = useState<CmsBundle | null>(null);
 const [tab, setTab] = useState<
 "achievements" | "projects" | "caseStudies" | "experience"
 >("achievements");
 const [draft, setDraft] = useState("");
 const [msg, setMsg] = useState("");

 useEffect(() => {
 void fetch("/api/cms")
 .then((r) => r.json())
 .then((data) => {
 setBundle(data);
 setDraft(JSON.stringify(data.achievements, null, 2));
 });
 }, []);

 useEffect(() => {
 if (!bundle) return;
 setDraft(JSON.stringify(bundle[tab], null, 2));
 }, [tab, bundle]);

 const validate = () => {
 try {
 JSON.parse(draft);
 setMsg("JSON valid - copy into content/cms/" + tab.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`) + ".json and redeploy.");
 } catch (e) {
 setMsg(`Invalid JSON: ${(e as Error).message}`);
 }
 };

 return (
 <div className="min-h-screen bg-[#05060B] px-4 py-24 md:px-6">
 <div className="mx-auto max-w-5xl">
 <Link href="/" className="text-sm text-cyan-300">
 ← command center
 </Link>
 <h1 className="display mt-4 text-4xl neon-text">CMS Console</h1>
 <p className="mt-3 max-w-2xl text-sm text-slate-400">
 Markdown/JSON CMS for Achievements, Projects, Case Studies, Timeline,
 Speaking, and Blogs. Edit JSON under{" "}
 <code className="text-cyan-400">content/cms/</code> without touching
 React components. Images go in{" "}
 <code className="text-cyan-400">public/projects/</code> or{" "}
 <code className="text-cyan-400">public/cms/</code>.
 </p>

 <div className="mt-8 flex flex-wrap gap-2">
 {(
 [
 "achievements",
 "projects",
 "caseStudies",
 "experience",
 ] as const
 ).map((t) => (
 <button
 key={t}
 type="button"
 onClick={() => setTab(t)}
 className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider ${
 tab === t
 ? "bg-cyan-400/20 text-cyan-200"
 : "border border-white/10 text-slate-400"
 }`}
 >
 {t}
 </button>
 ))}
 </div>

 <textarea
 value={draft}
 onChange={(e) => setDraft(e.target.value)}
 className="mt-4 h-[480px] w-full rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-slate-200 outline-none focus:border-cyan-400/40"
 spellCheck={false}
 />

 <div className="mt-4 flex flex-wrap gap-3">
 <button
 type="button"
 onClick={validate}
 className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2 text-sm font-medium text-black"
 >
 Validate JSON
 </button>
 <a
 href="https://woolly-saga-8e5.notion.site/Tushant-Sharma-05d5b8ce678a4698ae6e7c89c726027e"
 target="_blank"
 rel="noreferrer"
 className="glass rounded-full px-4 py-2 text-sm text-slate-300"
 >
 Notion source
 </a>
 </div>
 {msg && <p className="mt-3 text-sm text-cyan-200">{msg}</p>}

 <div className="mt-10 glass rounded-2xl p-5 text-sm text-slate-400">
 <p className="font-mono text-xs tracking-wider text-cyan-300">
 HOW TO ADD CONTENT
 </p>
 <ol className="mt-3 list-decimal space-y-2 pl-5">
 <li>
 Add a new object to the relevant JSON file in{" "}
 <code>content/cms/</code>.
 </li>
 <li>
 Drop images/videos/certificates into{" "}
 <code>public/cms/</code> or <code>public/projects/</code>.
 </li>
 <li>
 Reference the path in the JSON (<code>image</code>,{" "}
 <code>link</code>, etc.).
 </li>
 <li>
 Commit &amp; redeploy - no component edits required.
 </li>
 </ol>
 </div>
 </div>
 </div>
 );
}
