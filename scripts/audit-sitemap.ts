import fs from "node:fs";
import { isSettingIndexable } from "../src/lib/content-quality";
import { sourceHealthBlocksIndex, type SourceHealth } from "../src/lib/content-operations";
import { detectDuplicateGroups, isStrongDuplicateGroup, selectIntentAliasConsolidation } from "../src/lib/duplicate-detection";
import type { Setting } from "../src/lib/types";

type Options = { input?: string; sourceHealth?: string; sitemap?: string; baseUrl: string };

function parseArgs(argv: string[]): Options {
  const options: Options = { baseUrl: "https://settingdoko.vercel.app" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") options.input = argv[++index];
    else if (value === "--source-health") options.sourceHealth = argv[++index];
    else if (value === "--sitemap") options.sitemap = argv[++index];
    else if (value === "--base-url") options.baseUrl = argv[++index].replace(/\/$/, "");
    else throw new Error(`不明な引数です: ${value}`);
  }
  return options;
}

function readJson(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function normalizeSettings(value: unknown): Setting[] {
  if (!Array.isArray(value)) throw new Error("入力JSONは記事配列である必要があります");
  return value.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`記事${index + 1}が不正です`);
    const setting = item as Setting;
    return {
      ...setting,
      id: typeof setting.id === "string" ? setting.id : `input-${index.toString().padStart(5, "0")}`,
      aliases: Array.isArray(setting.aliases) ? setting.aliases : [],
      keywords: Array.isArray(setting.keywords) ? setting.keywords : [],
      path: Array.isArray(setting.path) ? setting.path : [],
      steps: Array.isArray(setting.steps) ? setting.steps : [],
      related_slugs: Array.isArray(setting.related_slugs) ? setting.related_slugs : [],
      updated_at: typeof setting.updated_at === "string" ? setting.updated_at : "1970-01-01T00:00:00.000Z",
      status: setting.status === "draft" ? "draft" : "published",
    };
  });
}

function loadHealth(path?: string): Map<string, SourceHealth> {
  const map = new Map<string, SourceHealth>();
  if (!path) return map;
  const rows = readJson(path);
  if (!Array.isArray(rows)) throw new Error("source health JSONは配列である必要があります");
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as Partial<SourceHealth>;
    if (typeof item.sourceUrl !== "string" || typeof item.status !== "string") continue;
    map.set(item.sourceUrl, item as SourceHealth);
  }
  return map;
}

function sitemapUrls(path: string): string[] {
  const xml = fs.readFileSync(path, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const options = parseArgs(process.argv.slice(2));
if (!options.input) throw new Error("--input が必要です");
const settings = normalizeSettings(readJson(options.input));
const sourceHealth = loadHealth(options.sourceHealth);
const published = settings.filter((setting) => setting.status !== "draft");
const duplicateGroups = detectDuplicateGroups(published);
const duplicateIds = new Set(duplicateGroups.filter(isStrongDuplicateGroup).flatMap((group) => group.items.map((item) => item.id)));
const intentAlias = selectIntentAliasConsolidation(
  published,
  duplicateGroups.filter((group) => group.reasons.includes("same-intent") || group.reasons.includes("same-path-source")),
);
const expected = new Set(published.filter((setting) => {
  const health = setting.source_url ? sourceHealth.get(setting.source_url) : undefined;
  return !duplicateIds.has(setting.id)
    && !intentAlias.aliasDuplicateIds.has(setting.id)
    && isSettingIndexable(setting)
    && !sourceHealthBlocksIndex(health);
}).map((setting) => `${options.baseUrl}/setting/${setting.slug}?os=${setting.os}`));

const report: Record<string, unknown> = {
  input: options.input,
  totalSettings: settings.length,
  publishedSettings: published.length,
  expectedArticleUrls: expected.size,
  duplicateBlocked: duplicateIds.size + intentAlias.aliasDuplicateIds.size,
  sourceHealthRows: sourceHealth.size,
};

if (options.sitemap) {
  const actual = sitemapUrls(options.sitemap);
  const actualArticles = actual.filter((url) => url.includes("/setting/"));
  const actualSet = new Set(actualArticles);
  report.actualTotalUrls = actual.length;
  report.actualArticleUrls = actualArticles.length;
  report.actualDuplicateUrls = actual.length - new Set(actual).size;
  report.staleArticleUrls = actualArticles.filter((url) => !expected.has(url));
  report.missingArticleUrls = [...expected].filter((url) => !actualSet.has(url));
  report.noindexArticleUrls = actualArticles.filter((url) => !expected.has(url));
}

console.log(JSON.stringify(report, null, 2));
