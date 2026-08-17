import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

// Convenção Next.js 16: middleware.js foi renomeado para proxy.js
// (mesma API, apenas o nome do arquivo/função mudou).
const PROTECTED_PREFIXES = ["/dashboard", "/upload"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*"],
};
