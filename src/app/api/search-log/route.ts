import { NextRequest, NextResponse } from "next/server";
import { isOSType } from "@/lib/types";
import { isRateLimited, requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_QUERY_LENGTH = 120;

function normalizeLogQuery(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\u3000\s]+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (isRateLimited(attempts, request, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, logged: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, logged: false }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, logged: false }, { status: 400 });
  }

  const values = body as { query?: unknown; resultCount?: unknown; os?: unknown };
  const query = typeof values.query === "string" ? normalizeLogQuery(values.query) : "";
  const resultCount = typeof values.resultCount === "number" ? values.resultCount : Number(values.resultCount);
  const os = typeof values.os === "string" && isOSType(values.os) ? values.os : null;

  if (!query || !Number.isInteger(resultCount) || resultCount < 0 || resultCount > 50) {
    return NextResponse.json({ ok: false, logged: false }, { status: 400 });
  }

  // 現時点ではゼロヒットだけを保存し、運営コストと収集データを抑える。
  if (resultCount !== 0 || !serverSupabase) {
    return NextResponse.json({ ok: true, logged: false }, { status: 202, headers: { "Cache-Control": "no-store" } });
  }

  const { error } = await serverSupabase.from("search_logs").insert({
    query,
    normalized_query: query,
    os,
    result_count: 0,
  });

  if (error && !["42P01", "PGRST205"].includes(error.code || "")) {
    // ログ保存の失敗で検索画面を壊さない。テーブル未作成時も公開機能は継続する。
    console.error("[api/search-log] insert failed", { message: error.message, code: error.code });
  }
  return NextResponse.json({ ok: true, logged: !error }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
