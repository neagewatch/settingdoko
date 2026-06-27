"use client";

import { useEffect, useState } from "react";
import { getRecentViews, getBookmarks, ViewLogEntry, Bookmark } from "@/lib/analytics";
import Link from "next/link";
import { OS_LABELS } from "@/lib/types";

export function RecentlyViewed() {
  const [items, setItems] = useState<ViewLogEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getRecentViews(5));
  }, []);

  if (!mounted || items.length < 2) return null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto 40px" }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        最近見た設定
      </h2>
      <div className="recent-strip">
        {items.map((item, i) => (
          <Link
            key={`${item.slug}-${item.os}-${i}`}
            href={`/setting/${item.slug}?os=${item.os}`}
            className="recent-chip"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BookmarkList() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getBookmarks());
  }, []);

  if (!mounted || items.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      <p style={{ fontSize: 36, marginBottom: 12 }}>☆</p>
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>ブックマークがありません</p>
      <p style={{ fontSize: 14 }}>設定ページの ☆ ボタンで保存できます</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <Link
          key={`${item.slug}-${item.os}`}
          href={`/setting/${item.slug}?os=${item.os}`}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 18px", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: "var(--radius)",
            textDecoration: "none", color: "var(--text)",
            transition: "border-color 0.15s",
          }}
        >
          <span style={{ fontSize: 18, color: "var(--warn)" }}>★</span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{item.title}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{OS_LABELS[item.os]}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>→</span>
        </Link>
      ))}
    </div>
  );
}
