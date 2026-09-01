import { NextRequest, NextResponse } from "next/server";
import { loadEvents } from "@/lib/event-store";
import { computeIntelligence } from "@/lib/metrics";
import { dashboardToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (req.cookies.get("ts_dash")?.value !== dashboardToken() || !dashboardToken()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const days = Number(req.nextUrl.searchParams.get("days") || 30);
  const to = Date.now();
  const from = to - Math.max(1, days) * 24 * 60 * 60 * 1000;
  const events = await loadEvents();
  return NextResponse.json(computeIntelligence(events, from, to));
}
