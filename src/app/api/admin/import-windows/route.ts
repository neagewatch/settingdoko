import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";
import { windowsSettings } from "../../../../../scripts/generate-windows-sql.mjs";
import { requireSameOrigin } from "@/lib/request-security";
import { revalidatePublicSettings } from "@/lib/public-revalidation";

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバーのSupabase権限が未設定です" }, { status: 503 });
  const compatibleSettings = windowsSettings;
  for (let index = 0; index < compatibleSettings.length; index += 25) {
    const { error } = await serverSupabase.from("settings").upsert(compatibleSettings.slice(index, index + 25), { onConflict: "slug,os" });
    if (error) return NextResponse.json({ error: "Windows記事を投入できませんでした" }, { status: 500 });
  }
  revalidatePublicSettings();
  return NextResponse.json({ ok: true, count: windowsSettings.length });
}
