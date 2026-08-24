import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, getStoredSourceHealth } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auditSettingsQuality } from "@/lib/quality-audit";
import { buildContentInventory, editorialReviewRows } from "@/lib/content-operations";
import { detectDuplicateGroups } from "@/lib/duplicate-detection";

export const dynamic = "force-dynamic";

function csvValue(value: unknown): string {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(","))].join("\n") + "\n";
}

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const [settings, storedSourceHealth] = await Promise.all([getAllSettings(true), getStoredSourceHealth()]);
    const sourceHealth = new Map([...storedSourceHealth].map(([sourceUrl, status]) => [sourceUrl, {
      sourceUrl, status, checkedAt: "",
    }] as const));
    const audit = auditSettingsQuality(settings, Date.now(), sourceHealth);
    const duplicateGroups = detectDuplicateGroups(settings);
    const duplicateIds = new Set(duplicateGroups.flatMap((group) => group.items.map((item) => item.id)));
    const { inventory, evaluations } = buildContentInventory(settings, { duplicateIds, sourceHealth });
    if (request.nextUrl.searchParams.get("format") === "csv") {
      return new NextResponse(csv(editorialReviewRows(settings, evaluations)), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="settingdoko-content-inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "private, no-store",
        },
      });
    }
    return NextResponse.json({
      ok: true,
      totalArticles: settings.length,
      totalIssues: audit.items.length,
      counts: audit.counts,
      issueCounts: audit.issueCounts,
      inventory,
      duplicateGroups: duplicateGroups.length,
      items: audit.items,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/quality] read failed", error);
    return NextResponse.json({ error: "低品質記事を確認できませんでした" }, { status: 500 });
  }
}
