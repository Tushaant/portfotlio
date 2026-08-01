import { NextRequest, NextResponse } from "next/server";
import { answerFromPortfolio } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message || "");
    const result = answerFromPortfolio(message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { answer: "Unable to process transmission.", sources: [] },
      { status: 400 },
    );
  }
}
