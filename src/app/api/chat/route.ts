import { NextRequest, NextResponse } from "next/server";
import { answerFromPortfolio, type AgentChannel, type AgentTurn } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message || "");
    const channel: AgentChannel = body.channel === "voice" ? "voice" : "chat";
    const history = Array.isArray(body.history)
      ? (body.history as AgentTurn[]).slice(-8).map((t): AgentTurn => ({
          role: t.role === "assistant" ? "assistant" : "user",
          content: String(t.content || "").slice(0, 1200),
        }))
      : [];
    const result = answerFromPortfolio(message, { channel, history });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { answer: "Something went wrong. Please try again.", sources: [] },
      { status: 400 },
    );
  }
}
