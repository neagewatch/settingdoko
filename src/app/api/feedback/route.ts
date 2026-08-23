import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server-supabase";
import { isRateLimited, requireSameOrigin } from "@/lib/request-security";

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
  if (!UUID_PATTERN.test(settingId) || result !== "helpful") return NextResponse.json({ ok: false }, { status: 400 });

  try {
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
