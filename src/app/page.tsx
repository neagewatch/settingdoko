import SearchBox from "@/components/SearchBox";
import { PopularSearches, PopularSettings } from "@/components/PopularRanking";
import { RecentlyViewed } from "@/components/UserHistory";
import { KeyboardShortcut } from "@/components/Utilities";
import Link from "next/link";
import { OS_LABELS } from "@/lib/types";
import { getAllSettings } from "@/lib/data";

export const revalidate = 60;

const STATIC_POPULAR = [
  { label: "拡張子表示", q: "拡張子" },
  { label: "Bluetooth", q: "Bluetooth" },
  { label: "画面の明るさ", q: "明るさ" },
  { label: "マイク許可", q: "マイク" },
  { label: "通知オフ", q: "通知" },
  { label: "DNS変更", q: "DNS" },
];

const FEATURES = [
  { id: "new-pc-setup", emoji: "💻", title: "新PC初期設定" },
  { id: "iphone-switch", emoji: "📱", title: "iPhone乗り換え" },
  { id: "privacy-settings", emoji: "🔒", title: "プライバシー設定" },
  { id: "display-comfort", emoji: "🖥", title: "目に優しい表示" },
  { id: "troubleshoot-network", emoji: "📶", title: "ネット接続トラブル" },
  { id: "notification-control", emoji: "🔔", title: "通知コントロール" },
];

export default async function Home() {
  const allSettings = await getAllSettings();
  const recentSettings = [...allSettings]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <div style={{ padding: "72px 0 60px" }}>
      <KeyboardShortcut />

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
          設定、どこ？
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 6 }}>
          PC・スマホの設定場所がわからないを、最速で解決する
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          <kbd className="kbd">/</kbd> キーで検索
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 640, margin: "0 auto 28px" }}>
        <SearchBox large />
      </div>

      {/* Popular searches */}
      <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
        <PopularSearches staticList={STATIC_POPULAR} />
      </div>

      {/* Recently viewed */}
      <RecentlyViewed />

      {/* Popular settings ranking */}
      <PopularSettings />

      {/* Feature collections */}
      <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          特集・まとめ
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {FEATURES.map((f) => (
            <Link key={f.id} href={`/feature/${f.id}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "16px 12px", background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", textDecoration: "none", color: "var(--text)",
              transition: "border-color 0.15s, box-shadow 0.15s",
              textAlign: "center",
            }}>
              <span style={{ fontSize: 24 }}>{f.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{f.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* OS cards */}
      <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          OSから探す
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {(["windows11", "ios", "macos"] as const).map((os) => (
            <Link key={os} href={`/os/${os}`} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "18px 20px",
              textDecoration: "none", color: "var(--text)", fontWeight: 600, fontSize: 14,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}>
              {OS_LABELS[os]}
              <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginTop: 4 }}>
                設定一覧 →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* New arrivals */}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          新着・更新
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentSettings.map((s) => (
            <Link key={s.id} href={`/setting/${s.slug}?os=${s.os}`} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 10,
              textDecoration: "none", color: "var(--text)",
              transition: "border-color 0.15s",
            }}>
              <span style={{ fontSize: 14, flex: 1, fontWeight: 500 }}>{s.title}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{OS_LABELS[s.os]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
