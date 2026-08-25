import fs from "node:fs";
import path from "node:path";
import { auditSettingsQuality } from "../src/lib/quality-audit";
import {
  buildContentInventory,
  buildNearIndexableQueue,
  buildReverificationQueue,
  editorialReviewRows,
  inferContentType,
  type SourceHealth,
  type SourceStatusClass,
} from "../src/lib/content-operations";
import { canonicalSlug, detectDuplicateGroups, detectSearchIntentCandidates, isStrongDuplicateGroup, selectIntentAliasConsolidation } from "../src/lib/duplicate-detection";
import { analyzeSearchDemand, toAcquisitionBacklog, type SearchLogRecord } from "../src/lib/search-demand";
import { assessSource } from "../src/lib/source-quality";
import type { Setting } from "../src/lib/types";

type Options = { input: string; sourceHealth?: string; searchLogs?: string; outDir: string; repairBatch: number };

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { outDir: ".content-operations", repairBatch: 75 };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") options.input = argv[++index];
    else if (value === "--source-health") options.sourceHealth = argv[++index];
    else if (value === "--search-logs") options.searchLogs = argv[++index];
    else if (value === "--out-dir") options.outDir = argv[++index];
    else if (value === "--repair-batch") options.repairBatch = Math.max(50, Math.min(100, Number(argv[++index])));
    else throw new Error(`不明な引数です: ${value}`);
  }
  if (!options.input) throw new Error("--input <settings.json> が必要です");
  return options as Options;
}

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(filename, "utf8")) as T;
}

function csvValue(value: unknown): string {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(","))].join("\n") + "\n";
}

function coverageRows(settings: Setting[], evaluations: ReturnType<typeof buildContentInventory>["evaluations"]) {
  const byId = new Map(evaluations.map((item) => [item.id, item]));
  const groups = new Map<string, { os: string; category: string; content_type: string; total: number; published: number; verified: number; source_backed: number; indexable: number; noindex: number }>();
  for (const setting of settings) {
    const evaluation = byId.get(setting.id);
    if (!evaluation) continue;
    const key = `${setting.os}\u0000${setting.category}\u0000${evaluation.contentType}`;
    const row = groups.get(key) || {
      os: setting.os,
      category: setting.category,
      content_type: evaluation.contentType,
      total: 0,
      published: 0,
      verified: 0,
      source_backed: 0,
      indexable: 0,
      noindex: 0,
    };
    row.total += 1;
    if (setting.status !== "draft") row.published += 1;
    if (setting.verified_at) row.verified += 1;
    if (setting.source_url) row.source_backed += 1;
    if (evaluation.indexable) row.indexable += 1;
    else if (setting.status !== "draft") row.noindex += 1;
    groups.set(key, row);
  }
  return [...groups.values()].sort((left, right) => left.os.localeCompare(right.os) || left.category.localeCompare(right.category) || left.content_type.localeCompare(right.content_type));
}

function classifyIntentGroups(settings: Setting[], groups: ReturnType<typeof detectSearchIntentCandidates>) {
  const byId = new Map(settings.map((setting) => [setting.id, setting]));
  return groups.map((group) => {
    const items = group.items.map((item) => byId.get(item.id)).filter((item): item is Setting => Boolean(item));
    const types = new Set(items.map((item) => inferContentType(item)));
    const versions = new Set(items.map((item) => item.version.trim()).filter(Boolean));
    const classification = types.size > 1
      ? "D_TROUBLESHOOTING_VS_SETTING"
      : versions.size > 1
        ? "E_VERSION_OR_SCOPE_VARIANT"
        : group.reasons.includes("same-intent")
          ? "C_ADD_ALIAS_TO_CANONICAL"
          : "F_MANUAL_FALSE_POSITIVE_REVIEW";
    const canonical = [...items].sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at) || left.title.length - right.title.length)[0];
    return {
      group_id: group.id,
      classification,
      reasons: group.reasons.join("|"),
      canonical_slug_candidate: canonical?.slug || "",
      canonical_title_candidate: canonical?.title || "",
      members: items.map((item) => `${item.os}:${item.slug}`).join("|"),
    };
  });
}

function normalizeSettings(value: unknown): Setting[] {
  if (!Array.isArray(value)) throw new Error("入力JSONは記事配列である必要があります");
  return value.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`記事${index + 1}がオブジェクトではありません`);
    const setting = item as Setting;
    return {
      ...setting,
      id: typeof setting.id === "string" ? setting.id : `input-${index.toString().padStart(5, "0")}`,
      aliases: Array.isArray(setting.aliases) ? setting.aliases : [],
      path: Array.isArray(setting.path) ? setting.path : [],
      steps: Array.isArray(setting.steps) ? setting.steps : [],
      related_slugs: Array.isArray(setting.related_slugs) ? setting.related_slugs : [],
      keywords: Array.isArray(setting.keywords) ? setting.keywords : [],
      updated_at: typeof setting.updated_at === "string" ? setting.updated_at : "1970-01-01T00:00:00.000Z",
      status: setting.status === "draft" ? "draft" : "published",
    };
  });
}

function loadHealth(filename?: string): Map<string, SourceHealth> {
  const result = new Map<string, SourceHealth>();
  if (!filename) return result;
  const rows = readJson<unknown>(filename);
  if (!Array.isArray(rows)) throw new Error("source health JSONは配列である必要があります");
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Partial<SourceHealth>;
    if (typeof item.sourceUrl !== "string" || typeof item.status !== "string") continue;
    result.set(item.sourceUrl, item as SourceHealth);
  }
  return result;
}

function sourceStatusClass(setting: Setting, health: SourceHealth | undefined): SourceStatusClass | "MISSING" {
  if (!setting.source_url) return "MISSING";
  const initial = assessSource(setting.source_url);
  const final = health?.finalUrl ? assessSource(health.finalUrl) : undefined;
  if (health?.statusClass) return health.statusClass;
  if (initial.generic || final?.generic) return "GENERIC_HOME";
  if (health?.status === "redirect") {
    if (!final?.secure || !final.authoritative) return "WRONG_DOCUMENT";
    return "VALID_REDIRECT";
  }
  if (health?.status === "broken" || health?.status === "invalid") return "BROKEN";
  if (health?.status === "blocked") return "BLOCKED";
  if (health?.status === "ok") return "OK";
  return "UNKNOWN";
}

function sourceAction(setting: Setting, health: SourceHealth | undefined): string {
  if (!setting.source_url) return "公式情報源を付けて対象版で検証";
  if (health?.status === "broken" || health?.status === "invalid" || assessSource(setting.source_url).generic) return "個別の公式資料へ置換して再検証";
  if (health?.status === "blocked") return "手動で情報源を確認して再検証";
  if (health?.status === "redirect") return "移転先URLへ更新して再検証";
  if (!setting.verified_at) return "対象版で検証日を記録";
  return "通常周期で再確認";
}

function sourceRepairRows(settings: Setting[], health: ReadonlyMap<string, SourceHealth>) {
  return settings
    .filter((setting) => {
      const sourceHealth = setting.source_url ? health.get(setting.source_url) : undefined;
      return !setting.source_url || !setting.verified_at || sourceHealth?.status === "broken" || sourceHealth?.status === "invalid" || sourceHealth?.status === "blocked"
        || sourceHealth?.status === "redirect" || assessSource(setting.source_url).generic;
    })
    .map((setting) => {
      const sourceHealth = setting.source_url ? health.get(setting.source_url) : undefined;
      return {
        id: setting.id,
        slug: setting.slug,
        title: setting.title,
        os: setting.os,
        category: setting.category,
        source_url: setting.source_url || "",
        source_status: sourceHealth?.status || (setting.source_url ? "unchecked" : "missing"),
        source_status_class: sourceStatusClass(setting, sourceHealth),
        verified_at: setting.verified_at || "",
        recommended_action: sourceAction(setting, sourceHealth),
      };
    });
}

function safeSourceRepairs(settings: Setting[], health: ReadonlyMap<string, SourceHealth>) {
  return settings.flatMap((setting) => {
    if (!setting.source_url) return [];
    const result = health.get(setting.source_url);
    if (!result || result.status !== "redirect" || !result.finalUrl || result.finalUrl === setting.source_url) return [];
    const initial = assessSource(setting.source_url);
    const final = assessSource(result.finalUrl);
    // 同一の権威ドメイン内で、移転先も個別資料と判定できる場合だけ自動修復候補にする。
    if (!initial.authoritative || !final.authoritative || final.generic || !final.secure || initial.hostname !== final.hostname) return [];
    return [{ id: setting.id, slug: setting.slug, title: setting.title, from: setting.source_url, to: result.finalUrl, status: "SAFE_REDIRECT" as const }];
  });
}

function relatedRepairRows(settings: Setting[]) {
  const published = settings.filter((setting) => setting.status !== "draft");
  const byCanonical = new Map<string, Setting[]>();
  const relatedKey = (slug: string) => canonicalSlug(slug).replace(/^trouble\d*/, "trouble");
  for (const setting of published) {
    const key = relatedKey(setting.slug);
    byCanonical.set(key, [...(byCanonical.get(key) || []), setting]);
  }
  return published.flatMap((setting) => setting.related_slugs.flatMap((oldSlug) => {
    if (published.some((candidate) => candidate.slug === oldSlug)) return [];
    const candidates = byCanonical.get(relatedKey(oldSlug)) || [];
    const target = candidates.find((candidate) => candidate.os === setting.os);
    if (!target || target.slug === oldSlug || target.id === setting.id) return [];
    return [{ id: setting.id, source_slug: oldSlug, target_slug: target.slug, target_id: target.id, title: setting.title }];
  }));
}

function invalidRelatedRows(settings: Setting[]) {
  const published = settings.filter((setting) => setting.status !== "draft");
  const slugs = new Set(published.map((setting) => setting.slug));
  return published.flatMap((setting) => setting.related_slugs.flatMap((relatedSlug) => slugs.has(relatedSlug) ? [] : [{ id: setting.id, slug: setting.slug, title: setting.title, invalid_related_slug: relatedSlug }]));
}

function relatedRepairsSql(rows: Array<{ id: string; source_slug: string; target_slug: string }>): string {
  if (!rows.length) return "-- 決定的に置換できる関連リンクはありません。\n";
  return [
    "-- canonical slugが一致する既存公開記事への置換候補。適用前にCSVを人手確認する。",
    "BEGIN;",
    ...rows.map((row) => `UPDATE settings SET related_slugs = array_replace(related_slugs, ${sqlLiteral(row.source_slug)}, ${sqlLiteral(row.target_slug)}) WHERE id = ${sqlLiteral(row.id)} AND ${sqlLiteral(row.source_slug)} = ANY(related_slugs);`),
    "COMMIT;",
    "",
  ].join("\n");
}

function relatedCleanupSql(rows: Array<{ id: string; invalid_related_slug: string }>): string {
  if (!rows.length) return "-- 未解決の関連リンクはありません。\n";
  return [
    "-- 置換先が決定できない欠落slugだけを配列から取り除く候補。リンク先を推測して追加しない。",
    "-- 適用前にrelated-link-cleanup.csvを確認し、必要なものは手動で正規slugへ置換する。",
    "BEGIN;",
    ...rows.map((row) => `UPDATE settings SET related_slugs = array_remove(related_slugs, ${sqlLiteral(row.invalid_related_slug)}) WHERE id = ${sqlLiteral(row.id)} AND ${sqlLiteral(row.invalid_related_slug)} = ANY(related_slugs);`),
    "COMMIT;",
    "",
  ].join("\n");
}

function intentAliasRows(settings: Setting[], consolidation: ReturnType<typeof selectIntentAliasConsolidation>) {
  const byId = new Map(settings.map((setting) => [setting.id, setting]));
  return [...consolidation.canonicalByDuplicateId.entries()].flatMap(([duplicateId, canonicalId]) => {
    const duplicate = byId.get(duplicateId);
    const canonical = byId.get(canonicalId);
    return duplicate && canonical ? [{ duplicate_id: duplicate.id, duplicate_slug: duplicate.slug, duplicate_title: duplicate.title, canonical_id: canonical.id, canonical_slug: canonical.slug, canonical_title: canonical.title, recommended_action: "ADD_ALIAS_THEN_NOINDEX_DUPLICATE" }] : [];
  });
}

function intentAliasNoindexSql(rows: Array<{ duplicate_id: string }>): string {
  if (!rows.length) return "-- 別名統合候補はありません。\n";
  return [
    "-- intent-review.csvで正規記事と別名を確認した後、重複候補だけを公開維持+noindexへする候補。",
    "-- 先に正規記事へ検索語を追加し、旧URLは削除しない。",
    "BEGIN;",
    ...rows.map((row) => `UPDATE settings SET index_status = 'noindex' WHERE id = ${sqlLiteral(row.duplicate_id)} AND status = 'published';`),
    "COMMIT;",
    "",
  ].join("\n");
}

function sourceHealthSummary(settings: Setting[], health: ReadonlyMap<string, SourceHealth>) {
  const classCounts: Record<string, number> = {};
  const byOS: Record<string, { total: number; official: number; sourceBacked: number; broken: number }> = {};
  for (const setting of settings) {
    const status = sourceStatusClass(setting, setting.source_url ? health.get(setting.source_url) : undefined);
    classCounts[status] = (classCounts[status] || 0) + 1;
    const row = byOS[setting.os] || { total: 0, official: 0, sourceBacked: 0, broken: 0 };
    row.total += 1;
    if (setting.source_url) {
      row.sourceBacked += 1;
      const assessment = assessSource(setting.source_url);
      if (assessment.authoritative && !assessment.generic) row.official += 1;
    }
    if (["BROKEN", "GENERIC_HOME", "WRONG_DOCUMENT", "BLOCKED"].includes(status)) row.broken += 1;
    byOS[setting.os] = row;
  }
  return { classCounts, byOS };
}

function androidAndAppSummary(settings: Setting[]) {
  const android = settings.filter((setting) => setting.os === "android");
  const manufacturer: Record<string, number> = {};
  for (const setting of android) {
    const text = `${setting.title} ${setting.description} ${setting.device_scope || ""}`.toLowerCase();
    const key = /galaxy|samsung/.test(text) ? "GALAXY" : /pixel/.test(text) ? "PIXEL" : /xperia|sony/.test(text) ? "XPERIA" : /xiaomi|miui|redmi/.test(text) ? "XIAOMI" : /oppo|coloros/.test(text) ? "OPPO" : "GENERIC_ANDROID";
    manufacturer[key] = (manufacturer[key] || 0) + 1;
  }
  const apps = settings.filter((setting) => !["windows11", "windows10", "ios", "ipados", "android", "macos"].includes(setting.os));
  return { androidTotal: android.length, androidManufacturerSignals: manufacturer, appTotal: apps.length, appSourceBacked: apps.filter((setting) => Boolean(setting.source_url)).length, appVerified: apps.filter((setting) => Boolean(setting.verified_at)).length };
}

function safeSourceRepairsSql(rows: Array<{ id: string; from: string; to: string }>): string {
  if (!rows.length) return "-- 安全な同一公式ドメイン内リダイレクト修復はありません。\n";
  return [
    "-- 同一の公式ホストで、HTTPリダイレクト先も個別資料と判定できた候補だけを更新する。",
    "-- 適用前にsource-repair.csvと突き合わせ、バックアップを確認する。",
    "BEGIN;",
    ...rows.map((row) => `UPDATE settings SET source_url = ${sqlLiteral(row.to)} WHERE id = ${sqlLiteral(row.id)} AND source_url = ${sqlLiteral(row.from)};`),
    "COMMIT;",
    "",
  ].join("\n");
}

function sqlLiteral(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${value.replaceAll("'", "''")}'`;
}

function sourceChecksSql(sourceHealth: ReadonlyMap<string, SourceHealth>): string {
  const rows = [...sourceHealth.values()];
  if (!rows.length) return "-- source healthの入力がないため、変更はありません。\n";
  const values = rows.map((item) => `(${sqlLiteral(item.sourceUrl)},${sqlLiteral(assessSource(item.sourceUrl).type)},${sqlLiteral(item.status)},${sqlLiteral(item.httpStatus)},${sqlLiteral(item.finalUrl)},${sqlLiteral(item.checkedAt)})`);
  return [
    "-- check-sources.tsで確認した結果だけを保存する。settings本文・公開状態は変更しない。",
    "BEGIN;",
    "INSERT INTO source_checks(source_url,source_type,status,http_status,final_url,checked_at) VALUES",
    values.join(",\n"),
    "ON CONFLICT (source_url) DO UPDATE SET source_type=EXCLUDED.source_type,status=EXCLUDED.status,http_status=EXCLUDED.http_status,final_url=EXCLUDED.final_url,checked_at=EXCLUDED.checked_at;",
    "COMMIT;",
    "",
  ].join("\n");
}

function reverificationFlagsSql(rows: Array<{ id: string }>): string {
  if (!rows.length) return "-- 再検証対象はありません。\n";
  const ids = rows.map((row) => sqlLiteral(row.id)).join(",");
  return [
    "-- 対象記事を削除・非公開化せず、再検証キューへ入れるだけのSQL。",
    "-- supabase-upgrade-operations.sqlを先に適用してから実行する。",
    "BEGIN;",
    `UPDATE settings SET requires_reverification = TRUE, review_due_at = COALESCE(review_due_at, NOW()) WHERE id IN (${ids});`,
    "COMMIT;",
    "",
  ].join("\n");
}

const options = parseArgs(process.argv.slice(2));
const settings = normalizeSettings(readJson<unknown>(options.input));
const sourceHealth = loadHealth(options.sourceHealth);
const duplicateGroups = detectDuplicateGroups(settings);
const strongDuplicateGroups = duplicateGroups.filter((group) => isStrongDuplicateGroup(group));
const duplicateIds = new Set(strongDuplicateGroups.flatMap((group) => group.items.map((item) => item.id)));
const audit = auditSettingsQuality(settings, Date.now(), sourceHealth);
const reverify = buildReverificationQueue(settings, sourceHealth);
const intentGroups = detectSearchIntentCandidates(settings);
const intentDuplicateIds = new Set(intentGroups.flatMap((group) => group.items.map((item) => item.id)));
const intentAlias = selectIntentAliasConsolidation(settings, intentGroups);
const intentAliasRowsOutput = intentAliasRows(settings, intentAlias);
const intentReviewRows = classifyIntentGroups(settings, intentGroups);
const { inventory, evaluations } = buildContentInventory(settings, { duplicateIds, aliasDuplicateIds: intentAlias.aliasDuplicateIds, intentDuplicateIds, sourceHealth });
const sourceRows = sourceRepairRows(settings, sourceHealth);
const safeRepairs = safeSourceRepairs(settings, sourceHealth);
const relatedRepairs = relatedRepairRows(settings);
const invalidRelated = invalidRelatedRows(settings);
const relatedCleanup = invalidRelated.filter((row) => !relatedRepairs.some((repair) => repair.id === row.id && repair.source_slug === row.invalid_related_slug));
const nearIndexable = buildNearIndexableQueue(settings, evaluations);
const repairBatch = nearIndexable.slice(0, options.repairBatch);
const sourceSummary = sourceHealthSummary(settings, sourceHealth);
const platformSummary = androidAndAppSummary(settings);
const searchLogs = options.searchLogs ? readJson<SearchLogRecord[]>(options.searchLogs) : [];
const demand = searchLogs.length ? analyzeSearchDemand(searchLogs, settings) : [];
const acquisitionBacklog = toAcquisitionBacklog(demand);
const coverage = coverageRows(settings, evaluations);

const outputDir = path.resolve(options.outDir);
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  input: path.resolve(options.input),
  inventory,
  quality: audit.counts,
  issueCounts: audit.issueCounts,
  duplicateGroups: duplicateGroups.length,
  duplicateGuides: inventory.duplicateCandidates,
  strongDuplicateGuides: duplicateIds.size,
  strongDuplicateGroups: strongDuplicateGroups.length,
  searchIntentGroups: intentGroups.length,
  searchIntentGuides: intentDuplicateIds.size,
  intentAliasGroups: intentAlias.aliasGroups.length,
  intentSafeAliasGroups: intentAlias.safeAliasGroups.length,
  intentAliasDuplicateGuides: intentAlias.aliasDuplicateIds.size,
  intentClassifications: Object.fromEntries(Object.entries(intentReviewRows.reduce<Record<string, number>>((counts, row) => {
    counts[row.classification] = (counts[row.classification] || 0) + 1;
    return counts;
  }, {})).sort((left, right) => right[1] - left[1])),
  sourceRepairRows: sourceRows.length,
  safeSourceRepairs: safeRepairs.length,
  sourceHealth: sourceSummary,
  platformQuality: platformSummary,
  relatedRepairCandidates: relatedRepairs.length,
  relatedCleanupCandidates: relatedCleanup.length,
  nearIndexable: nearIndexable.length,
  repairBatch: repairBatch.length,
  reverification: {
    highPriority: reverify.filter((item) => item.status === "HIGH_PRIORITY_REVIEW").length,
    review: reverify.filter((item) => item.status === "REVIEW").length,
  },
  demand: {
    clusters: demand.length,
    missingAlias: demand.filter((item) => item.disposition === "MISSING_ALIAS").length,
    missingGuide: demand.filter((item) => item.disposition === "MISSING_GUIDE").length,
    weakResult: demand.filter((item) => item.disposition === "WEAK_RESULT").length,
  },
  coverageCells: coverage.length,
}, null, 2) + "\n");
fs.writeFileSync(path.join(outputDir, "source-repair.csv"), toCsv(sourceRows));
fs.writeFileSync(path.join(outputDir, "safe-source-repairs.csv"), toCsv(safeRepairs));
fs.writeFileSync(path.join(outputDir, "safe-source-repairs.sql"), safeSourceRepairsSql(safeRepairs));
fs.writeFileSync(path.join(outputDir, "related-link-repairs.csv"), toCsv(relatedRepairs));
fs.writeFileSync(path.join(outputDir, "related-link-repairs.sql"), relatedRepairsSql(relatedRepairs));
fs.writeFileSync(path.join(outputDir, "related-link-cleanup.csv"), toCsv(relatedCleanup));
fs.writeFileSync(path.join(outputDir, "related-link-cleanup.sql"), relatedCleanupSql(relatedCleanup));
fs.writeFileSync(path.join(outputDir, "editorial-review.csv"), toCsv(editorialReviewRows(settings, evaluations)));
fs.writeFileSync(path.join(outputDir, "noindex-reasons.csv"), toCsv(settings.flatMap((setting) => {
  const evaluation = evaluations.find((item) => item.id === setting.id);
  return evaluation && !evaluation.indexable ? [{
    id: setting.id, slug: setting.slug, title: setting.title, os: setting.os, category: setting.category,
    reasons: evaluation.noindexReasons.join("|"), completeness: evaluation.completeness,
  }] : [];
})));
fs.writeFileSync(path.join(outputDir, "near-indexable.csv"), toCsv(nearIndexable.map((item) => ({
  ...item,
  reasons: item.reasons.join("|"),
}))));
fs.writeFileSync(path.join(outputDir, "repair-batch.csv"), toCsv(repairBatch.map((item) => ({
  ...item,
  reasons: item.reasons.join("|"),
}))));
fs.writeFileSync(path.join(outputDir, "quality-issues.csv"), toCsv(audit.items as unknown as Array<Record<string, unknown>>));
fs.writeFileSync(path.join(outputDir, "reverification-queue.csv"), toCsv(reverify));
fs.writeFileSync(path.join(outputDir, "duplicate-review.json"), JSON.stringify({
  titleOrPathCandidates: duplicateGroups,
  searchIntentCandidates: intentGroups,
  aliasConsolidation: { reviewGroups: intentAlias.aliasGroups, safeGroups: intentAlias.safeAliasGroups, duplicateIds: [...intentAlias.aliasDuplicateIds], canonicalByDuplicateId: Object.fromEntries(intentAlias.canonicalByDuplicateId) },
}, null, 2) + "\n");
fs.writeFileSync(path.join(outputDir, "intent-review.csv"), toCsv(intentReviewRows));
fs.writeFileSync(path.join(outputDir, "intent-alias-consolidation.csv"), toCsv(intentAliasRowsOutput));
fs.writeFileSync(path.join(outputDir, "intent-alias-noindex.sql"), intentAliasNoindexSql(intentAliasRowsOutput));
fs.writeFileSync(path.join(outputDir, "acquisition-backlog.csv"), toCsv(acquisitionBacklog));
fs.writeFileSync(path.join(outputDir, "coverage-matrix.csv"), toCsv(coverage));
fs.writeFileSync(path.join(outputDir, "source-checks.sql"), sourceChecksSql(sourceHealth));
fs.writeFileSync(path.join(outputDir, "reverification-flags.sql"), reverificationFlagsSql(sourceRows.map((row) => ({ id: row.id }))));

console.log(JSON.stringify({
  outputDir,
  total: inventory.total,
  indexable: inventory.indexable,
  noindex: inventory.noindex,
  sourceRepairRows: sourceRows.length,
  duplicateGroups: duplicateGroups.length,
  duplicateGuides: inventory.duplicateCandidates,
  searchIntentGroups: intentGroups.length,
  strongDuplicateGroups: strongDuplicateGroups.length,
  intentAliasGroups: intentAlias.aliasGroups.length,
  intentSafeAliasGroups: intentAlias.safeAliasGroups.length,
  intentAliasDuplicateGuides: intentAlias.aliasDuplicateIds.size,
  nearIndexable: nearIndexable.length,
  repairBatch: repairBatch.length,
  acquisitionBacklog: acquisitionBacklog.length,
}, null, 2));
