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

    if (resultCount !== 0) return;
    void fetch("/api/search-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: cleanQuery, resultCount, os: os || null }),
      keepalive: true,
    }).catch(() => {});
  }, [query, resultCount, os]);

  return null;
}
