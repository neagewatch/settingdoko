import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, getStoredSourceHealth } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auditSettingsQuality } from "@/lib/quality-audit";
import { buildContentInventory, buildNearIndexableQueue, buildReverificationQueue, editorialReviewRows } from "@/lib/content-operations";
import { detectDuplicateGroups, detectSearchIntentCandidates, isStrongDuplicateGroup, selectIntentAliasConsolidation } from "@/lib/duplicate-detection";

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
    const sourceHealth = storedSourceHealth;
    const audit = auditSettingsQuality(settings, Date.now(), sourceHealth);
    const duplicateGroups = detectDuplicateGroups(settings);
    const strongDuplicateGroups = duplicateGroups.filter((group) => isStrongDuplicateGroup(group));
    const duplicateIds = new Set(strongDuplicateGroups.flatMap((group) => group.items.map((item) => item.id)));
    const intentGroups = detectSearchIntentCandidates(settings);
    const intentDuplicateIds = new Set(intentGroups.flatMap((group) => group.items.map((item) => item.id)));
    const intentAlias = selectIntentAliasConsolidation(settings, intentGroups);
    const { inventory, evaluations } = buildContentInventory(settings, { duplicateIds, aliasDuplicateIds: intentAlias.aliasDuplicateIds, intentDuplicateIds, sourceHealth });
    const nearIndexable = buildNearIndexableQueue(settings, evaluations);
    const reverification = buildReverificationQueue(settings, sourceHealth);
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
      searchIntentGroups: intentGroups.length,
      queues: {
        nearIndexable: nearIndexable.length,
        brokenSource: inventory.brokenSourceCandidates,
        duplicateIntent: intentGroups.length,
        aliasConsolidation: intentAlias.aliasGroups.length,
        safeAliasConsolidation: intentAlias.safeAliasGroups.length,
        reverificationHigh: reverification.filter((item) => item.status === "HIGH_PRIORITY_REVIEW").length,
        negativeFeedback: reverification.filter((item) => item.reasons.some((reason) => reason.startsWith("否定票"))).length,
      },
      items: audit.items,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/quality] read failed", error);
    return NextResponse.json({ error: "低品質記事を確認できませんでした" }, { status: 500 });
  }
}
