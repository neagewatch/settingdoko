import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";
import { requireSameOrigin } from "@/lib/request-security";
export async function PATCH(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid request" }, { status: 400 }); }
  const values = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const id = typeof values.id === "string" ? values.id.slice(0, 100) : "";
  const status = values.status;
  if (!id || !["new", "reviewing", "done"].includes(String(status))) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const { error } = await serverSupabase.from("content_reports").update({ status }).eq("id", id);
  return error ? NextResponse.json({ error: "状態を更新できませんでした" }, { status: 500 }) : NextResponse.json({ ok: true });
}
