"use client";

import Link from "next/link";
import { cms } from "@/lib/cms";
import { trackEvent } from "@/lib/analytics";

export function ResumeActions() {
  return (
    <>
      <a
        href={cms.site.social.resume}
        className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-medium text-black"
        download
        onClick={() => {
          trackEvent("resume_viewed");
          trackEvent("resume_downloaded");
        }}
      >
        Download PDF
      </a>
      <Link href="/#top" className="glass rounded-full px-4 py-2 text-sm text-slate-300">
        ← command center
      </Link>
    </>
  );
}
