import { NextRequest, NextResponse } from "next/server";
import { appendEvent } from "@/lib/event-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").slice(0, 80);
    if (!name) return NextResponse.json({ ok: false }, { status: 400 });
    await appendEvent({
      name,
      at: Number(body.at) || Date.now(),
      visitorId: String(body.visitorId || "anon").slice(0, 80),
      sessionId: String(body.sessionId || "session").slice(0, 80),
      conversationId: body.conversationId ? String(body.conversationId).slice(0, 80) : null,
      agentType: body.agentType ? String(body.agentType).slice(0, 16) : null,
      properties: body.properties && typeof body.properties === "object" ? body.properties : {},
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
