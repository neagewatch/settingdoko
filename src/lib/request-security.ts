import { NextRequest, NextResponse } from "next/server";

type RateRecord = { count: number; resetAt: number };

/** 管理APIはブラウザの同一オリジンからのみ受け付ける。 */
export function requireSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "invalid origin" }, { status: 403 });
  }
  return null;
}

/** インスタンス内の簡易制限。外部WAF/Turnstileを併用する前提の安全弁。 */
export function isRateLimited(store: Map<string, RateRecord>, request: NextRequest, limit: number, windowMs: number): boolean {
  const key = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const previous = store.get(key);
  const current = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + windowMs } : previous;
  if (current.count >= limit) return true;
  store.set(key, { ...current, count: current.count + 1 });
  return false;
}

export function publicFormIsValid(value: unknown, startedAt: unknown, honeypot: unknown): boolean {
  if (typeof honeypot === "string" && honeypot.trim()) return false;
  const started = typeof startedAt === "number" ? startedAt : Number(startedAt);
  return Number.isFinite(started) && Date.now() - started >= 800 && Date.now() - started < 60 * 60 * 1000 && typeof value === "string";
}
