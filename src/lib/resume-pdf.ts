import { contact, heroMetrics, positioning, RESUME_VERSION } from "@/data/profile";
import { cms } from "@/lib/cms";

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, width = 92) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

export function resumeLines() {
  const lines: string[] = [
    positioning.name.toUpperCase(),
    positioning.role,
    `${contact.location} | ${contact.phone} | ${contact.email}`,
    contact.linkedin,
    "",
    "PROFESSIONAL SUMMARY",
    ...wrap(positioning.summary),
    "",
    "SELECTED IMPACT",
  ];
  for (const metric of heroMetrics) {
    lines.push(...wrap(`${metric.value}  ${metric.label}. ${metric.context} ${metric.where}, ${metric.when}.`));
  }
  lines.push("", "PROFESSIONAL EXPERIENCE");
  for (const job of cms.experience) {
    lines.push("", `${job.company} | ${job.location}`, `${job.role} | ${job.period}`);
    for (const responsibility of job.responsibilities) {
      const wrapped = wrap(`- ${responsibility}`);
      wrapped.forEach((line, index) => lines.push(index === 0 ? line : `  ${line}`));
    }
  }
  lines.push("", "EDUCATION AND CERTIFICATIONS");
  for (const item of cms.resume.education) {
    lines.push(`${item.degree} | ${item.institution} | ${item.year}`);
  }
  lines.push("", "TECHNICAL TOOLKIT");
  for (const [group, items] of Object.entries(cms.techStack)) {
    lines.push(...wrap(`${group}: ${(items as string[]).join(", ")}`));
  }
  lines.push("", `Internal resume version ${RESUME_VERSION}. Content is generated from the portfolio profile.`);
  return lines;
}

export function buildResumePdf() {
  const lines = resumeLines();
  const pageSize = 48;
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += pageSize) {
    pages.push(lines.slice(index, index + pageSize));
  }

  const contentStart = 3;
  const pageIds = pages.map((_, index) => contentStart + pages.length + index);
  const fontId = pageIds[pageIds.length - 1] + 1;
  const offsets: number[] = [];
  const chunks: string[] = ["%PDF-1.4\n"];

  const add = (id: number, body: string) => {
    offsets[id] = chunks.join("").length;
    chunks.push(`${id} 0 obj\n${body}\nendobj\n`);
  };

  add(1, "<< /Type /Catalog /Pages 2 0 R >>");
  add(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`);

  pages.forEach((page, index) => {
    const commands = ["BT", "/F1 10.5 Tf", "13 TL", "50 760 Td"];
    page.forEach((line, lineIndex) => {
      const text = `(${escapePdf(line)}) Tj`;
      commands.push(lineIndex === 0 ? text : `T* ${text}`);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    add(contentStart + index, `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });

  pageIds.forEach((id, index) => {
    add(
      id,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentStart + index} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  });
  add(fontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const xrefAt = chunks.join("").length;
  const size = fontId + 1;
  let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let id = 1; id < size; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  return Buffer.from(`${chunks.join("")}${xref}trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
}
