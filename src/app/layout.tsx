import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { DarkModeScript } from "@/components/DarkMode";
import SiteHeader from "@/components/SiteHeader";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "設定どこ？ - 設定方法・トラブル解決ガイド", template: "%s | 設定どこ？" },
  description: "Windows 11・iPhone・Android・Macの設定方法とトラブル解決を検索。困りごとから最短手順へ案内します。",
  openGraph: {
    title: "設定どこ？ - 設定方法・トラブル解決ガイド",
    description: "設定場所がわからない、うまく動かない。Windows 11・iPhone・Android・Macの解決方法を検索できます。",
    type: "website", locale: "ja_JP", siteName: "設定どこ？", url: BASE_URL,
  },
  twitter: { card: "summary_large_image", title: "設定どこ？ - 設定方法・トラブル解決ガイド", description: "設定方法とトラブル解決を、困っていることばで検索できます。" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <DarkModeScript />
      </head>
      <body>
        <SiteHeader />
        <main className="site-main">
          {children}
        </main>
        <footer className="site-footer no-print">
          <div className="site-footer-links">
            <Link href="/os/windows11" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Windows 11</Link>
            <Link href="/os/ios" style={{ color: "var(--text-muted)", textDecoration: "none" }}>iPhone / iOS</Link>
            <Link href="/os/android" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Android</Link>
            <Link href="/os/macos" style={{ color: "var(--text-muted)", textDecoration: "none" }}>macOS</Link>
            <Link href="/bookmarks" style={{ color: "var(--text-muted)", textDecoration: "none" }}>ブックマーク</Link>
            <Link href="/diagnose" style={{ color: "var(--text-muted)", textDecoration: "none" }}>症状から探す</Link>
            <Link href="/feature/new-pc-setup" style={{ color: "var(--text-muted)", textDecoration: "none" }}>特集</Link>
            <Link href="/editorial-policy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>編集方針</Link>
            <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>プライバシー</Link>
            <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>利用規約</Link>
            <Link href="/contact" style={{ color: "var(--text-muted)", textDecoration: "none" }}>お問い合わせ</Link>
            <Link href="/advertising" style={{ color: "var(--text-muted)", textDecoration: "none" }}>広告・アフィリエイト</Link>
          </div>
          <div className="site-footer-copy">
            © 2026 設定どこ？ — PC・スマホの設定とトラブルを最短で解決
          </div>
          <div className="site-footer-note">
            Windows 11 / iPhone iOS / Android / macOS の設定・トラブル解決サービス
          </div>
        </footer>
      </body>
    </html>
  );
}
