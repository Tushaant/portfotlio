import { NextRequest, NextResponse } from "next/server";

/** Lightweight contact endpoint - logs payload; wire to email/Resend in production. */
export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const name = String(body.name || "").slice(0, 120);
 const email = String(body.email || "").slice(0, 120);
 const message = String(body.message || "").slice(0, 4000);
 if (!name || !email || !message) {
 return NextResponse.json({ ok: false }, { status: 400 });
 }
 console.info("[contact]", { name, email, message: message.slice(0, 200) });
 return NextResponse.json({ ok: true });
 } catch {
 return NextResponse.json({ ok: false }, { status: 400 });
 }
}
