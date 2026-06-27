"use client";

import { useEffect, useState } from "react";
import { getPopularSearches, getPopularSettings } from "@/lib/analytics";
import Link from "next/link";
import { OS_LABELS } from "@/lib/types";

export function PopularSearches({ staticList }: { staticList: { label: string; q: string }[] }) {
  const [dynamicList, setDynamicList] = useState<{ query: string; count: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDynamicList(getPopularSearches(6));
  }, []);

  // ログが溜まってきたらダイナミックに、初期は静的リスト
  const showDynamic = mounted && dynamicList.length >= 3;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
      {showDynamic
        ? dynamicList.map((item, i) => (
            <Link
              key={item.query}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {i < 3 && <span style={{ fontSize: 11 }}>{["🥇","🥈","🥉"][i]}</span>}
              {item.query}
            </Link>
          ))
        : staticList.map((item) => (
            <Link
              key={item.q}
              href={`/search?q=${encodeURIComponent(item.q)}`}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              {item.label}
            </Link>
          ))}
    </div>
  );
}

export function PopularSettings() {
  const [list, setList] = useState<{ slug: string; os: string; title: string; count: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setList(getPopularSettings(5));
  }, []);

  if (!mounted || list.length < 2) return null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto 48px" }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
        よく見られている設定
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((item, i) => (
          <Link
            key={`${item.slug}-${item.os}`}
            href={`/setting/${item.slug}?os=${item.os}`}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              textDecoration: "none", color: "var(--text)",
            }}
          >
            <span
              className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{item.title}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{OS_LABELS[item.os]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
