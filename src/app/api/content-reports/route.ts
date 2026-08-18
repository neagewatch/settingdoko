import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server-supabase";
import { isRateLimited, publicFormIsValid, requireSameOrigin } from "@/lib/request-security";

const attempts = new Map<string, { count: number; resetAt: number }>();
export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "送信先を準備中です" }, { status: 503 });
  if (isRateLimited(attempts, request, 5, 3600000)) return NextResponse.json({ error: "送信回数が上限に達しました。時間をおいてお試しください。" }, { status: 429 });
  try {
    const body = await request.json();
    const settingId = typeof body.settingId === "string" ? body.settingId : "";
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : "";
    if (!publicFormIsValid(comment, body.startedAt, body.website)) return NextResponse.json({ error: "不正な送信です" }, { status: 400 });
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(settingId) || !title || !comment) return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
    const { error } = await serverSupabase.from("content_reports").insert({ setting_id: settingId, title, comment }); if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "送信できませんでした。時間をおいてお試しください。" }, { status: 500 }); }
}
