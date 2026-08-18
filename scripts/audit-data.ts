import { allSampleSettings } from "../src/lib/sample-data-export";
import { CATEGORIES, getStepText, isOSType, PRIMARY_OS_TYPES, type Setting } from "../src/lib/types";
import { microsoft365Settings } from "./microsoft365-data.mjs";
import { microsoft365Wave2Settings } from "./microsoft365-wave2-data.mjs";
import { windowsSettings } from "./generate-windows-sql.mjs";
import { allAdditional } from "./generate-all-additional-sql.mjs";
import { appleSettings } from "./generate-apple-sql.mjs";
import { officialSettings } from "./official-settings-data.mjs";
import { bulkSettings } from "./official-settings-bulk-data.mjs";
import { extraWindowsSettings } from "./windows11-expansion-data.mjs";
import { troubleshootingSettings } from "./troubleshooting-data.mjs";
import { troubleshootingWave5Settings } from "./troubleshooting-wave5-data.mjs";
import { troubleshootingWave6Settings } from "./troubleshooting-wave6-data.mjs";
import { troubleshootingWave7Settings } from "./troubleshooting-wave7-data.mjs";
import { troubleshootingBulkSettings } from "./troubleshooting-bulk-data.mjs";
import { troubleshootingExpansionSettings } from "./troubleshooting-expansion-data.mjs";
import { troubleshootingFocusedSettings } from "./troubleshooting-focused-data.mjs";
import { errorCodeDeepSettings } from "./error-code-deep-data.mjs";
import { troubleshootingHighDemandSettings } from "./troubleshooting-high-demand-data.mjs";
import { troubleshootingUniqueSettings } from "./troubleshooting-unique-data.mjs";
import { consolidateCandidates, getConsolidationReport } from "./consolidate-candidates.mjs";
import { wave3Settings } from "./official-settings-wave3-data.mjs";
import { wave4Settings } from "./official-settings-wave4-data.mjs";

const errors: string[] = [];
const warnings: string[] = [];
const keys = new Set<string>();
const slugs = new Set<string>();
const rawSettings = [
  ...microsoft365Settings,
  ...microsoft365Wave2Settings,
  ...allSampleSettings,
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
];
const consolidatedSettings = consolidateCandidates(rawSettings);
const consolidationReport = getConsolidationReport(rawSettings);
const titleKey = (title: string) => title.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/[「」『』（）()【】\s・:：]/g, "");
const consolidatedTitleMap = new Map<string, string[]>();
for (const setting of consolidatedSettings) {
  const key = titleKey(setting.title);
  const slugsForTitle = consolidatedTitleMap.get(key) || [];
  slugsForTitle.push(setting.slug);
  consolidatedTitleMap.set(key, slugsForTitle);
}
const uniquePackTitleDuplicates = troubleshootingUniqueSettings
  .map((setting: { title: string; slug: string }) => ({ title: setting.title, slug: setting.slug, matches: consolidatedTitleMap.get(titleKey(setting.title)) || [] }))
  .filter((item: { title: string; slug: string; matches: string[] }) => item.matches.some((slug: string) => slug !== item.slug));
for (const duplicate of uniquePackTitleDuplicates) {
  errors.push(`新規重複タイトル: ${duplicate.title} (${duplicate.slug} / ${duplicate.matches.filter((slug: string) => slug !== duplicate.slug).join(", ")})`);
}
const slugOS = new Map<string, string>();
for (const setting of consolidatedSettings) {
  const previousOS = slugOS.get(setting.slug);
  if (previousOS && previousOS !== setting.os) {
    errors.push(`DB制約に抵触するslug重複: ${setting.slug} (${previousOS} / ${setting.os})`);
  } else {
    slugOS.set(setting.slug, setting.os);
  }
}
// 本番DBのsettings_slug_key（slug単独）と同じ単位で監査する。
const settings = [...new Map(consolidatedSettings.map((setting) => [setting.slug, setting])).values()] as Setting[];

for (const [index, setting] of settings.entries()) {
  const label = `${setting.os}/${setting.slug || `index-${index}`}`;
  const key = setting.slug;
  if (keys.has(key)) errors.push(`重複: ${label}`);
  keys.add(key);
  slugs.add(setting.slug);

  if (!isOSType(setting.os)) errors.push(`OS不正: ${label}`);
  if (!CATEGORIES[setting.category]) errors.push(`カテゴリ不正: ${label} (${setting.category})`);
  if (!setting.title.trim()) errors.push(`タイトル空: ${label}`);
  if (!setting.path.length) errors.push(`設定場所なし: ${label}`);
  if (!setting.steps.length || setting.steps.some((step) => !getStepText(step).trim())) errors.push(`手順なし: ${label}`);
  if (setting.source_url && !/^https?:\/\//.test(setting.source_url)) warnings.push(`情報源URL確認: ${label}`);
  if (!setting.verified_at) warnings.push(`未検証日: ${label}`);
}

for (const setting of settings) {
  for (const relatedSlug of setting.related_slugs) {
    if (!slugs.has(relatedSlug)) warnings.push(`関連slug未登録: ${setting.os}/${setting.slug} -> ${relatedSlug}`);
  }
}

const primaryCounts = Object.fromEntries(PRIMARY_OS_TYPES.map((os) => [os, settings.filter((setting) => setting.os === os).length]));
console.log(`候補データ件数（重複除外）: ${settings.length}`);
console.log(`類似候補の統合: ${consolidationReport.before}件 -> ${consolidationReport.after}件（${consolidationReport.duplicateRows}件削減）`);
console.log(`主対象件数: ${JSON.stringify(primaryCounts)}`);
console.log(`検証日あり: ${settings.filter((setting) => Boolean(setting.verified_at)).length}`);
console.log(`情報源URLあり: ${settings.filter((setting) => Boolean(setting.source_url)).length}`);
console.log(`今回追加パック: ${troubleshootingUniqueSettings.length}件 / 完全一致タイトル重複: ${uniquePackTitleDuplicates.length}件`);

for (const warning of warnings.slice(0, 20)) console.warn(`WARN ${warning}`);
if (warnings.length > 20) console.warn(`WARN …ほか${warnings.length - 20}件`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log("データ監査: OK");
}
