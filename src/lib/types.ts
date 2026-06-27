export type OSType = "windows11" | "ios" | "macos" | "android" | "windows10";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Setting {
  id: string;
  title: string;
  slug: string;
  os: OSType;
  version: string;
  category: string;
  aliases: string[];
  path: string[];
  steps: string[];
  related_slugs: string[];
  keywords: string[];
  description: string;
  updated_at: string;
  view_count?: number;
  helpful_count?: number;
  difficulty?: Difficulty;
  estimate_minutes?: number;
}

export const OS_LABELS: Record<string, string> = {
  windows11: "Windows 11",
  ios: "iPhone / iOS",
  macos: "macOS",
  android: "Android",
  windows10: "Windows 10",
};

export const OS_ICONS: Record<string, string> = {
  windows11: "⊞",
  ios: "",
  macos: "",
  android: "🤖",
  windows10: "⊞",
};

export const CATEGORIES: Record<string, string> = {
  display: "画面・表示",
  sound: "音声・サウンド",
  network: "ネットワーク",
  bluetooth: "Bluetooth",
  privacy: "プライバシー",
  notification: "通知",
  storage: "ストレージ",
  system: "システム",
  input: "入力・キーボード",
  accessibility: "アクセシビリティ",
  security: "セキュリティ",
  file: "ファイル・フォルダ",
  app: "アプリ",
  account: "アカウント",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: "#10B981",
  intermediate: "#F59E0B",
  advanced: "#EF4444",
};

export const ALIAS_MAP: Record<string, string> = {
  "ぶるーとぅーす": "Bluetooth",
  "ぶるーとぅ": "Bluetooth",
  "わいふぁい": "Wi-Fi",
  "わいふぁー": "Wi-Fi",
  "かくちょうし": "拡張子",
  "かくちょし": "拡張子",
  "つうち": "通知",
  "まいく": "マイク",
  "かめら": "カメラ",
  "あかるさ": "明るさ",
  "でぃすぷれい": "ディスプレイ",
  "bluetooth": "Bluetooth",
  "wifi": "Wi-Fi",
  "wi fi": "Wi-Fi",
  "dns": "DNS",
  "mic": "マイク",
  "camera": "カメラ",
};
