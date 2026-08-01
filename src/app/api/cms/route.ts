import { NextResponse } from "next/server";
import { cms } from "@/lib/cms";

export async function GET() {
  return NextResponse.json({
    achievements: cms.achievements,
    projects: cms.projects,
    caseStudies: cms.caseStudies,
    experience: cms.experience,
    skills: cms.skills,
    techStack: cms.techStack,
  });
}
