import { MetadataRoute } from "next";
import { getAllSettings } from "@/lib/data";
import { OS_LABELS } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getAllSettings();

  // 設定詳細ページ（slug×OS）
  const settingUrls = settings.map((s) => ({
    url: `${BASE_URL}/setting/${s.slug}?os=${s.os}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // OS比較ページ（重複slug）
  const slugSet = new Set<string>();
  const compareUrls = settings
    .filter((s) => {
      if (slugSet.has(s.slug)) return false;
      slugSet.add(s.slug);
      return true;
    })
    .map((s) => ({
      url: `${BASE_URL}/compare/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // OS一覧ページ
  const osUrls = Object.keys(OS_LABELS).map((os) => ({
    url: `${BASE_URL}/os/${os}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryUrls = [...new Set(settings.map((setting) => setting.category))].map((category) => ({
    url: `${BASE_URL}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 特集ページ
  const featureUrls = [
    "new-pc-setup","iphone-switch","privacy-settings",
    "display-comfort","troubleshoot-network","notification-control",
  ].map((id) => ({
    url: `${BASE_URL}/feature/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...osUrls,
    ...categoryUrls,
    ...featureUrls,
    ...settingUrls,
    ...compareUrls,
  ];
}
