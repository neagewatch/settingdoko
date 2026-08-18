import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllSettings } from "@/lib/data";
import { requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import { revalidatePublicSettings } from "@/lib/public-revalidation";
import {
  getConsolidationGroups,
  mergeConsolidationGroup,
} from "../../../../../scripts/consolidate-candidates.mjs";

const UPDATE_COLUMNS = [
  "title", "slug", "os", "version", "category", "aliases", "path", "steps",
  "related_slugs", "keywords", "description", "difficulty", "estimate_minutes",
  "screenshot_url", "verified_at", "editor_note", "source_url", "device_scope",
  "impact", "rollback", "caution", "review_due_at",
];

type ConsolidationRow = {
  id: string;
  slug: string;
  title: string;
  status?: string | null;
  [key: string]: unknown;
};

function isConsolidationRow(item: unknown): item is ConsolidationRow {
  if (!item || typeof item !== "object") return false;
  const value = item as Record<string, unknown>;
  return typeof value.id === "string" && typeof value.slug === "string" && typeof value.title === "string";
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function loadRows() {
  const settings = await getAllSettings(true);
  return settings
    .filter((setting) => setting.category === "troubleshoot" && isConsolidationRow(setting))
    .map((setting) => setting as unknown as ConsolidationRow);
}

function getReport(rows: ConsolidationRow[]) {
  const groups = getConsolidationGroups(rows) as Array<{ key: string; items: ConsolidationRow[] }>;
  const mergeable = groups.filter((group) => group.items.every((item) => item.status === "draft"));
  const skippedPublished = groups.filter((group) => !group.items.every((item) => item.status === "draft")).length;
  const duplicateDraftRows = mergeable.reduce((sum, group) => sum + group.items.length - 1, 0);
  return {
    before: rows.length,
    groups: groups.length,
    mergeableGroups: mergeable.length,
    skippedPublished,
    duplicateDraftRows,
    after: rows.length - duplicateDraftRows,
  };
}

function mergedPayload(item: ConsolidationRow) {
  return Object.fromEntries(
    UPDATE_COLUMNS
      .filter((column) => item[column] !== undefined)
      .map((column) => [column, item[column]]),
  );
}

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });
  try {
    const rows = await loadRows();
    return NextResponse.json({ ok: true, ...getReport(rows) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/consolidate-troubleshooting] read failed", error);
    return NextResponse.json({ error: "統合候補を確認できませんでした" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });

  let execute = false;
  try {
    const body = await request.json();
    execute = Boolean(body && typeof body === "object" && "execute" in body && (body as { execute?: unknown }).execute === true);
  } catch {
    // 本文なしは確認だけにする。
  }

  try {
    const rows = await loadRows();
    const groups = getConsolidationGroups(rows) as Array<{ key: string; items: ConsolidationRow[] }>;
    const mergeable = groups.filter((group) => group.items.every((item) => item.status === "draft"));
    if (!execute) return NextResponse.json({ ok: true, dryRun: true, ...getReport(rows) });

    let mergedGroups = 0;
    let deletedRows = 0;
    for (const group of mergeable) {
      const keeper = group.items.find((item) => item.slug === group.key) || group.items[0];
      const merged = mergeConsolidationGroup(group.items) as ConsolidationRow;
      const payload = {
        ...mergedPayload(merged),
        status: "draft",
        published_at: null,
      };
      const { error: updateError } = await serverSupabase
        .from("settings")
        .update(payload)
        .eq("id", keeper.id);
      if (updateError) {
        return NextResponse.json({
          error: "統合途中で更新に失敗しました",
          detail: updateError.message,
          mergedGroups,
          deletedRows,
        }, { status: 500 });
      }

      const duplicateIds = group.items.filter((item) => item.id !== keeper.id).map((item) => item.id);
      for (const idChunk of chunks(duplicateIds, 100)) {
        const { error: deleteError } = await serverSupabase.from("settings").delete().in("id", idChunk);
        if (deleteError) {
          return NextResponse.json({
            error: "統合途中で重複候補の削除に失敗しました",
            detail: deleteError.message,
            mergedGroups,
            deletedRows,
          }, { status: 500 });
        }
        deletedRows += idChunk.length;
      }
      mergedGroups += 1;
    }

    revalidatePublicSettings();
    return NextResponse.json({
      ok: true,
      dryRun: false,
      mergedGroups,
      deletedRows,
      skippedPublished: groups.length - mergeable.length,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/consolidate-troubleshooting] execute failed", error);
    return NextResponse.json({ error: "類似候補を統合できませんでした" }, { status: 500 });
  }
}
