import { BookmarkList } from "@/components/UserHistory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブックマーク",
  robots: "noindex",
};

export default function BookmarksPage() {
  return (
    <div style={{ padding: "32px 0 60px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>★ ブックマーク</h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>保存した設定ページ</p>
      <BookmarkList />
    </div>
  );
}
