import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";
import { primarySettings } from "@/lib/primary-data";
import { requireSameOrigin } from "@/lib/request-security";
import { revalidatePublicSettings } from "@/lib/public-revalidation";

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバーのSupabase権限が未設定です" }, { status: 503 });

  for (let index = 0; index < primarySettings.length; index += 25) {
    const { error } = await serverSupabase
      .from("settings")
      .upsert(primarySettings.slice(index, index + 25), { onConflict: "slug,os" });
    if (error) return NextResponse.json({ error: "主対象記事を投入できませんでした" }, { status: 500 });
  }

  revalidatePublicSettings();
  return NextResponse.json({ ok: true, count: primarySettings.length });
}
