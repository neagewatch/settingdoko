import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revalidatePublicSettings } from "@/lib/public-revalidation";
import { requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import type { Setting } from "@/lib/types";
import { allAdditional } from "../../../../../scripts/generate-all-additional-sql.mjs";
import { appleSettings } from "../../../../../scripts/generate-apple-sql.mjs";
import { windowsSettings } from "../../../../../scripts/generate-windows-sql.mjs";
import { allSampleSettings } from "@/lib/sample-data-export";
import { primarySettings } from "@/lib/primary-data";
import { microsoft365Settings } from "../../../../../scripts/microsoft365-data.mjs";
import { microsoft365Wave2Settings } from "../../../../../scripts/microsoft365-wave2-data.mjs";
import { officialSettings } from "../../../../../scripts/official-settings-data.mjs";
import { bulkSettings } from "../../../../../scripts/official-settings-bulk-data.mjs";
import { extraWindowsSettings } from "../../../../../scripts/windows11-expansion-data.mjs";
import { troubleshootingSettings } from "../../../../../scripts/troubleshooting-data.mjs";
import { troubleshootingWave5Settings } from "../../../../../scripts/troubleshooting-wave5-data.mjs";
import { troubleshootingWave6Settings } from "../../../../../scripts/troubleshooting-wave6-data.mjs";
import { troubleshootingWave7Settings } from "../../../../../scripts/troubleshooting-wave7-data.mjs";
import { troubleshootingBulkSettings } from "../../../../../scripts/troubleshooting-bulk-data.mjs";
import { troubleshootingExpansionSettings } from "../../../../../scripts/troubleshooting-expansion-data.mjs";
import { troubleshootingFocusedSettings } from "../../../../../scripts/troubleshooting-focused-data.mjs";
import { errorCodeDeepSettings } from "../../../../../scripts/error-code-deep-data.mjs";
import { troubleshootingHighDemandSettings } from "../../../../../scripts/troubleshooting-high-demand-data.mjs";
import { troubleshootingUniqueSettings } from "../../../../../scripts/troubleshooting-unique-data.mjs";
import { consolidateCandidates } from "../../../../../scripts/consolidate-candidates.mjs";
import { wave3Settings } from "../../../../../scripts/official-settings-wave3-data.mjs";
import { wave4Settings } from "../../../../../scripts/official-settings-wave4-data.mjs";

type Candidate = Omit<Setting, "id" | "updated_at">;
type ImportScope = "all" | "troubleshoot" | "troubleshootUnique";
type ImportMode = "new" | "draft";

// 本番DBには旧来の「slugだけ」の一意制約が残っているため、
// 同期判定もDBの最も厳しい制約に合わせてslug単位で行う。
function key(item: Pick<Candidate, "slug">) {
  return item.slug;
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

const rawCandidates = [
  ...microsoft365Settings,
  ...microsoft365Wave2Settings,
  ...allSampleSettings,
  ...primarySettings,
  ...windowsSettings,
  ...allAdditional,
  ...appleSettings,
  ...officialSettings,
  ...bulkSettings,
  ...extraWindowsSettings,
  ...troubleshootingSettings,
  ...troubleshootingWave5Settings,
  ...troubleshootingWave6Settings,
  ...troubleshootingWave7Settings,
  ...troubleshootingBulkSettings,
  ...troubleshootingExpansionSettings,
  ...troubleshootingFocusedSettings,
  ...errorCodeDeepSettings,
  ...troubleshootingHighDemandSettings,
  ...troubleshootingUniqueSettings,
  ...wave3Settings,
  ...wave4Settings,
] as Candidate[];
// 発生場面だけが異なる自動生成候補は、1テーマ1ページにまとめて取り込む。
const candidates = [...new Map(consolidateCandidates(rawCandidates).map((item) => [key(item), item])).values()];
// トラブル専用同期は、旧パックだけでなく全候補のcategoryも対象にする。
const troubleshootingCandidates = candidates.filter((item) => item.category === "troubleshoot");
const uniqueTroubleshootingCandidates = candidates.filter((item) => item.slug.startsWith("trouble13-unique-"));

function summary(items: Candidate[]) {
  const byOS: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byOS[item.os] = (byOS[item.os] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  }
  return { total: items.length, byOS, byCategory };
}

function candidatesForScope(scope: ImportScope) {
  if (scope === "troubleshoot") return troubleshootingCandidates;
  if (scope === "troubleshootUnique") return uniqueTroubleshootingCandidates;
  return candidates;
}

function databaseErrorDetail(error: unknown) {
  if (!error || typeof error !== "object") return "原因を取得できませんでした";
  const value = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
  const parts = [
    typeof value.code === "string" ? `code=${value.code}` : "",
    typeof value.message === "string" && value.message ? value.message : "",
    typeof value.details === "string" && value.details ? value.details : "",
  ].filter(Boolean);
  return parts.join(" / ") || "原因を取得できませんでした";
}

function draftRow(candidate: Candidate) {
  const {
    title, slug, os, version, category, aliases, path, steps,
    related_slugs, keywords, description, difficulty, estimate_minutes,
    screenshot_url, verified_at, editor_note, source_url, device_scope,
    impact, rollback, caution, review_due_at,
  } = candidate;

  return {
    title, slug, os, version, category, aliases, path, steps,
    related_slugs, keywords, description, difficulty, estimate_minutes,
    screenshot_url, verified_at, editor_note, source_url, device_scope,
    impact, rollback, caution, review_due_at,
    status: "draft" as const,
    published_at: null,
  };
}

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    ...summary(candidates),
    packs: {
      all: summary(candidates),
      troubleshoot: summary(troubleshootingCandidates),
      troubleshootUnique: summary(uniqueTroubleshootingCandidates),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバーのSupabase権限が未設定です" }, { status: 503 });

  let scope: ImportScope = "all";
  let mode: ImportMode = "new";
  try {
    const body = await request.json();
    if (body && typeof body === "object" && "scope" in body) {
      const requestedScope = (body as { scope?: unknown }).scope;
      if (requestedScope !== "all" && requestedScope !== "troubleshoot") {
        return NextResponse.json({ error: "取り込み対象を確認してください" }, { status: 400 });
      }
      scope = requestedScope;
    }
    if (body && typeof body === "object" && "mode" in body) {
      const requestedMode = (body as { mode?: unknown }).mode;
      if (requestedMode !== "new" && requestedMode !== "draft") {
        return NextResponse.json({ error: "保存方法を確認してください" }, { status: 400 });
      }
      mode = requestedMode;
    }
  } catch {
    // 本文がない場合は、従来どおり全候補を対象にする。
  }

  const scopedCandidates = candidatesForScope(scope);

  const existingByKey = new Map<string, { id: string; status: "draft" | "published" }>();
  for (const slugChunk of chunks([...new Set(scopedCandidates.map((item) => item.slug))], 100)) {
    const { data, error } = await serverSupabase.from("settings").select("id,slug,os,status").in("slug", slugChunk);
    if (error) {
      console.error("[api/admin/import-drafts] existing rows query failed", { detail: databaseErrorDetail(error) });
      return NextResponse.json({ error: "既存記事を確認できませんでした", detail: databaseErrorDetail(error) }, { status: 500 });
    }
    for (const item of data || []) {
      if (typeof item.id !== "string") continue;
      // 旧データでstatusが空でも、同じslugの記事は既存記事として扱う。
      // これを新規INSERTすると、DBのユニーク制約で全体が失敗するため。
      existingByKey.set(key(item as Pick<Candidate, "slug" | "os">), {
        id: item.id,
        status: item.status === "draft" ? "draft" : "published",
      });
    }
  }

  const newCandidates = scopedCandidates.filter((item) => !existingByKey.has(key(item)));
  // 大量候補でも管理画面の一括取り込みがタイムアウトしにくいよう、100件単位で保存する。
  // 失敗時は既に保存済みのslugを次回にスキップできるため、再実行しても重複しない。
  for (const batch of chunks(newCandidates.map(draftRow), 100)) {
    const { error } = await serverSupabase.from("settings").insert(batch);
    if (error) {
      console.error("[api/admin/import-drafts] draft insert failed", {
        count: batch.length,
        firstSlug: batch[0]?.slug,
        detail: databaseErrorDetail(error),
      });
      return NextResponse.json({
        error: "下書きを保存できませんでした",
        detail: databaseErrorDetail(error),
      }, { status: 500 });
    }
  }

  const existingPublishedIds = scopedCandidates
    .map((item) => existingByKey.get(key(item)))
    .filter((item): item is { id: string; status: "draft" | "published" } => !!item && item.status === "published")
    .map((item) => item.id);
  let demoted = 0;
  if (mode === "draft") {
    for (const idChunk of chunks(existingPublishedIds, 100)) {
      const { data, error } = await serverSupabase
        .from("settings")
        .update({ status: "draft", published_at: null })
        .in("id", idChunk)
        .select("id");
      if (error) {
        console.error("[api/admin/import-drafts] existing rows update failed", { count: idChunk.length, detail: databaseErrorDetail(error) });
        return NextResponse.json({ error: "既存記事を下書きに変更できませんでした", detail: databaseErrorDetail(error) }, { status: 500 });
      }
      demoted += data?.length || 0;
    }
  }

  revalidatePublicSettings();
  return NextResponse.json({
    ok: true,
    scope,
    mode,
    total: scopedCandidates.length,
    inserted: newCandidates.length,
    demoted,
    existingDraft: scopedCandidates.length - newCandidates.length - existingPublishedIds.length,
    existingPublished: existingPublishedIds.length,
    skipped: scopedCandidates.length - newCandidates.length,
    status: "draft",
  }, { headers: { "Cache-Control": "no-store" } });
}
