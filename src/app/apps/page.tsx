import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedStats } from "@/lib/data";
import { APP_PLATFORM_TYPES, OS_LABELS, type AppPlatformType } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "アプリ・ブラウザの設定とトラブル解決",
  description: "Word、Excel、Teams、Outlook、Chrome、Edge、LINEなどの設定方法とトラブル解決ガイドを探せます。",
  alternates: { canonical: "/apps" },
};

const GROUPS: Array<{ title: string; platforms: AppPlatformType[] }> = [
  { title: "Microsoft Office・仕事", platforms: ["word", "excel", "powerpoint", "outlook", "teams", "power_automate"] },
  { title: "ブラウザ", platforms: ["chrome", "edge", "firefox", "safari"] },
  { title: "Googleサービス", platforms: ["gmail", "google_calendar", "google_drive", "youtube"] },
  { title: "連絡・会議", platforms: ["line", "slack", "zoom"] },
  { title: "そのほか", platforms: ["ipados", "acrobat"] },
];

export default async function AppsPage() {
  const stats = await getPublishedStats();
  const available = new Set(APP_PLATFORM_TYPES.filter((platform) => (stats.byPlatform[platform] || 0) > 0));

  return (
    <div className="listing-page apps-page" style={{ padding: "32px 0 64px" }}>
      <nav className="breadcrumb" aria-label="パンくず" style={{ marginBottom: 24 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>›</span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>アプリ・ブラウザ</span>
      </nav>

      <header className="listing-heading">
        <p className="section-index">APPS / アプリから探す</p>
        <h1>アプリ・ブラウザの設定とトラブル解決</h1>
        <p>使っているアプリを選ぶと、設定方法と困りごとの解決手順を確認できます。</p>
      </header>

      {GROUPS.map((group) => {
        const platforms = group.platforms.filter((platform) => available.has(platform));
        if (!platforms.length) return null;
        return (
          <section key={group.title} className="apps-group" aria-labelledby={`apps-${group.platforms[0]}`}>
            <h2 id={`apps-${group.platforms[0]}`}>{group.title}</h2>
            <div className="apps-grid">
              {platforms.map((platform) => (
                <Link key={platform} href={`/os/${platform}`} className="app-index-card">
                  <strong>{OS_LABELS[platform]}</strong>
                  <span>{stats.byPlatform[platform]}件のガイド</span>
                  <b aria-hidden="true">→</b>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
