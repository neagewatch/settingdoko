import DiagnoseClient from "./DiagnoseClient";
import type { Metadata } from "next";
import { getAllSettings } from "@/lib/data";
import { OS_LABELS, type OSType, type Setting } from "@/lib/types";
import { searchSettings } from "@/lib/search";

export const revalidate = 60;
export const metadata: Metadata = { title: "症状からトラブル解決方法を探す", description: "Wi-Fi、通知、音声、バッテリー、画面などの困りごとから解決方法を探せます。", alternates: { canonical: "/diagnose" } };

type Target = { label: string; slug?: string; os: OSType; note?: string };
type Option = { label: string; query: string; targets: Target[] };

const OPTION_DEFINITIONS: Option[] = [
  {
    label: "Wi-Fi・ネットがつながらない",
    query: "Wi-Fiが切れる",
    targets: [
      { label: "Windows 11", slug: "trouble-win11-wifi-no-internet", os: "windows11" },
      { label: "iPhone", slug: "trouble-iphone-wifi", os: "ios" },
      { label: "Android", slug: "trouble-android-internet", os: "android" },
      { label: "Mac", slug: "trouble-mac-wifi", os: "macos" },
    ],
  },
  {
    label: "通知が多い・うるさい",
    query: "通知うるさい",
    targets: [
      { label: "Windows 11", slug: "disable-notifications", os: "windows11" },
      { label: "iPhone", slug: "disable-notifications-ios", os: "ios" },
      { label: "Android", slug: "disable-notifications-android", os: "android" },
      { label: "Mac", slug: "disable-notifications-macos", os: "macos" },
    ],
  },
  {
    label: "通知が届かない・表示されない",
    query: "通知が届かない",
    targets: [
      { label: "Windows 11（集中モード）", slug: "trouble13-unique-win-focus-assist-hidden", os: "windows11", note: "集中モードが通知を隠している場合" },
      { label: "iPhone", slug: "trouble-iphone-notifications", os: "ios" },
      { label: "Android", slug: "trouble-android-notifications", os: "android" },
      { label: "Mac", note: "Macの一般的な通知未着記事は準備中です。通知設定からアプリごとの許可を確認してください。", os: "macos" },
    ],
  },
  {
    label: "通知音だけ消したい",
    query: "通知音だけ消したい",
    targets: [
      { label: "Windows 11（Teams・システム音）", slug: "teams-notification-sounds", os: "windows11" },
      { label: "iPhone", slug: "iphone-notification-sounds", os: "ios" },
      { label: "Android", slug: "android-guide-notification-channels", os: "android" },
      { label: "Mac", note: "Macの通知音だけを扱う記事は準備中です。通知設定とサウンド出力を確認してください。", os: "macos" },
    ],
  },
  {
    label: "バッテリーを長持ちさせたい",
    query: "バッテリーを長持ち",
    targets: [
      { label: "iPhone", slug: "trouble-iphone-battery-drain", os: "ios" },
      { label: "Android", slug: "trouble-android-battery-drain", os: "android" },
    ],
  },
  {
    label: "画面が暗い・明るさを変えたい",
    query: "画面を暗くしたい",
    targets: [
      { label: "Windows 11", slug: "change-brightness", os: "windows11" },
      { label: "iPhone", slug: "change-brightness-ios", os: "ios" },
      { label: "Android", slug: "change-brightness-android", os: "android" },
      { label: "Mac", slug: "change-brightness-macos", os: "macos" },
    ],
  },
  {
    label: "Bluetooth機器がつながらない",
    query: "Bluetoothにつながらない",
    targets: [
      { label: "Windows 11", slug: "trouble-win11-bluetooth-pairing", os: "windows11" },
      { label: "iPhone", slug: "trouble-iphone-bluetooth", os: "ios" },
      { label: "Android", slug: "trouble-android-bluetooth", os: "android" },
      { label: "Mac", slug: "trouble-mac-bluetooth-audio", os: "macos" },
    ],
  },
  {
    label: "動作が遅い・容量を空けたい",
    query: "ストレージ 容量",
    targets: [
      { label: "Windows 11", slug: "trouble-win11-storage-full", os: "windows11" },
      { label: "iPhone", slug: "trouble-iphone-storage", os: "ios" },
      { label: "Android", slug: "trouble-android-storage", os: "android" },
      { label: "Mac", slug: "trouble-mac-storage", os: "macos" },
    ],
  },
];

export default async function DiagnosePage() {
  const settings = await getAllSettings();
  const options = OPTION_DEFINITIONS.map((option) => ({
    ...option,
    // 旧slugが整理されても404にならないよう、存在する記事を優先し、
    // 見つからない場合は同じ症状の公開トラブル記事を決定的に選ぶ。
    targets: resolveTargets(option, settings),
  }));

  return <DiagnoseClient options={options} />;
}

function resolveTargets(option: Option, settings: Setting[]): Target[] {
  if (option.targets.length > 0) {
    const resolved: Target[] = [];
    for (const target of option.targets) {
      const exact = target.slug && settings.find((setting) => setting.slug === target.slug && setting.os === target.os);
      if (exact) {
        resolved.push({ ...target, slug: exact.slug });
        continue;
      }
      if (!target.slug) {
        resolved.push(target);
        continue;
      }
      const fallbackCategories = fallbackCategoriesFor(option);
      const fallback = searchSettings(settings, option.query, target.os).find((setting) =>
        fallbackCategories.includes(setting.category),
      );
      resolved.push(fallback
        ? { ...target, slug: fallback.slug, note: target.note || fallback.title }
        : { ...target, slug: undefined, note: target.note || "この端末の対応記事は準備中です。検索から近い記事を探してください。" });
    }
    return resolved;
  }

  const seen = new Set<string>();
  return searchSettings(settings, option.query)
    .filter((setting) => setting.category === "troubleshoot")
    .filter((setting) => {
      if (seen.has(setting.os)) return false;
      seen.add(setting.os);
      return true;
    })
    .slice(0, 4)
    .map((setting) => ({ label: OS_LABELS[setting.os] || setting.os, slug: setting.slug, os: setting.os }));
}

function fallbackCategoriesFor(option: Option): string[] {
  const query = option.query;
  if (/通知音/.test(query)) return ["troubleshoot", "sound", "notification"];
  if (/通知/.test(query)) return ["troubleshoot", "notification"];
  if (/Wi-Fi|ネット/.test(query)) return ["troubleshoot", "network"];
  if (/Bluetooth/.test(query)) return ["troubleshoot", "bluetooth"];
  if (/画面/.test(query)) return ["troubleshoot", "display"];
  if (/ストレージ/.test(query)) return ["troubleshoot", "storage"];
  if (/バッテリー/.test(query)) return ["troubleshoot", "system"];
  return ["troubleshoot"];
}
