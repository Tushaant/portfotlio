import type { Metadata } from "next";
import { cms } from "@/lib/cms";
import { InfoBlock, InfoTemplate3D } from "@/components/layout/InfoTemplate3D";
import { ResumeActions } from "@/components/analytics/ResumeActions";

export const metadata: Metadata = {
 title: "Resume",
 description:
 "Resume data sourced strictly from Tushant Sharma's attached PDF.",
};

export default function ResumePage() {
 const r = cms.resume;
 return (
 <InfoTemplate3D
 eyebrow="RESUME · PDF SOURCE ONLY"
 title={r.name}
 subtitle={r.title}
 avatarSrc="/profile/tushant-circle.png"
 actions={<ResumeActions />}
 >
 <InfoBlock label="CONTACT">
 <p>
 {r.location} · {r.phone} · {r.email}
 </p>
 <a
 href={r.linkedin}
 target="_blank"
 rel="noreferrer"
 className="mt-2 inline-block text-cyan-300"
 >
 LinkedIn profile →
 </a>
 </InfoBlock>

 <InfoBlock label="PROFESSIONAL SUMMARY">{r.summary}</InfoBlock>

 <InfoBlock label="CORE COMPETENCIES">
 <div className="flex flex-wrap gap-2">
 {r.coreCompetencies.map((c) => (
 <span
 key={c}
 className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300"
 >
 {c}
 </span>
 ))}
 </div>
 </InfoBlock>

 <InfoBlock label="PROFESSIONAL EXPERIENCE">
 <div className="space-y-8">
 {cms.experience.map((job) => (
 <div key={job.id}>
 <h3 className="display text-xl text-white">{job.company}</h3>
 <p className="text-sm text-cyan-200">{job.role}</p>
 <p className="text-xs text-slate-500">
 {job.period} · {job.location}
 </p>
 <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
 {job.responsibilities.map((resp) => (
 <li key={resp.slice(0, 48)}>{resp}</li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </InfoBlock>

 <InfoBlock label="EDUCATION AND CERTIFICATIONS">
 <ul className="space-y-2">
 {r.education.map((e) => (
 <li key={e.degree}>
 {e.degree} | {e.institution} | {e.year}
 </li>
 ))}
 </ul>
 </InfoBlock>

 <InfoBlock label="TECHNICAL TOOLKIT">
 <div className="space-y-4">
 {Object.entries(cms.techStack).map(([group, items]) => (
 <div key={group}>
 <p className="text-xs uppercase tracking-wider text-slate-500">
 {group}
 </p>
 <p className="mt-1 text-sm text-slate-300">
 {(items as string[]).join(", ")}
 </p>
 </div>
 ))}
 </div>
 </InfoBlock>

 <p className="text-center text-xs text-slate-500">
 All resume fields above are parsed from{" "}
        <code className="text-cyan-400/80">Tushant_Sharma_Resume.pdf</code>.
        No fabricated content.
 </p>
 </InfoTemplate3D>
 );
}
