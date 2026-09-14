import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const publicAuth = new Set(["auth/login", "auth/register"]);

function isAllowed(path, method) {
  if (publicAuth.has(path)) return method === "POST";
  if (path === "auth/logout") return method === "POST";
  if (path === "blobs") return method === "GET" || method === "POST";
  if (path === "insights" || /^insights\/req-[0-9a-f-]+$/i.test(path)) return method === "GET";
  return false;
}

async function handle(request, { params }) {
  const { path: segments } = await params;
  const path = segments.join("/");
  if (!isAllowed(path, request.method)) {
    return NextResponse.json({ message: "Rota indisponível" }, { status: 404 });
  }

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ message: "Origem inválida" }, { status: 403 });
    }
  }

  if (path === "auth/logout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!publicAuth.has(path) && !token) {
    return NextResponse.json({ message: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  const apiBase = process.env.API_BASE_URL ?? "http://localhost:8080";
  const headers = {};
  if (token && !publicAuth.has(path)) headers.Authorization = `Bearer ${token}`;
  let body;
  if (request.method === "POST") {
    const type = request.headers.get("content-type") ?? "";
    if (path === "blobs" && type.includes("multipart/form-data")) {
      body = await request.formData();
    } else if (publicAuth.has(path) && type.includes("application/json")) {
      headers["Content-Type"] = "application/json";
      body = await request.text();
    } else {
      return NextResponse.json({ message: "Tipo de conteúdo inválido" }, { status: 415 });
    }
  }

  try {
    const upstream = await fetch(`${apiBase.replace(/\/$/, "")}/api/${path}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => null);
    if (publicAuth.has(path) && upstream.ok) {
      if (!data?.token) return NextResponse.json({ message: "Resposta de autenticação inválida" }, { status: 502 });
      const { token: jwt, ...user } = data;
      const response = NextResponse.json(user, { status: upstream.status });
      response.cookies.set(SESSION_COOKIE, jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }
    const response = NextResponse.json(data, { status: upstream.status });
    if (upstream.status === 401) response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch {
    return NextResponse.json({ message: "API indisponível no momento" }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;

