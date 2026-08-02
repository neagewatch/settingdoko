import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";

export async function PATCH(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });
  const { id, status } = await request.json();
  if (!id || !["new", "reviewing", "done"].includes(status)) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const { error } = await serverSupabase.from("content_requests").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
