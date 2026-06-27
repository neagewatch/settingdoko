import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { DarkModeScript, DarkModeToggle } from "@/components/DarkMode";
import { FontSizeToggle } from "@/components/Utilities";

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
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none", color: "var(--text)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 20 }}>⚙️</span>
              <span style={{ fontWeight: 700, fontSize: 17 }}>設定どこ？</span>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, overflowX: "auto" }}>
              <Link href="/os/windows11" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" }}>Windows</Link>
              <Link href="/os/ios" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" }}>iPhone</Link>
              <Link href="/os/macos" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" }}>Mac</Link>
              <Link href="/bookmarks" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" }}>★ 保存</Link>
            </nav>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <FontSizeToggle />
              <DarkModeToggle />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
          {children}
        </main>

        <footer style={{
          textAlign: "center", padding: "36px 20px",
          fontSize: 13, color: "var(--text-muted)",
          borderTop: "1px solid var(--border)", marginTop: 60,
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12 }}>
            <Link href="/os/windows11" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Windows 11</Link>
            <Link href="/os/ios" style={{ color: "var(--text-muted)", textDecoration: "none" }}>iPhone / iOS</Link>
            <Link href="/os/macos" style={{ color: "var(--text-muted)", textDecoration: "none" }}>macOS</Link>
            <Link href="/bookmarks" style={{ color: "var(--text-muted)", textDecoration: "none" }}>ブックマーク</Link>
            <Link href="/admin" style={{ color: "var(--text-muted)", textDecoration: "none" }}>管理</Link>
          </div>
          © 設定どこ？ — PC・スマホの設定場所を最速で探す
        </footer>
      </body>
    </html>
  );
}
