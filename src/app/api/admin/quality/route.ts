import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auditSettingsQuality } from "@/lib/quality-audit";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const settings = await getAllSettings(true);
    const audit = auditSettingsQuality(settings);
    return NextResponse.json({
      ok: true,
      totalArticles: settings.length,
      totalIssues: audit.items.length,
      counts: audit.counts,
      issueCounts: audit.issueCounts,
      items: audit.items,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/quality] read failed", error);
    return NextResponse.json({ error: "低品質記事を確認できませんでした" }, { status: 500 });
  }
}
