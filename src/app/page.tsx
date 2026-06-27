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

const APPS = [
  { slug: "outlook-add-account", label: "Outlook", emoji: "📧", color: "#0078D4", desc: "メール・予定表" },
  { slug: "teams-schedule-meeting", label: "Teams", emoji: "💬", color: "#6264A7", desc: "会議・チャット" },
  { slug: "excel-filter", label: "Excel", emoji: "📊", color: "#217346", desc: "表計算・グラフ" },
  { slug: "word-page-numbers", label: "Word", emoji: "📝", color: "#2B579A", desc: "文書作成" },
  { slug: "ppt-slide-master", label: "PowerPoint", emoji: "📽", color: "#D24726", desc: "プレゼン資料" },
  { slug: "power-automate-create-flow", label: "Power Automate", emoji: "⚡", color: "#0066FF", desc: "業務自動化" },
  { slug: "zoom-virtual-background", label: "Zoom", emoji: "🎥", color: "#2D8CFF", desc: "ビデオ会議" },
  { slug: "slack-notifications", label: "Slack", emoji: "💼", color: "#4A154B", desc: "チームチャット" },
  { slug: "chrome-add-extension", label: "Chrome", emoji: "🌐", color: "#4285F4", desc: "ブラウザ" },
  { slug: "google-drive-share", label: "Google Drive", emoji: "☁️", color: "#34A853", desc: "クラウド共有" },
  { slug: "acrobat-reorder-pages", label: "Acrobat", emoji: "📄", color: "#FF0000", desc: "PDF編集" },
];

export default async function Home() {
  const allSettings = await getAllSettings();
  const recentSettings = [...allSettings]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const sectionTitle = {
    fontSize: 13, fontWeight: 600, color: "var(--text-muted)" as const,
    textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 14,
  };

  return (
    <div style={{ padding: "72px 0 60px" }}>
      <KeyboardShortcut />

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
          設定、どこ？
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 6 }}>
          PC・スマホ・業務アプリの設定場所を最速で解決する
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

      {/* OS cards */}
      <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
        <h2 style={sectionTitle}>OSから探す</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {([
            { os: "windows11", icon: "⊞" },
            { os: "ios", icon: "" },
            { os: "macos", icon: "" },
            { os: "android", icon: "🤖" },
          ] as const).map(({ os, icon }) => (
            <Link key={os} href={`/os/${os}`} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "16px 14px",
              textDecoration: "none", color: "var(--text)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              textAlign: "center", transition: "border-color 0.15s, box-shadow 0.15s",
            }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{OS_LABELS[os].split(" / ")[0]}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>設定一覧 →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* App cards */}
      <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
        <h2 style={sectionTitle}>アプリから探す</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          {APPS.map((app) => (
            <Link
              key={app.slug}
              href={`/setting/${app.slug}?os=windows11`}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "14px 10px",
                textDecoration: "none", color: "var(--text)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                textAlign: "center", transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              {/* アプリアイコン風の丸 */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${app.color}18`,
                border: `1px solid ${app.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>
                {app.emoji}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{app.label}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>{app.desc}</span>
            </Link>
          ))}
        </div>
        {/* アプリ一覧へのリンク */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link href="/search?q=Microsoft 365" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>
            すべての業務ソフト設定を見る →
          </Link>
        </div>
      </div>

      {/* Feature collections */}
      <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
        <h2 style={sectionTitle}>特集・まとめ</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {FEATURES.map((f) => (
            <Link key={f.id} href={`/feature/${f.id}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "16px 12px", background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", textDecoration: "none", color: "var(--text)",
              textAlign: "center", transition: "border-color 0.15s",
            }}>
              <span style={{ fontSize: 24 }}>{f.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{f.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* New arrivals */}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={sectionTitle}>新着・更新</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentSettings.map((s) => (
            <Link key={s.id} href={`/setting/${s.slug}?os=${s.os}`} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 10,
              textDecoration: "none", color: "var(--text)",
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
