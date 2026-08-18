import { NextRequest, NextResponse } from "next/server";
import { getAllSettings } from "@/lib/data";
import { canonicalSlug, detectDuplicateGroups, isStrongDuplicateGroup } from "@/lib/duplicate-detection";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import { revalidatePublicSettings } from "@/lib/public-revalidation";
import type { Setting } from "@/lib/types";

export const dynamic = "force-dynamic";

const DELETE_CHUNK_SIZE = 100;
const MAX_DELETE_ITEMS = 500;
const AUTO_MERGE_DELETE_CHUNK_SIZE = 100;
const MAX_AUTO_MERGE_DELETE_ITEMS = 5000;

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function isValidSettingId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 100;
}

function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim()))];
}

function chooseKeeper(items: Setting[]): Setting {
  return [...items].sort((left, right) => {
    const leftCanonical = canonicalSlug(left.slug) === left.slug ? 1 : 0;
    const rightCanonical = canonicalSlug(right.slug) === right.slug ? 1 : 0;
    if (leftCanonical !== rightCanonical) return rightCanonical - leftCanonical;

    const leftPublished = left.status === "published" ? 1 : 0;
    const rightPublished = right.status === "published" ? 1 : 0;
    if (leftPublished !== rightPublished) return rightPublished - leftPublished;

    const updatedDiff = new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    if (updatedDiff !== 0) return updatedDiff;
    return left.slug.localeCompare(right.slug);
  })[0];
}

type MergePlan = {
  group: ReturnType<typeof detectDuplicateGroups>[number];
  items: Setting[];
  keeper: Setting;
  duplicateIds: string[];
};

function getMergePlans(settings: Setting[]): MergePlan[] {
  const byId = new Map(settings.map((setting) => [setting.id, setting]));
  return detectDuplicateGroups(settings)
    .filter(isStrongDuplicateGroup)
    .map((group) => {
      const items = group.items.map((item) => byId.get(item.id)).filter((item): item is Setting => Boolean(item));
      const keeper = chooseKeeper(items);
      return {
        group,
        items,
        keeper,
        duplicateIds: items.filter((item) => item.id !== keeper.id).map((item) => item.id),
      };
    })
    .filter((plan) => plan.items.length >= 2 && plan.duplicateIds.length > 0);
}

function getReport(settings: Setting[], groups = detectDuplicateGroups(settings)) {
  const mergeableGroups = groups.filter(isStrongDuplicateGroup);
  return {
    totalArticles: settings.length,
    totalGroups: groups.length,
    autoMergeGroups: mergeableGroups.length,
    autoDeleteItems: mergeableGroups.reduce((sum, group) => sum + group.items.length - 1, 0),
    reviewGroups: groups.length - mergeableGroups.length,
  };
}

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const settings = await getAllSettings(true);
    const groups = detectDuplicateGroups(settings);
    return NextResponse.json({
      ok: true,
      ...getReport(settings, groups),
      groups,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/duplicates] read failed", error);
    return NextResponse.json({ error: "重複候補を確認できませんでした" }, { status: 500 });
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
    execute = Boolean(body && typeof body === "object" && (body as { execute?: unknown }).execute === true);
  } catch {
    // 本文なしは確認だけにする。
  }

  try {
    const settings = await getAllSettings(true);
    const groups = detectDuplicateGroups(settings);
    const report = getReport(settings, groups);
    if (!execute) return NextResponse.json({ ok: true, dryRun: true, ...report });
    if (report.autoDeleteItems > MAX_AUTO_MERGE_DELETE_ITEMS) {
      return NextResponse.json({ error: `一度に整理できる重複記事は${MAX_AUTO_MERGE_DELETE_ITEMS}件までです。先に候補を確認してください`, ...report }, { status: 409 });
    }

    const plans = getMergePlans(settings);
    const duplicateIds = [...new Set(plans.flatMap((plan) => plan.duplicateIds))];
    const duplicateIdSet = new Set(duplicateIds);
    const updates = new Map<string, Record<string, unknown>>();
    const replacements = new Map<string, string>();
    const keeperIds = new Set<string>();

    for (const plan of plans) {
      keeperIds.add(plan.keeper.id);
      for (const item of plan.items) {
        if (item.id !== plan.keeper.id) replacements.set(item.slug, plan.keeper.slug);
      }
    }

    for (const plan of plans) {
      const publishedItems = plan.items
        .filter((item) => item.status === "published")
        .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
      const mergedRelatedSlugs = uniqueStrings(
        plan.items.flatMap((item) => item.related_slugs).map((slug) => replacements.get(slug) || slug),
      ).filter((slug) => slug !== plan.keeper.slug);
      const publishedAt = publishedItems[0]?.published_at || new Date().toISOString();
      updates.set(plan.keeper.id, {
        aliases: uniqueStrings(plan.items.flatMap((item) => item.aliases)),
        keywords: uniqueStrings(plan.items.flatMap((item) => item.keywords)),
        related_slugs: mergedRelatedSlugs,
        status: publishedItems.length > 0 ? "published" : "draft",
        published_at: publishedItems.length > 0 ? publishedAt : null,
      });
    }

    // 他の記事から削除対象への関連リンクが残らないよう、keeperへ付け替える。
    for (const setting of settings) {
      if (duplicateIdSet.has(setting.id) || keeperIds.has(setting.id)) continue;
      const relatedSlugs = uniqueStrings(setting.related_slugs.map((slug) => replacements.get(slug) || slug));
      if (relatedSlugs.join("\u0000") !== setting.related_slugs.join("\u0000")) {
        updates.set(setting.id, { related_slugs: relatedSlugs });
      }
    }

    let updatedRows = 0;
    for (const [id, payload] of updates.entries()) {
      const { error } = await serverSupabase.from("settings").update(payload).eq("id", id);
      if (error) throw error;
      updatedRows += 1;
    }

    let deletedRows = 0;
    for (const idChunk of chunks(duplicateIds, AUTO_MERGE_DELETE_CHUNK_SIZE)) {
      const { data, error } = await serverSupabase
        .from("settings")
        .delete()
        .in("id", idChunk)
        .select("id");
      if (error) throw error;
      deletedRows += data?.length || 0;
    }

    revalidatePublicSettings();
    return NextResponse.json({
      ok: true,
      dryRun: false,
      mergedGroups: plans.length,
      updatedRows,
      deletedRows,
      reviewGroups: report.reviewGroups,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/duplicates] auto merge failed", error);
    return NextResponse.json({ error: "重複記事を一括整理できませんでした" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });

  const values = body as { ids?: unknown; confirmPublished?: unknown };
  const ids = Array.isArray(values.ids)
    ? [...new Set(values.ids.filter(isValidSettingId))]
    : [];
  if (ids.length === 0 || ids.length > MAX_DELETE_ITEMS) {
    return NextResponse.json({ error: `削除対象は1〜${MAX_DELETE_ITEMS}件で指定してください` }, { status: 400 });
  }

  try {
    const { data, error } = await serverSupabase
      .from("settings")
      .select("id,title,status")
      .in("id", ids);
    if (error) throw error;

    const rows = (data || []) as Array<{ id: string; title?: string | null; status?: string | null }>;
    const publishedIds = rows.filter((row) => row.status !== "draft").map((row) => row.id);
    if (publishedIds.length > 0 && values.confirmPublished !== true) {
      return NextResponse.json({
        error: "公開記事が含まれています。削除する場合はもう一度確認してください",
        publishedIds,
      }, { status: 409 });
    }

    let deleted = 0;
    for (const idChunk of chunks(ids, DELETE_CHUNK_SIZE)) {
      const { data: deletedRows, error: deleteError } = await serverSupabase
        .from("settings")
        .delete()
        .in("id", idChunk)
        .select("id");
      if (deleteError) throw deleteError;
      deleted += deletedRows?.length || 0;
    }

    revalidatePublicSettings();
    return NextResponse.json({ ok: true, deleted }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/duplicates] delete failed", error);
    return NextResponse.json({ error: "重複候補を削除できませんでした" }, { status: 500 });
  }
}
