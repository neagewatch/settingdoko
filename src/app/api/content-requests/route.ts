import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "送信先を準備中です" }, { status: 503 });
  try {
    const forwarded = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwarded.split(",")[0].trim();
    const now = Date.now();
    const current = requestCounts.get(ip);
    const rate = !current || current.resetAt < now ? { count: 0, resetAt: now + 60 * 60 * 1000 } : current;
    if (rate.count >= 3) return NextResponse.json({ error: "送信回数が上限に達しました。時間をおいてお試しください。" }, { status: 429 });
    const { query, os, note } = await request.json();
    const cleanQuery = typeof query === "string" ? query.trim().slice(0, 120) : "";
    const cleanNote = typeof note === "string" ? note.trim().slice(0, 500) : "";
    if (!cleanQuery) return NextResponse.json({ error: "探している内容を入力してください" }, { status: 400 });
    const { error } = await supabase.from("content_requests").insert({ query: cleanQuery, os: typeof os === "string" ? os : null, note: cleanNote || null });
    if (error) throw error;
    requestCounts.set(ip, { ...rate, count: rate.count + 1 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "送信できませんでした。時間をおいてお試しください。" }, { status: 500 });
  }
}
