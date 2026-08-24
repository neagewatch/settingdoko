import fs from "node:fs";
import path from "node:path";
import { auditSettingsQuality } from "../src/lib/quality-audit";
import {
  buildContentInventory,
  buildReverificationQueue,
  editorialReviewRows,
  type SourceHealth,
} from "../src/lib/content-operations";
import { detectDuplicateGroups, detectSearchIntentCandidates } from "../src/lib/duplicate-detection";
import { analyzeSearchDemand, toAcquisitionBacklog, type SearchLogRecord } from "../src/lib/search-demand";
import { assessSource } from "../src/lib/source-quality";
import type { Setting } from "../src/lib/types";

type Options = { input: string; sourceHealth?: string; searchLogs?: string; outDir: string };

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { outDir: ".content-operations" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") options.input = argv[++index];
    else if (value === "--source-health") options.sourceHealth = argv[++index];
    else if (value === "--search-logs") options.searchLogs = argv[++index];
    else if (value === "--out-dir") options.outDir = argv[++index];
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
        verified_at: setting.verified_at || "",
        recommended_action: sourceAction(setting, sourceHealth),
      };
    });
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
const duplicateIds = new Set(duplicateGroups.flatMap((group) => group.items.map((item) => item.id)));
const { inventory, evaluations } = buildContentInventory(settings, { duplicateIds, sourceHealth });
const audit = auditSettingsQuality(settings, Date.now(), sourceHealth);
const reverify = buildReverificationQueue(settings, sourceHealth);
const intentGroups = detectSearchIntentCandidates(settings);
const sourceRows = sourceRepairRows(settings, sourceHealth);
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
  duplicateGuides: duplicateIds.size,
  searchIntentGroups: intentGroups.length,
  sourceRepairRows: sourceRows.length,
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
fs.writeFileSync(path.join(outputDir, "editorial-review.csv"), toCsv(editorialReviewRows(settings, evaluations)));
fs.writeFileSync(path.join(outputDir, "quality-issues.csv"), toCsv(audit.items as unknown as Array<Record<string, unknown>>));
fs.writeFileSync(path.join(outputDir, "reverification-queue.csv"), toCsv(reverify));
fs.writeFileSync(path.join(outputDir, "duplicate-review.json"), JSON.stringify({ titleOrPathCandidates: duplicateGroups, searchIntentCandidates: intentGroups }, null, 2) + "\n");
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
  duplicateGuides: duplicateIds.size,
  searchIntentGroups: intentGroups.length,
  acquisitionBacklog: acquisitionBacklog.length,
}, null, 2));
