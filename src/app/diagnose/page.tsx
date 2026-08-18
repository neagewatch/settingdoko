import DiagnoseClient from "./DiagnoseClient";
import type { Metadata } from "next";
import { getAllSettings } from "@/lib/data";
import type { OSType } from "@/lib/types";

export const revalidate = 60;
export const metadata: Metadata = { title: "症状から設定を探す", description: "Wi-Fi、通知、バッテリー、画面などの困りごとから設定を探せます。", alternates: { canonical: "/diagnose" } };

type Target = { label: string; slug: string; os: OSType };
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
    label: "通知が多い・届かない",
    query: "通知を消したい",
    targets: [
      { label: "iPhone", slug: "trouble-iphone-notifications", os: "ios" },
      { label: "Android", slug: "trouble-android-notifications", os: "android" },
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
    label: "画面が映らない・見づらい",
    query: "画面を暗くしたい",
    targets: [
      { label: "Windows 11", slug: "trouble-win11-blank-screen", os: "windows11" },
      { label: "iPhone", slug: "trouble-iphone-touchscreen", os: "ios" },
      { label: "Android", slug: "trouble-android-screen", os: "android" },
      { label: "Mac", slug: "trouble-mac-external-display", os: "macos" },
    ],
  },
  {
    label: "Bluetooth機器がつながらない",
    query: "Bluetooth 接続",
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
    // 未公開記事へのリンクを生成しない。公開後は自動的に診断ページへ現れる。
    targets: option.targets.filter((target) => settings.some(
      (setting) => setting.category === "troubleshoot" && setting.slug === target.slug && setting.os === target.os,
    )),
  }));

  return <DiagnoseClient options={options} />;
}
