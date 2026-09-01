import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dashboardToken } from "@/lib/admin-auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }
  const token = dashboardToken();
  const ok = Boolean(token) && req.cookies.get("ts_dash")?.value === token;
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const login = new URL("/admin/login", req.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/intelligence"],
};
