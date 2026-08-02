import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const attempts = new Map<string, { count: number; resetAt: number }>();
export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "送信先を準備中です" }, { status: 503 });
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim(); const now = Date.now();
  const rate = attempts.get(ip) && attempts.get(ip)!.resetAt > now ? attempts.get(ip)! : { count: 0, resetAt: now + 3600000 };
  if (rate.count >= 5) return NextResponse.json({ error: "送信回数が上限に達しました。時間をおいてお試しください。" }, { status: 429 });
  try {
    const body = await request.json(); const settingId = typeof body.settingId === "string" ? body.settingId : ""; const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : ""; const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : "";
    if (!settingId || !title || !comment) return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
    const { error } = await supabase.from("content_reports").insert({ setting_id: settingId, title, comment }); if (error) throw error;
    attempts.set(ip, { ...rate, count: rate.count + 1 }); return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "送信できませんでした。時間をおいてお試しください。" }, { status: 500 }); }
}
