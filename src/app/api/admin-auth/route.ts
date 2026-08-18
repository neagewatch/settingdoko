import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPasswordSession, isMfaAdminToken, passwordLoginEnabled } from "@/lib/admin-auth";
import { isRateLimited, requireSameOrigin } from "@/lib/request-security";
import { timingSafeEqual } from "node:crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const attempts = new Map<string, { count: number; resetAt: number }>();

function passwordMatches(value: string | undefined): boolean {
  if (!value || !ADMIN_PASSWORD) return false;
  const actual = Buffer.from(value);
  const expected = Buffer.from(ADMIN_PASSWORD);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (isRateLimited(attempts, request, 10, 15 * 60 * 1000)) return NextResponse.json({ error: "試行回数が上限に達しました。しばらくしてからお試しください。" }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  const values = body as Record<string, unknown>;
  const password = typeof values.password === "string" && values.password.length <= 256 ? values.password : undefined;
  const accessToken = typeof values.accessToken === "string" && values.accessToken.length <= 4096 ? values.accessToken : undefined;
  const mfaAuthenticated = typeof accessToken === "string" && await isMfaAdminToken(accessToken);
  const passwordAuthenticated = passwordLoginEnabled() && passwordMatches(password);
  if (!mfaAuthenticated && !passwordAuthenticated) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set("admin_auth", mfaAuthenticated ? accessToken : createPasswordSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: mfaAuthenticated ? 60 * 60 : 60 * 60 * 24 * 7,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
