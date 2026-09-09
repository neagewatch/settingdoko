"use client";

import { useEffect } from "react";
import { logSearch } from "@/lib/analytics";

const reported = new Set<string>();

export default function SearchTelemetry({
  query,
  resultCount,
  os,
}: {
  query: string;
  resultCount: number;
  os?: string;
}) {
  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    const key = `${cleanQuery.toLowerCase()}\u0000${os || ""}\u0000${resultCount}`;
    if (reported.has(key)) return;
    reported.add(key);
    logSearch(cleanQuery, resultCount);

    // サーバーへ送るのは、記事追加・検索改善に必要な0件検索だけに限定する。
    // 成功した検索語はブラウザ内の最近の検索にだけ残し、サーバーへ送信しない。
    if (resultCount !== 0) return;

    void fetch("/api/search-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: cleanQuery, resultCount: Math.min(500, resultCount), os: os || null }),
      keepalive: true,
    }).catch(() => {});
  }, [query, resultCount, os]);

  return null;
}
