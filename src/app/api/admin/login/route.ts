import { NextRequest, NextResponse } from "next/server";
import { dashboardToken, isValidPassword } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String((body as { password?: string }).password || "");
  if (!isValidPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ts_dash", dashboardToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: req.headers.get("x-forwarded-proto") === "https",
  });
  return res;
}
