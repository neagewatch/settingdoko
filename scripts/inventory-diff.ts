import fs from "node:fs";
import { loadLocalCandidateSettings } from "./candidate-dataset";
import { canonicalSlug } from "../src/lib/duplicate-detection";
import type { Setting } from "../src/lib/types";

const argv = process.argv.slice(2);
const productionPath = argv[argv.indexOf("--production") + 1];
const outputPath = argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : undefined;
if (!productionPath) throw new Error("--production <published.json> が必要です");

const local = loadLocalCandidateSettings();
const production = JSON.parse(fs.readFileSync(productionPath, "utf8")) as Setting[];
const key = (setting: Pick<Setting, "slug" | "os">) => `${setting.slug}\u0000${setting.os}`;
const localMap = new Map(local.map((setting) => [key(setting), setting]));
const productionMap = new Map(production.map((setting) => [key(setting), setting]));
const localOnly = [...localMap.entries()].filter(([itemKey]) => !productionMap.has(itemKey)).map(([, setting]) => setting);
const productionOnly = [...productionMap.entries()].filter(([itemKey]) => !localMap.has(itemKey)).map(([, setting]) => setting);

function counts(rows: Setting[]) {
  return {
    total: rows.length,
    sourceBacked: rows.filter((setting) => Boolean(setting.source_url)).length,
    verified: rows.filter((setting) => Boolean(setting.verified_at)).length,
    draft: rows.filter((setting) => setting.status === "draft").length,
    byOS: Object.fromEntries([...new Set(rows.map((setting) => setting.os))].sort().map((os) => [os, rows.filter((setting) => setting.os === os).length])),
  };
}

const productionByCanonical = new Map<string, Setting[]>();
for (const setting of productionOnly) {
  const canonical = `${canonicalSlug(setting.slug)}\u0000${setting.os}`;
  productionByCanonical.set(canonical, [...(productionByCanonical.get(canonical) || []), setting]);
}
const likelyRenamed = localOnly.filter((setting) => productionByCanonical.has(`${canonicalSlug(setting.slug)}\u0000${setting.os}`)).length;
const report = {
  generatedAt: new Date().toISOString(),
  localCandidates: local.length,
  productionVisible: production.length,
  keyIntersection: local.length - localOnly.length,
  netDifference: local.length - production.length,
  localOnly: counts(localOnly),
  productionOnly: counts(productionOnly),
  likelyRenamedByCanonicalSlug: likelyRenamed,
  explanation: "slug×OSの完全一致ではなく、候補生成元と本番スナップショットの世代・投入範囲が異なるため、差分は新規候補と本番専用/旧記事の対称差分として扱う。自動削除・自動投入はしない。",
  localOnlySample: localOnly.slice(0, 20).map((setting) => ({ slug: setting.slug, os: setting.os, title: setting.title, source: Boolean(setting.source_url), verified: Boolean(setting.verified_at) })),
  productionOnlySample: productionOnly.slice(0, 20).map((setting) => ({ slug: setting.slug, os: setting.os, title: setting.title, source: Boolean(setting.source_url), verified: Boolean(setting.verified_at) })),
};
if (outputPath) fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
