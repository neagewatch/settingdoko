"use client";
/* 管理画面を開いた時のサーバー監査結果を同期するためのeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, OS_LABELS } from "@/lib/types";
import type { QualityItem, QualityPriority } from "@/lib/quality-audit";

type QualityResponse = {
  totalArticles: number;
  totalIssues: number;
  counts: Record<QualityPriority, number>;
  items: QualityItem[];
};

type PriorityFilter = "actionable" | "all" | QualityPriority;
const PAGE_SIZE = 100;

function priorityLabel(priority: QualityPriority): string {
  if (priority === "high") return "要修正";
  if (priority === "medium") return "要確認";
  return "軽微";
}

function priorityColor(priority: QualityPriority): { background: string; color: string; border: string } {
  if (priority === "high") return { background: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" };
  if (priority === "medium") return { background: "#FFFBEB", color: "#92400E", border: "#FCD34D" };
  return { background: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" };
}

function statusLabel(status: QualityItem["status"]): string {
  return status === "draft" ? "下書き" : "公開";
}

function metricsLabel(item: QualityItem): string {
  const { metrics } = item;
  return [
    `概要${metrics.descriptionLength}文字`,
    `手順${metrics.stepCount}件・${metrics.stepCharacters}文字`,
    metrics.hasSource ? "情報源あり" : "情報源なし",
    metrics.hasVerifiedDate ? "確認日あり" : "確認日なし",
  ].join(" / ");
}

export default function QualityReviewClient() {
  const [data, setData] = useState<QualityResponse | null>(null);
  const [priority, setPriority] = useState<PriorityFilter>("actionable");
  const [filterOS, setFilterOS] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadQuality = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/quality", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "低品質記事を確認できませんでした");
      setData(body as QualityResponse);
      setPage(1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "低品質記事を確認できませんでした");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadQuality();
  }, [loadQuality]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP");
    return (data?.items || []).filter((item) =>
      (priority === "all" || (priority === "actionable" ? item.priority !== "low" : item.priority === priority)) &&
      (!filterOS || item.os === filterOS) &&
      (!filterStatus || item.status === filterStatus) &&
      (!normalizedQuery || item.title.toLocaleLowerCase("ja-JP").includes(normalizedQuery) || item.slug.toLocaleLowerCase("ja-JP").includes(normalizedQuery)),
    );
  }, [data, filterOS, filterStatus, priority, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" };
  const inputStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" };

  if (loading) {
    return <div style={{ ...cardStyle, padding: 28, color: "var(--text-muted)" }}>全記事の品質を確認中です…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...cardStyle, padding: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>低品質記事の抽出</h2>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              全{data?.totalArticles ?? 0}記事を機械的に確認し、修正優先度の高い記事から表示しています。
            </p>
          </div>
          <button type="button" onClick={() => void loadQuality(true)} disabled={refreshing} style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", cursor: refreshing ? "wait" : "pointer", fontSize: 12, fontWeight: 600 }}>{refreshing ? "確認中…" : "↻ 再確認"}</button>
        </div>
        <p style={{ margin: "14px 0 0", padding: "10px 12px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, color: "#1E40AF", fontSize: 12, lineHeight: 1.7 }}>
          自動判定は修正候補を探すためのものです。短い記事でも正しい場合があるため、内容を確認してから編集してください。画像の有無は品質低下とは判定していません。
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          {(["high", "medium", "low"] as QualityPriority[]).map((level) => {
            const colors = priorityColor(level);
            return <span key={level} style={{ padding: "6px 10px", borderRadius: 8, background: colors.background, color: colors.color, border: `1px solid ${colors.border}`, fontSize: 12, fontWeight: 700 }}>{priorityLabel(level)} {data?.counts[level] ?? 0}件</span>;
          })}
          <span style={{ padding: "6px 10px", color: "var(--text-muted)", fontSize: 12 }}>候補合計 {data?.totalIssues ?? 0}件</span>
        </div>
        {error && <p role="alert" style={{ margin: "14px 0 0", padding: "10px 12px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: 13 }}>{error}</p>}
      </div>

      <div style={{ ...cardStyle, padding: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ ...inputStyle, width: 220 }} placeholder="タイトル・slugで検索" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          <select style={inputStyle} value={priority} onChange={(event) => { setPriority(event.target.value as PriorityFilter); setPage(1); }}>
            <option value="actionable">要修正・要確認</option>
            <option value="all">すべて</option>
            <option value="high">要修正のみ</option>
            <option value="medium">要確認のみ</option>
            <option value="low">軽微のみ</option>
          </select>
          <select style={inputStyle} value={filterOS} onChange={(event) => { setFilterOS(event.target.value); setPage(1); }}>
            <option value="">OS：すべて</option>
            {Object.entries(OS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select style={inputStyle} value={filterStatus} onChange={(event) => { setFilterStatus(event.target.value); setPage(1); }}>
            <option value="">状態：すべて</option>
            <option value="published">公開のみ</option>
            <option value="draft">下書きのみ</option>
          </select>
          <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 12 }}>{filtered.length}件表示 / 候補{data?.totalIssues ?? 0}件</span>
        </div>
      </div>

      {visibleItems.length === 0 && <div style={{ ...cardStyle, padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>条件に一致する低品質記事はありません。</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleItems.map((item) => {
          const colors = priorityColor(item.priority);
          return (
            <article key={item.id} style={{ ...cardStyle, padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 999, background: colors.background, color: colors.color, border: `1px solid ${colors.border}`, fontSize: 11, fontWeight: 700 }}>{priorityLabel(item.priority)}</span>
                    <strong style={{ fontSize: 14 }}>{item.title || "（タイトル未入力）"}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>品質スコア {item.score}/100</span>
                  </div>
                  <div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 11, wordBreak: "break-all" }}>{item.slug}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>
                  <span>{OS_LABELS[item.os] || item.os}</span>
                  <span>{CATEGORIES[item.category] || item.category}</span>
                  <span style={{ padding: "3px 7px", borderRadius: 999, background: item.status === "draft" ? "#FEF3C7" : "#DCFCE7", color: item.status === "draft" ? "#92400E" : "#166534", fontSize: 11, fontWeight: 700 }}>{statusLabel(item.status)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {item.issues.map((issue) => <span key={issue} style={{ padding: "4px 8px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 11 }}>{issue}</span>)}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 10, color: "var(--text-muted)", fontSize: 11 }}>
                <span>{metricsLabel(item)}</span>
                <span>更新 {new Date(item.updated_at).toLocaleDateString("ja-JP")}</span>
                <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                  <Link href={`/admin/settings/${item.id}`} style={{ color: "var(--primary)", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>編集</Link>
                  {item.status === "published" && <Link href={`/setting/${item.slug}?os=${item.os}`} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontSize: 12 }}>公開ページ</Link>}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div style={{ ...cardStyle, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 12 }}>← 前へ</button>
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{page} / {pageCount}ページ</span>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", cursor: page >= pageCount ? "not-allowed" : "pointer", fontSize: 12 }}>次へ →</button>
        </div>
      )}
    </div>
  );
}
