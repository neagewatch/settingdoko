import { MetadataRoute } from "next";
import { getAllSettings, getStoredSourceHealth } from "@/lib/data";
import { APP_PLATFORM_TYPES, CATEGORIES, PRIMARY_OS_TYPES } from "@/lib/types";
import { isSettingIndexable } from "@/lib/content-quality";
import { sourceHealthBlocksIndex } from "@/lib/content-operations";
import { detectDuplicateGroups, isStrongDuplicateGroup, selectIntentAliasConsolidation } from "@/lib/duplicate-detection";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

// DB側の記事・情報源ヘルスが更新された後も、再デプロイなしで
// サイトマップの公開対象を追随させる。情報源監査との不一致を長時間残さないため5分ごとに再生成する。
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allSettings, sourceHealth] = await Promise.all([getAllSettings(), getStoredSourceHealth()]);
  const publishedSettings = allSettings.filter((setting) => setting.status !== "draft");
  const allDuplicateGroups = detectDuplicateGroups(publishedSettings);
  const duplicateGroups = allDuplicateGroups.filter((group) => isStrongDuplicateGroup(group));
  const duplicateIds = new Set(duplicateGroups.flatMap((group) => group.items.map((item) => item.id)));
  const intentAlias = selectIntentAliasConsolidation(publishedSettings, allDuplicateGroups.filter((group) => group.reasons.includes("same-intent") || group.reasons.includes("same-path-source")));
  const settings = publishedSettings.filter((setting) => {
    const health = setting.source_url ? sourceHealth.get(setting.source_url) : undefined;
    return !duplicateIds.has(setting.id)
      && !intentAlias.aliasDuplicateIds.has(setting.id)
      && isSettingIndexable(setting)
      && !sourceHealthBlocksIndex(health);
  });

  // 設定詳細ページ（slug×OS）
  const settingUrls = settings.map((s) => ({
    url: `${BASE_URL}/setting/${s.slug}?os=${s.os}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // OS一覧ページ
  const osUrls = PRIMARY_OS_TYPES
    .filter((os) => settings.some((setting) => setting.os === os))
    .map((os) => ({
      url: `${BASE_URL}/os/${os}`,
      lastModified: latestDate(settings.filter((setting) => setting.os === os)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // アプリ・ブラウザも記事が存在するプラットフォームだけ掲載する。
  // 空の一覧ページをサイトマップへ増やさないため、品質判定後の件数で絞る。
  const appUrls = APP_PLATFORM_TYPES
    .filter((platform) => settings.some((setting) => setting.os === platform))
    .map((platform) => ({
      url: `${BASE_URL}/os/${platform}`,
      lastModified: latestDate(settings.filter((setting) => setting.os === platform)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const categoryUrls = [...new Set(settings.map((setting) => setting.category))].filter((category) => CATEGORIES[category]).map((category) => ({
    url: `${BASE_URL}/category/${category}`,
    lastModified: latestDate(settings.filter((setting) => setting.category === category)),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 特集ページ
  const featureUrls = [
    "new-pc-setup","iphone-switch","privacy-settings",
    "display-comfort","troubleshoot-network","notification-control",
  ].map((id) => ({
    url: `${BASE_URL}/feature/${id}`,
    lastModified: latestDate(publishedSettings),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const informationUrls = ["apps", "editorial-policy", "privacy", "terms", "contact", "advertising"].map((path) => ({
    url: `${BASE_URL}/${path}`,
    lastModified: latestDate(settings),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [
    { url: BASE_URL, lastModified: latestDate(publishedSettings), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/diagnose`, lastModified: latestDate(publishedSettings), changeFrequency: "weekly", priority: 0.8 },
    ...osUrls,
    ...appUrls,
    ...categoryUrls,
    ...featureUrls,
    ...informationUrls,
    ...settingUrls,
  ];
}

function latestDate(settings: { updated_at: string }[]): Date {
  const timestamps = settings.map((setting) => Date.parse(setting.updated_at)).filter(Number.isFinite);
  return new Date(timestamps.length ? Math.max(...timestamps) : Date.UTC(2026, 0, 1));
}
