import { NextRequest, NextResponse } from "next/server";
import { isOSType } from "@/lib/types";
import { isRateLimited, requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import { normalizeDemandQuery } from "@/lib/search-demand";

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

  if (!query || !Number.isInteger(resultCount) || resultCount < 0 || resultCount > 500) {
    return NextResponse.json({ ok: false, logged: false }, { status: 400 });
  }

  // 成功検索の語句はサーバーに保存しない。公開プライバシー方針と同じ境界を
  // API側でも強制し、直接POSTされた場合も日次集計へ記録しない。
  if (resultCount !== 0) {
    return NextResponse.json({ ok: true, logged: false, storage: "not_collected" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  }

  if (!serverSupabase) {
    return NextResponse.json({ ok: true, logged: false }, { status: 202, headers: { "Cache-Control": "no-store" } });
  }

  const normalizedQuery = normalizeDemandQuery(query).slice(0, MAX_QUERY_LENGTH) || query;
  // 新スキーマでは0件検索だけを日次集計へupsertし、同じ検索を行単位で無期限保存しない。
  // 移行前環境でもゼロヒットだけを従来テーブルへ保存する。
  let storage: "daily" | "legacy_zero_hit" | "unavailable" = "daily";
  let logged = false;
  let { error } = await serverSupabase.rpc("record_search_query", {
    input_query: query,
    input_normalized_query: normalizedQuery,
    input_os: os,
    input_result_count: Math.min(50, resultCount),
  });
  if (!error) logged = true;
  if (error && ["42883", "PGRST202", "42P01", "PGRST205", "42501"].includes(error.code || "")) {
    storage = "legacy_zero_hit";
    ({ error } = await serverSupabase.from("search_logs").insert({
      query,
      normalized_query: normalizedQuery,
      os,
      result_count: 0,
    }));
    logged = !error;
  }

  if (error && !["42P01", "PGRST205", "42501"].includes(error.code || "")) {
    // ログ保存の失敗で検索画面を壊さない。テーブル未作成時も公開機能は継続する。
    console.error("[api/search-log] insert failed", { message: error.message, code: error.code });
  }
  return NextResponse.json({ ok: true, logged, storage }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
