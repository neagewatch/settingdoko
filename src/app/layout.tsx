import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { DarkModeScript } from "@/components/DarkMode";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: { default: "設定どこ？ - PC・スマホの設定ナビ", template: "%s | 設定どこ？" },
  description: "「設定の場所がわからない」を最速で解決。Windows・iPhone・Macの設定場所を検索して最短導線で設定にたどりつけます。",
  openGraph: {
    title: "設定どこ？ - PC・スマホの設定ナビ",
    description: "「設定の場所がわからない」を最速で解決。設定場所を検索できます。",
    type: "website", locale: "ja_JP",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <DarkModeScript />
      </head>
      <body>
        <SiteHeader />
        <main style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px" }}>
          {children}
        </main>
        <footer style={{
          textAlign: "center", padding: "40px 24px",
          fontSize: 13, color: "var(--text-muted)",
          borderTop: "1px solid var(--border)", marginTop: 64,
        }} className="no-print">
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
            <Link href="/os/windows11" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Windows 11</Link>
            <Link href="/os/ios" style={{ color: "var(--text-muted)", textDecoration: "none" }}>iPhone / iOS</Link>
            <Link href="/os/macos" style={{ color: "var(--text-muted)", textDecoration: "none" }}>macOS</Link>
            <Link href="/os/android" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Android</Link>
            <Link href="/bookmarks" style={{ color: "var(--text-muted)", textDecoration: "none" }}>ブックマーク</Link>
            <Link href="/feature/new-pc-setup" style={{ color: "var(--text-muted)", textDecoration: "none" }}>特集</Link>
            <Link href="/admin" style={{ color: "var(--text-muted)", textDecoration: "none" }}>管理</Link>
          </div>
          <div style={{ marginBottom: 8 }}>
            © 2024 設定どこ？ — PC・スマホの設定場所を最速で探す
          </div>
          <div style={{ fontSize: 12 }}>
            Windows 11 / iPhone iOS / macOS の設定ナビゲーションサービス
          </div>
        </footer>
      </body>
    </html>
  );
}
