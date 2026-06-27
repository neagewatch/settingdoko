import { getAllSettings } from "@/lib/data";
import { OS_LABELS, OSType } from "@/lib/types";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Feature = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  os?: OSType;
  slugs?: string[];
  categories?: string[];
};

const FEATURES: Feature[] = [
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
    description: "Wi-FiやBluetoothが繋がらないときの設定確認ポイント",
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
    description: "明るさ・夜間モード・解像度を最適化して快適な作業環境を",
    emoji: "🖥",
    categories: ["display"],
  },
];

type Props = { params: Promise<{ id: string }> };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const feature = FEATURES.find(f => f.id === id);
  if (!feature) return { title: "特集" };
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(feature.emoji + " " + feature.title)}`;
  return {
    title: feature.title,
    description: feature.description,
    openGraph: {
      title: `${feature.title} | 設定どこ？`,
      description: feature.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImageUrl] },
  };
}

export default async function FeaturePage({ params }: Props) {
  const { id } = await params;
  const feature = FEATURES.find(f => f.id === id);
  if (!feature) notFound();

  const allSettings = await getAllSettings();
  let settings = allSettings;

  if (feature.os) settings = settings.filter(s => s.os === feature.os);
  if (feature.slugs) {
    const order = feature.slugs;
    settings = order.map(slug => settings.find(s => s.slug === slug)).filter(Boolean) as typeof settings;
  } else if (feature.categories) {
    settings = settings.filter(s => feature.categories!.includes(s.category));
  }

  return (
    <div style={{ padding: "32px 0 60px" }}>
      <div style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>特集</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 40 }}>{feature.emoji}</span>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{feature.title}</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{feature.description}</p>
        </div>
      </div>

      {feature.os && (
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", background: "var(--surface-2)", padding: "4px 12px", borderRadius: 999, border: "1px solid var(--border)" }}>
            {OS_LABELS[feature.os]}
          </span>
        </div>
      )}

      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>{settings.length}件の設定</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {settings.map((s, i) => (
          <div key={s.id} style={{ position: "relative" }}>
            {feature.slugs && (
              <span style={{
                position: "absolute", left: -32, top: 22, width: 22, height: 22,
                background: "var(--primary)", color: "white", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>{i + 1}</span>
            )}
            <SettingCard setting={s} />
          </div>
        ))}
      </div>

      {/* Other features */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>他の特集</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {FEATURES.filter(f => f.id !== id).map(f => (
            <Link key={f.id} href={`/feature/${f.id}`} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              textDecoration: "none", color: "var(--text)",
            }}>
              <span style={{ fontSize: 20 }}>{f.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{f.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
