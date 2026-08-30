import fs from "node:fs";
import path from "node:path";
import { inferContentType } from "../src/lib/content-operations";
import { reviewArticle, type EditorialField } from "../src/lib/editorial-review";
import { getStepText, type Setting } from "../src/lib/types";
import { loadLocalCandidateSettings } from "./candidate-dataset";

type Options = { input?: string; json?: string; csv?: string };

function parseArgs(argv: string[]): Options {
  const options: Options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") options.input = argv[++index];
    else if (value === "--json") options.json = argv[++index];
    else if (value === "--csv") options.csv = argv[++index];
    else throw new Error(`不明な引数です: ${value}`);
  }
  return options;
}

function readSettings(filename: string): Setting[] {
  const value = JSON.parse(fs.readFileSync(filename, "utf8")) as unknown;
  if (!Array.isArray(value)) throw new Error("入力JSONは記事配列である必要があります");
  return value.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`記事${index + 1}がオブジェクトではありません`);
    const source = item as Partial<Setting>;
    return {
      ...source,
      id: typeof source.id === "string" ? source.id : `input-${index.toString().padStart(5, "0")}`,
      title: typeof source.title === "string" ? source.title : "",
      slug: typeof source.slug === "string" ? source.slug : "",
      aliases: Array.isArray(source.aliases) ? source.aliases : [],
      path: Array.isArray(source.path) ? source.path : [],
      steps: Array.isArray(source.steps) ? source.steps : [],
      related_slugs: Array.isArray(source.related_slugs) ? source.related_slugs : [],
      keywords: Array.isArray(source.keywords) ? source.keywords : [],
      description: typeof source.description === "string" ? source.description : "",
      updated_at: typeof source.updated_at === "string" ? source.updated_at : "1970-01-01T00:00:00.000Z",
      os: source.os || "windows11",
      version: typeof source.version === "string" ? source.version : "",
      category: typeof source.category === "string" ? source.category : "",
      status: source.status === "draft" ? "draft" : "published",
    } as Setting;
  });
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

function stepText(setting: Setting): string[] {
  return setting.steps.map((step) => getStepText(step).trim()).filter(Boolean);
}

function writeOutput(filename: string, content: string) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, content);
}

const options = parseArgs(process.argv.slice(2));
const settings = options.input ? readSettings(options.input) : loadLocalCandidateSettings();
const fieldCounts: Record<EditorialField, number> = {
  title: 0,
  description: 0,
  steps: 0,
  device_scope: 0,
  impact: 0,
  rollback: 0,
  caution: 0,
  if_missing: 0,
};
const topicCounts: Record<string, number> = {};
const rows = settings.map((setting) => {
  const review = reviewArticle(setting);
  for (const field of review.changedFields) fieldCounts[field] += 1;
  topicCounts[review.topic] = (topicCounts[review.topic] || 0) + 1;
  return {
    id: setting.id,
    slug: setting.slug,
    os: setting.os,
    content_type: inferContentType(setting),
    topic: review.topic,
    changed: review.changedFields.length > 0,
    changed_fields: review.changedFields.join("|"),
    requires_human_check: review.requiresHumanCheck,
    reasons: review.reasons.join("|"),
    title_before: setting.title,
    title_after: review.setting.title,
    description_before: setting.description,
    description_after: review.setting.description,
    steps_before: stepText(setting).join(" | "),
    steps_after: stepText(review.setting).join(" | "),
    source_present: Boolean(setting.source_url),
    verified_present: Boolean(setting.verified_at),
  };
});

const revisedSettings = settings.map((setting) => reviewArticle(setting).setting);
const remainingGenericDescriptions = revisedSettings.filter((setting) => /確認手順です|設定方法です|該当する発生場面|設定・接続・権限・更新の順|公式情報ベース|下書き候補/.test(setting.description)).length;
const remainingGenericSteps = revisedSettings.filter((setting) => /該当する発生場面|目的の機能名を設定検索|端末の設定名とメーカー独自メニュー/.test(stepText(setting).join(" "))).length;
const summary = {
  generatedAt: new Date().toISOString(),
  dataset: options.input || "local-candidates",
  total: settings.length,
  reviewed: rows.length,
  changed: rows.filter((row) => row.changed).length,
  requiresHumanCheck: rows.filter((row) => row.requires_human_check).length,
  sourceMissing: settings.filter((setting) => !setting.source_url).length,
  verificationMissing: settings.filter((setting) => !setting.verified_at).length,
  remainingGenericDescriptions,
  remainingGenericSteps,
  underTwoSteps: revisedSettings.filter((setting) => stepText(setting).length < 2).length,
  changedFields: fieldCounts,
  topics: topicCounts,
  guarantees: [
    "source_url・verified_at・status・published_atは編集しない",
    "入力記事ごとに1行の監査結果を出力する",
    "自動補完しても出典・検証のない記事は確認済みとして扱わない",
  ],
  rows,
};

if (options.json) writeOutput(options.json, JSON.stringify(summary, null, 2) + "\n");
if (options.csv) writeOutput(options.csv, toCsv(rows));

console.log(`記事別編集監査: ${summary.reviewed}/${summary.total}件を確認`);
console.log(`変更あり: ${summary.changed}件 / 人手確認が必要: ${summary.requiresHumanCheck}件`);
console.log(`変更項目: ${JSON.stringify(summary.changedFields)}`);
console.log(`テーマ分類: ${JSON.stringify(summary.topics)}`);
console.log(`出典なし: ${summary.sourceMissing}件 / 検証日なし: ${summary.verificationMissing}件`);
console.log(`修正後に残る定型概要: ${summary.remainingGenericDescriptions}件 / 定型手順: ${summary.remainingGenericSteps}件 / 2手順未満: ${summary.underTwoSteps}件`);
if (options.json) console.log(`JSON: ${options.json}`);
if (options.csv) console.log(`CSV: ${options.csv}`);

