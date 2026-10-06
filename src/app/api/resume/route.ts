import { profileContradictions } from "@/data/profile";
import { buildResumePdf } from "@/lib/resume-pdf";

export async function GET() {
  const issues = profileContradictions();
  if (issues.length) {
    return new Response(issues.join("\n"), { status: 500 });
  }
  const pdf = buildResumePdf();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Tushant_Sharma_AI_Product_Leader_Resume.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
