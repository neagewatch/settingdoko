import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";
export async function PATCH(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, status } = await request.json(); if (!id || !["new", "reviewing", "done"].includes(status) || !serverSupabase) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const { error } = await serverSupabase.from("content_reports").update({ status }).eq("id", id); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
