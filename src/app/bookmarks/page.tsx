import { BookmarkList } from "@/components/UserHistory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブックマーク",
  robots: "noindex",
};

export default function BookmarksPage() {
  return (
    <div className="listing-page bookmarks-page" style={{ padding: "32px 0 60px" }}>
      <p className="section-index">SAVED / 保存した設定</p>
      <h1 className="page-title" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>ブックマーク</h1>
      <p className="page-subtitle" style={{ marginBottom: 28 }}>保存した設定ページ</p>
      <BookmarkList />
    </div>
  );
}
