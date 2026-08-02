import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";
import { allAdditional } from "../../../../../scripts/generate-all-additional-sql.mjs";

export async function POST() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!serverSupabase) return NextResponse.json({ error: "サーバーのSupabase権限が未設定です" }, { status: 503 });
  const compatibleSettings = allAdditional.map(({ estimate_minutes, ...setting }) => setting);
  for (let index = 0; index < compatibleSettings.length; index += 25) {
    const { error } = await serverSupabase.from("settings").upsert(compatibleSettings.slice(index, index + 25), { onConflict: "slug,os" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: allAdditional.length });
}
