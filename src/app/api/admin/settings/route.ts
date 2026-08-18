import { NextResponse } from "next/server";
import { getAllSettings, DataAccessError } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const settings = await getAllSettings(true);
    return NextResponse.json(
      { ok: true, settings, total: settings.length },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof DataAccessError ? error.message : "管理用データを取得できませんでした";
    console.error("[api/admin/settings] read failed", error);
    return NextResponse.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
