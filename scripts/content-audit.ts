import fs from "node:fs";
import { buildContentInventory, buildReverificationQueue, editorialReviewRows, inferContentType, type SourceHealth } from "../src/lib/content-operations";
import { detectDuplicateGroups, detectSearchIntentCandidates } from "../src/lib/duplicate-detection";
import { getSettingIndexingIssues } from "../src/lib/content-quality";
import { analyzeSearchDemand, toAcquisitionBacklog, type SearchLogRecord } from "../src/lib/search-demand";
import { assessSource } from "../src/lib/source-quality";
import { CATEGORIES, getStepText, isOSType, type Setting } from "../src/lib/types";
import { loadLocalCandidateSettings } from "./candidate-dataset";

type Options = {
  input?: string;
  sourceHealth?: string;
  searchLogs?: string;
  json?: string;
  csv?: string;
  backlog?: string;
  strict: boolean;
};

function parseArgs(argv: string[]): Options {
  const options: Options = { strict: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--strict") options.strict = true;
    else if (value === "--input") options.input = argv[++index];
    else if (value === "--source-health") options.sourceHealth = argv[++index];
    else if (value === "--search-logs") options.searchLogs = argv[++index];
    else if (value === "--json") options.json = argv[++index];
    else if (value === "--csv") options.csv = argv[++index];
    else if (value === "--backlog") options.backlog = argv[++index];
    else throw new Error(`不明な引数です: ${value}`);
  }
  return options;
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

function readJson(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, "utf8"));
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

function normalizedBody(setting: Setting): string {
  return [setting.description, ...setting.steps.map(getStepText)]
    .join(" ")
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s、。,.!！?？「」『』（）()]+/g, "");
}

function groupCounts<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) counts[key(item)] = (counts[key(item)] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ja")));
}

const options = parseArgs(process.argv.slice(2));
const settings = options.input ? normalizeSettings(readJson(options.input)) : loadLocalCandidateSettings();
const sourceHealthRows = options.sourceHealth ? readJson(options.sourceHealth) : [];
const sourceHealth = new Map<string, SourceHealth>();
if (Array.isArray(sourceHealthRows)) {
  for (const item of sourceHealthRows) {
    if (item && typeof item === "object" && typeof (item as SourceHealth).sourceUrl === "string") {
      sourceHealth.set((item as SourceHealth).sourceUrl, item as SourceHealth);
    }
  }
}

const duplicateGroups = detectDuplicateGroups(settings);
const intentGroups = detectSearchIntentCandidates(settings);
const duplicateIds = new Set(duplicateGroups.flatMap((group) => group.items.map((item) => item.id)));
const { inventory, evaluations } = buildContentInventory(settings, { duplicateIds, sourceHealth });
const reverificationQueue = buildReverificationQueue(settings, sourceHealth);
const indexingIssueCounts: Record<string, number> = {};
const indexingIssueCombinations: Record<string, number> = {};
for (const setting of settings.filter((item) => item.status !== "draft")) {
  const issues = getSettingIndexingIssues(setting).sort();
  for (const issue of issues) indexingIssueCounts[issue] = (indexingIssueCounts[issue] || 0) + 1;
  const combination = issues.join("+") || "indexable";
  indexingIssueCombinations[combination] = (indexingIssueCombinations[combination] || 0) + 1;
}

const slugKeys = new Map<string, Setting[]>();
for (const setting of settings) {
  const key = `${setting.slug}\u0000${setting.os}`;
  slugKeys.set(key, [...(slugKeys.get(key) || []), setting]);
}
const duplicateSlugGroups = [...slugKeys.values()].filter((items) => items.length > 1);
const exactTitleGroups = Object.entries(groupCounts(settings, (setting) => `${setting.os}\u0000${setting.title.normalize("NFKC").replace(/\s+/g, "").toLowerCase()}`))
  .filter(([, count]) => count > 1);
const bodyGroups = new Map<string, Setting[]>();
for (const setting of settings) {
  const key = normalizedBody(setting);
  if (key.length < 60) continue;
  bodyGroups.set(key, [...(bodyGroups.get(key) || []), setting]);
}
const suspiciousBodyGroups = [...bodyGroups.values()].filter((items) => items.length >= 3);
const sourceUrls = settings.map((item) => item.source_url).filter((item): item is string => Boolean(item));
const sourceAssessments = sourceUrls.map(assessSource);
const unverifiedEvaluations = evaluations.filter((item) => {
  const setting = settings.find((candidate) => candidate.id === item.id)!;
  return !setting.verified_at || !setting.source_url;
});

const errors: string[] = [];
const warnings: string[] = [];
for (const group of duplicateSlugGroups) errors.push(`重複slug×OS: ${group[0].slug} / ${group[0].os}`);
for (const setting of settings) {
  const label = `${setting.os}/${setting.slug}`;
  if (!setting.title.trim()) errors.push(`タイトル空: ${label}`);
  if (!isOSType(setting.os)) errors.push(`OS不正: ${label}`);
  if (!CATEGORIES[setting.category]) errors.push(`カテゴリ不正: ${label} (${setting.category})`);
  if (!setting.slug.trim()) errors.push(`slug空: ${label}`);
  if (!setting.steps.length || setting.steps.some((step) => !getStepText(step).trim())) errors.push(`手順不正: ${label}`);
  if (setting.source_url && assessSource(setting.source_url).type === "INVALID") errors.push(`情報源URL不正: ${label}`);
  if (setting.verified_at && Date.parse(setting.verified_at) > Date.now() + 86_400_000) errors.push(`未来の検証日: ${label}`);
}
if (intentGroups.length) warnings.push(`検索意図の統合候補: ${intentGroups.length}グループ`);
if (suspiciousBodyGroups.length) warnings.push(`同一本文テンプレート候補: ${suspiciousBodyGroups.length}グループ`);

let demandClusters: ReturnType<typeof analyzeSearchDemand> = [];
let backlog: ReturnType<typeof toAcquisitionBacklog> = [];
if (options.searchLogs) {
  const logs = readJson(options.searchLogs);
  if (!Array.isArray(logs)) throw new Error("検索ログJSONは配列である必要があります");
  demandClusters = analyzeSearchDemand(logs as SearchLogRecord[], settings);
  backlog = toAcquisitionBacklog(demandClusters);
}

const report = {
  dataset: options.input ? options.input : "local-candidates",
  inventory,
  indexEligibility: {
    issueCounts: Object.fromEntries(Object.entries(indexingIssueCounts).sort((left, right) => right[1] - left[1])),
    combinations: Object.fromEntries(Object.entries(indexingIssueCombinations).sort((left, right) => right[1] - left[1])),
  },
  duplicates: {
    exactTitleGroups: exactTitleGroups.length,
    duplicateSlugGroups: duplicateSlugGroups.length,
    candidateGroups: duplicateGroups.length,
    candidateGuides: duplicateIds.size,
    strongGroups: duplicateGroups.filter((group) => group.confidence === "high").length,
    searchIntentGroups: intentGroups.length,
    suspiciousIdenticalBodyGroups: suspiciousBodyGroups.length,
    suspiciousIdenticalBodyGuides: new Set(suspiciousBodyGroups.flatMap((group) => group.map((item) => item.id))).size,
    groups: duplicateGroups,
  },
  unverified: {
    total: unverifiedEvaluations.length,
    byQualityStatus: groupCounts(unverifiedEvaluations, (item) => item.qualityStatus),
    byOS: groupCounts(unverifiedEvaluations, (item) => item.os),
    recommendedActions: groupCounts(unverifiedEvaluations, (item) => item.recommendedAction),
  },
  sources: {
    rows: sourceUrls.length,
    uniqueUrls: new Set(sourceUrls).size,
    generic: sourceAssessments.filter((item) => item.generic).length,
    unknown: sourceAssessments.filter((item) => item.type === "UNKNOWN").length,
    insecure: sourceAssessments.filter((item) => !item.secure).length,
    healthChecked: sourceHealth.size,
    healthCounts: groupCounts([...sourceHealth.values()], (item) => item.status),
  },
  coverage: {
    osCategoryType: groupCounts(settings, (setting) => `${setting.os}\u0000${setting.category}\u0000${inferContentType(setting)}`),
  },
  reverification: {
    highPriority: reverificationQueue.filter((item) => item.status === "HIGH_PRIORITY_REVIEW").length,
    review: reverificationQueue.filter((item) => item.status === "REVIEW").length,
    top: reverificationQueue.slice(0, 100),
  },
  demand: {
    clusters: demandClusters.length,
    zeroResultClusters: demandClusters.filter((item) => item.zeroResultCount > 0).length,
    missingAlias: demandClusters.filter((item) => item.disposition === "MISSING_ALIAS").length,
    missingGuide: demandClusters.filter((item) => item.disposition === "MISSING_GUIDE").length,
    backlog: backlog.length,
    items: demandClusters,
  },
  validation: { errors, warnings },
};

if (options.json) fs.writeFileSync(options.json, JSON.stringify(report, null, 2) + "\n");
if (options.csv) fs.writeFileSync(options.csv, toCsv(editorialReviewRows(settings, evaluations)));
if (options.backlog) fs.writeFileSync(options.backlog, JSON.stringify(backlog, null, 2) + "\n");

console.log(`全記事: ${inventory.total}`);
console.log(`公開: ${inventory.published} / 下書き: ${inventory.draft}`);
console.log(`検証日あり: ${inventory.verified} / 情報源あり: ${inventory.sourceBacked}`);
console.log(`indexable: ${inventory.indexable} / noindex: ${inventory.noindex}`);
console.log(`未検証または情報源なし: ${inventory.unverified}`);
console.log(`類似候補: ${duplicateGroups.length}グループ・${duplicateIds.size}記事 / 検索意図候補: ${intentGroups.length}グループ`);
console.log(`孤立記事: ${inventory.orphanGuides} / 関連なし: ${inventory.guidesWithoutRelated} / 関連リンク切れ: ${inventory.invalidRelatedLinks}`);
console.log(`if_missingなし: ${inventory.guidesWithoutIfMissing} / スクリーンショットあり: ${inventory.screenshots}`);
console.log(`情報源URL: ${sourceUrls.length}件・${new Set(sourceUrls).size}種類 / health確認: ${sourceHealth.size}種類`);
if (demandClusters.length) console.log(`検索需要: ${demandClusters.length}クラスタ / alias不足: ${report.demand.missingAlias} / 記事不足: ${report.demand.missingGuide}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (options.strict && errors.length) process.exitCode = 1;
