import { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/data";
import { CATEGORIES, PRIMARY_OS_TYPES } from "@/lib/types";
import { isSettingIndexable } from "@/lib/content-quality";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedSettings = (await getAllSettings()).filter((setting) => setting.status !== "draft");
  const settings = publishedSettings.filter((setting) => isSettingIndexable(setting));

  // 設定詳細ページ（slug×OS）
  const settingUrls = settings.map((s) => ({
    url: `${BASE_URL}/setting/${s.slug}?os=${s.os}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // OS一覧ページ
  const osUrls = PRIMARY_OS_TYPES.map((os) => ({
    url: `${BASE_URL}/os/${os}`,
    lastModified: latestDate(settings.filter((setting) => setting.os === os)),
    changeFrequency: "weekly" as const,
    priority: 0.7,
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
