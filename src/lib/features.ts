import type { OSType } from "./types";

export type Feature = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  os?: OSType;
  slugs?: string[];
  categories?: string[];
};

export const FEATURES: Feature[] = [
  {
    id: "new-pc-setup",
    title: "新しいPC買ったらまずやる設定",
    description: "Windows 11を快適に使うための初期設定チェックリスト",
    emoji: "💻",
    os: "windows11",
    slugs: ["show-file-extensions", "show-hidden-files", "disable-notifications", "change-brightness", "manage-startup-apps", "change-sleep-time", "allow-microphone", "allow-camera"],
  },
  {
    id: "iphone-switch",
    title: "iPhone乗り換え時の設定チェックリスト",
    description: "機種変更・新規購入後にすぐ確認すべきiPhoneの設定",
    emoji: "📱",
    os: "ios",
    slugs: ["setup-faceid", "connect-bluetooth-ios", "change-brightness-ios", "allow-microphone-ios", "disable-notifications-ios", "screen-time-ios", "location-services-ios"],
  },
  {
    id: "privacy-settings",
    title: "プライバシー設定まとめ",
    description: "マイク・カメラ・位置情報のアクセス権限を見直す",
    emoji: "🔒",
    categories: ["privacy", "security"],
  },
  {
    id: "troubleshoot-network",
    title: "ネット・接続トラブル対処集",
    description: "Wi-FiやBluetoothがつながらないときの設定確認ポイント",
    emoji: "📶",
    categories: ["network", "bluetooth"],
  },
  {
    id: "notification-control",
    title: "通知をコントロールする設定まとめ",
    description: "不要な通知を減らして集中できる環境を作る",
    emoji: "🔔",
    categories: ["notification"],
  },
  {
    id: "display-comfort",
    title: "目と画面に優しい表示設定",
    description: "明るさ・夜間モード・解像度を整えて快適に使う",
    emoji: "🖥",
    categories: ["display"],
  },
];
