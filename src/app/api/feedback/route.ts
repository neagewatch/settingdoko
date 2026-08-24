import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server-supabase";
import { isRateLimited, requireSameOrigin } from "@/lib/request-security";
import { createHash } from "node:crypto";

// 一人の連続送信を抑える安全弁。正確な投票システムではなく、運営判断用の参考値。
const attempts = new Map<string, { count: number; resetAt: number }>();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ ok: false }, { status: 503 });
  if (isRateLimited(attempts, request, 10, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "受付上限に達しました" }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const settingId = body && typeof body === "object" && "settingId" in body && typeof body.settingId === "string" ? body.settingId : "";
  const result = body && typeof body === "object" && "result" in body && typeof body.result === "string" ? body.result : "";
  const token = body && typeof body === "object" && "token" in body && typeof body.token === "string" ? body.token : "";
  if (!UUID_PATTERN.test(settingId) || !["helpful", "not_helpful"].includes(result) || !UUID_PATTERN.test(token)) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const recorded = await serverSupabase.rpc("record_setting_feedback", {
      input_setting_id: settingId,
      input_vote: result,
      input_token_hash: tokenHash,
    });
    if (!recorded.error) {
      const value = Array.isArray(recorded.data) ? recorded.data[0] : recorded.data;
      return NextResponse.json({
        ok: true,
        count: Number(value?.helpful_count) || 0,
        notHelpfulCount: Number(value?.not_helpful_count) || 0,
        recorded: value?.recorded !== false,
      }, { headers: { "Cache-Control": "no-store" } });
    }
    if (!["42883", "PGRST202"].includes(recorded.error.code || "")) throw recorded.error;

    // 移行SQL適用前の互換動作。否定票は不正な列を作らず、移行後から集計する。
    if (result === "not_helpful") return NextResponse.json({ ok: true, recorded: false }, { status: 202, headers: { "Cache-Control": "no-store" } });
    const current = await serverSupabase
      .from("settings")
      .select("id,helpful_count")
      .eq("id", settingId)
      .eq("status", "published")
      .maybeSingle();
    if (current.error) throw current.error;
    if (!current.data) return NextResponse.json({ ok: false }, { status: 404 });

    const nextCount = Math.max(0, Number(current.data.helpful_count) || 0) + 1;
    const updated = await serverSupabase
      .from("settings")
      .update({ helpful_count: nextCount })
      .eq("id", settingId)
      .eq("status", "published")
      .select("helpful_count")
      .maybeSingle();
    if (updated.error) throw updated.error;
    return NextResponse.json({ ok: true, count: Number(updated.data?.helpful_count) || nextCount }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // フィードバックは補助機能。DB未更新の環境でも記事表示を壊さない。
    console.error("[api/feedback] save failed", { message: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
