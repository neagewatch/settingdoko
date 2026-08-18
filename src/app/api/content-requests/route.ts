import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server-supabase";
import { isOSType } from "@/lib/types";
import { isRateLimited, publicFormIsValid, requireSameOrigin } from "@/lib/request-security";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "送信先を準備中です" }, { status: 503 });
  try {
    if (isRateLimited(requestCounts, request, 3, 60 * 60 * 1000)) return NextResponse.json({ error: "送信回数が上限に達しました。時間をおいてお試しください。" }, { status: 429 });
    const body = await request.json();
    const { query, os, note, startedAt, website } = body || {};
    if (!publicFormIsValid(query, startedAt, website)) return NextResponse.json({ error: "不正な送信です" }, { status: 400 });
    const cleanQuery = typeof query === "string" ? query.trim().slice(0, 120) : "";
    const cleanNote = typeof note === "string" ? note.trim().slice(0, 500) : "";
    if (!cleanQuery) return NextResponse.json({ error: "探している内容を入力してください" }, { status: 400 });
    const { error } = await serverSupabase.from("content_requests").insert({ query: cleanQuery, os: typeof os === "string" && isOSType(os) ? os : null, note: cleanNote || null });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "送信できませんでした。時間をおいてお試しください。" }, { status: 500 });
  }
}
