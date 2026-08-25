import fs from "node:fs";
import { assessSource } from "../src/lib/source-quality";
import { hasBoilerplateContent } from "../src/lib/content-quality";
import {
  evaluateGuide,
  sourceHealthBlocksIndex,
  type SourceHealth,
} from "../src/lib/content-operations";
import {
  detectDuplicateGroups,
  detectSearchIntentCandidates,
  isStrongDuplicateGroup,
  selectIntentAliasConsolidation,
} from "../src/lib/duplicate-detection";
import { getStepText, type Setting } from "../src/lib/types";

type Options = {
  input: string;
  sourceHealth: string;
  outDir: string;
  limit: number;
};

type RepairRow = {
  id: string;
  slug: string;
  os: string;
  titleBefore: string;
  titleAfter: string;
  descriptionBefore: string;
  descriptionAfter: string;
  sourceUrl: string;
  completenessBefore: number;
  completenessAfter: number;
};

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {
    outDir: ".content-operations",
    limit: 100,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") options.input = argv[++index];
    else if (value === "--source-health") options.sourceHealth = argv[++index];
    else if (value === "--out-dir") options.outDir = argv[++index];
    else if (value === "--limit") options.limit = Math.max(1, Math.min(200, Number(argv[++index])));
    else throw new Error(`不明な引数です: ${value}`);
  }
  if (!options.input || !options.sourceHealth) {
    throw new Error("--input <settings.json> と --source-health <health.json> が必要です");
  }
  return options as Options;
}

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(filename, "utf8")) as T;
}

function sqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function normalizeHealth(rows: unknown[]): Map<string, SourceHealth> {
  const result = new Map<string, SourceHealth>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Partial<SourceHealth>;
    if (typeof item.sourceUrl !== "string" || typeof item.status !== "string") continue;
    result.set(item.sourceUrl, item as SourceHealth);
  }
  return result;
}

/**
 * Only removes unambiguous duplicated product names from titles. It does not
 * translate, shorten, or otherwise rewrite an editorial title.
 */
function repairTitle(title: string): string {
  return title
    .replace(/^OneDriveでOneDriveのエラーコード/, "OneDriveでエラーコード")
    .replace(/^OfficeでOfficeの(エラー|警告)/, "Officeで$1")
    .replace(/^ChromeでChromeのエラー/, "Chromeでエラー")
    .replace(/^EdgeでEdgeのエラー/, "Edgeでエラー")
    .replace(/^プリンターでプリンターのエラー/, "プリンターでエラー")
    .replace(/^Windows InstallerでWindows Installerのエラー/, "Windows Installerでエラー")
    .replace(/^ブラウザでブラウザで/, "ブラウザで");
}

function cleanFirstStep(setting: Setting): string {
  const candidates = setting.steps
    .map((step) => getStepText(step).trim())
    .filter(Boolean)
    .map((step) => step.replace(/\s+/g, " ").replace(/[。．]+$/u, "").trim());
  // The imported troubleshooting batch often starts with a generic
  // 「該当する発生場面」 sentence. Prefer the first concrete action instead
  // of making that generic sentence the new description.
  const concrete = candidates.find((step) => !/^該当する発生場面/.test(step) && !/設定名とメーカー独自メニューを確認/.test(step));
  const first = concrete || candidates[0] || "";
  return first
    .replace(/^該当する発生場面(?:で|に)/, "症状が起きた環境で")
    .replace(/^該当する発生場面/, "症状が起きた環境")
    .trim();
}

/**
 * Replaces the known generated intro with a description derived only from the
 * article's existing title and first step. No new factual instruction is
 * invented and no verification/source field is changed.
 */
function repairDescription(setting: Setting, title: string): string {
  const first = cleanFirstStep(setting);
  if (!first) return `${title}で困ったときに、記事内の手順を上から順に確認します。`;
  return `${title}で困ったときに、まず${first}。続いて記事内の手順を順に確認します。`;
}

function topicPriority(setting: Setting): number {
  const text = [setting.title, ...setting.aliases, ...setting.keywords].join(" ");
  if (/(Wi[- ]?Fi|ワイファイ|wifi)/i.test(text)) return 60;
  if (/(Bluetooth|ブルートゥース)/i.test(text)) return 55;
  if (/(通知|音|サウンド|マイク)/i.test(text)) return 50;
  if (/(ストレージ|容量|バックアップ|保存)/i.test(text)) return 45;
  if (/(画面|ディスプレイ|明るさ|カメラ)/i.test(text)) return 40;
  return 10;
}

function csvValue(value: unknown): string {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(rows: RepairRow[]): string {
  const headers = [
    "id", "slug", "os", "title_before", "title_after", "description_before",
    "description_after", "source_url", "completeness_before", "completeness_after",
  ];
  return [
    headers.join(","),
    ...rows.map((row) => [
      row.id, row.slug, row.os, row.titleBefore, row.titleAfter, row.descriptionBefore,
      row.descriptionAfter, row.sourceUrl, row.completenessBefore, row.completenessAfter,
    ].map(csvValue).join(",")),
  ].join("\n") + "\n";
}

function buildSql(rows: RepairRow[]): string {
  const statements = rows.map((row) => `UPDATE settings
SET title = ${sqlLiteral(row.titleAfter)},
    description = ${sqlLiteral(row.descriptionAfter)},
    updated_at = now()
WHERE id = ${sqlLiteral(row.id)}
  AND status = 'published'
  AND title = ${sqlLiteral(row.titleBefore)}
  AND description = ${sqlLiteral(row.descriptionBefore)};`);
  return [
    "-- SettingDoko: boilerplate-only quality repairs",
    "-- Safe batch: updates title/description only when the original values still match.",
    "-- Does not change source_url, verified_at, index_status, or publication status.",
    "BEGIN;",
    ...statements,
    "COMMIT;",
    "",
  ].join("\n");
}

const options = parseArgs(process.argv.slice(2));
const settings = readJson<Setting[]>(options.input);
const healthRows = readJson<unknown[]>(options.sourceHealth);
const sourceHealth = normalizeHealth(healthRows);
const officialDraftPattern = /公式情報ベースの下書き候補/;
const publishedSettings = settings.filter((setting) => setting.status !== "draft");
const strongDuplicateIds = new Set(
  detectDuplicateGroups(publishedSettings)
    .filter((group) => isStrongDuplicateGroup(group))
    .flatMap((group) => group.items.map((item) => item.id)),
);
const baselineIntentGroups = detectSearchIntentCandidates(publishedSettings);
const baselineAlias = selectIntentAliasConsolidation(publishedSettings, baselineIntentGroups);
const baselineBlockedIds = new Set([...strongDuplicateIds, ...baselineAlias.aliasDuplicateIds]);

const eligible = settings.flatMap((setting) => {
  if (setting.status === "draft" || !setting.source_url || !setting.verified_at) return [];
  const health = sourceHealth.get(setting.source_url);
  const source = assessSource(setting.source_url);
  const evaluation = evaluateGuide(setting, { sourceHealth });
  const sourceIsHealthy = Boolean(
    health
      && !sourceHealthBlocksIndex(health)
      && (health.status === "ok" || health.status === "redirect")
      && source.secure
      && source.authoritative
      && !source.generic,
  );
  // Candidate wording is intentionally retained for human review. It must not
  // be erased merely to make an article pass an automated gate.
  const allText = [setting.title, setting.description, setting.device_scope || "", setting.rollback || ""].join(" ");
  if (
    evaluation.indexable
    || evaluation.noindexReasons.length !== 1
    || evaluation.noindexReasons[0] !== "weak_content"
    || !hasBoilerplateContent(setting)
    || officialDraftPattern.test(allText)
    || !sourceIsHealthy
    || baselineBlockedIds.has(setting.id)
  ) return [];

  const titleAfter = repairTitle(setting.title);
  const descriptionAfter = repairDescription(setting, titleAfter);
  if (titleAfter === setting.title && descriptionAfter === setting.description) return [];
  const repaired = { ...setting, title: titleAfter, description: descriptionAfter };
  const after = evaluateGuide(repaired, { sourceHealth });
  if (!after.indexable) return [];
  return [{
    id: setting.id,
    slug: setting.slug,
    os: setting.os,
    titleBefore: setting.title,
    titleAfter,
    descriptionBefore: setting.description,
    descriptionAfter,
    sourceUrl: setting.source_url,
    completenessBefore: evaluation.completeness,
    completenessAfter: after.completeness,
    priority: topicPriority(setting) + Math.min(20, Math.max(0, Number(setting.view_count) || 0)),
    updatedAt: Date.parse(setting.updated_at) || 0,
  }];
}).sort((left, right) => right.priority - left.priority || right.updatedAt - left.updatedAt || left.slug.localeCompare(right.slug, "ja"));

// Run the same duplicate-intent policy used by sitemap generation against the
// proposed batch. A description repair must never accidentally make a second
// article indexable for an already consolidated intent.
const proposedById = new Map(eligible.map((row) => [row.id, row]));
const proposedSettings = settings.map((setting) => {
  const repair = proposedById.get(setting.id);
  return repair ? { ...setting, title: repair.titleAfter, description: repair.descriptionAfter } : setting;
});
const proposedPublished = proposedSettings.filter((setting) => setting.status !== "draft");
const proposedStrongIds = new Set(
  detectDuplicateGroups(proposedPublished)
    .filter((group) => isStrongDuplicateGroup(group))
    .flatMap((group) => group.items.map((item) => item.id)),
);
const proposedIntent = selectIntentAliasConsolidation(proposedPublished, detectSearchIntentCandidates(proposedPublished));
const proposedBlockedIds = new Set([...proposedStrongIds, ...proposedIntent.aliasDuplicateIds]);
const selected = eligible
  .filter((row) => !proposedBlockedIds.has(row.id))
  .slice(0, options.limit)
  .map((candidate) => {
    const { priority, updatedAt, ...row } = candidate;
    void priority;
    void updatedAt;
    return row;
  });
fs.mkdirSync(options.outDir, { recursive: true });
const prefix = `${options.outDir}/latest/quality-repairs`;
fs.mkdirSync(`${options.outDir}/latest`, { recursive: true });
fs.writeFileSync(`${prefix}.csv`, csv(selected));
fs.writeFileSync(`${prefix}.sql`, buildSql(selected));
fs.writeFileSync(`${prefix}.json`, JSON.stringify({
  generatedAt: new Date().toISOString(),
  eligible: eligible.length,
  selected: selected.length,
  wouldBecomeIndexable: selected.length,
  excludedDuplicateIntent: eligible.filter((row) => proposedBlockedIds.has(row.id)).length,
  excludedCandidateWording: settings.filter((setting) => officialDraftPattern.test([setting.title, setting.description, setting.device_scope || "", setting.rollback || ""].join(" "))).length,
  rows: selected,
  files: { csv: `${prefix}.csv`, sql: `${prefix}.sql` },
}, null, 2) + "\n");
console.log(JSON.stringify({
  eligible: eligible.length,
  selected: selected.length,
  wouldBecomeIndexable: selected.length,
  excludedDuplicateIntent: eligible.filter((row) => proposedBlockedIds.has(row.id)).length,
  csv: `${prefix}.csv`,
  sql: `${prefix}.sql`,
}, null, 2));
