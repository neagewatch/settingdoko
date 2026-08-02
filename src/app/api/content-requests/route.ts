import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "送信先を準備中です" }, { status: 503 });
  try {
    const { query, os, note } = await request.json();
    const cleanQuery = typeof query === "string" ? query.trim().slice(0, 120) : "";
    const cleanNote = typeof note === "string" ? note.trim().slice(0, 500) : "";
    if (!cleanQuery) return NextResponse.json({ error: "探している内容を入力してください" }, { status: 400 });
    const { error } = await supabase.from("content_requests").insert({ query: cleanQuery, os: typeof os === "string" ? os : null, note: cleanNote || null });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "送信できませんでした。時間をおいてお試しください。" }, { status: 500 });
  }
}
