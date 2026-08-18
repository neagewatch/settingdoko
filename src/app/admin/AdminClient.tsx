"use client";
/* localStorageの運営用集計を初回クライアント表示へ同期するeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { getZeroHitSearches, getPopularSearches, getPopularSettings } from "@/lib/analytics";
import { getStepImage, Setting, OS_LABELS, CATEGORIES } from "@/lib/types";
import type { ContentRequest, ContentReport, ServerZeroHitSearch } from "@/lib/data";
import Link from "next/link";

type DraftPackSummary = { total: number; byOS: Record<string, number>; byCategory: Record<string, number> };
type DraftPackInfo = DraftPackSummary & { packs?: { all?: DraftPackSummary; troubleshoot?: DraftPackSummary; troubleshootUnique?: DraftPackSummary } };
type ImportScope = "all" | "troubleshoot" | "troubleshootUnique";
type ImportMode = "new" | "draft";

export default function AdminClient({ settings: initialSettings, contentRequests, contentReports, serverZeroHitSearches }: { settings: Setting[]; contentRequests: ContentRequest[]; contentReports: ContentReport[]; serverZeroHitSearches: ServerZeroHitSearch[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [zeroHits, setZeroHits] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [popularSettings, setPopularSettings] = useState<{ slug: string; os: string; title: string; count: number }[]>([]);
  const [reports, setReports] = useState(contentReports);
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshingSettings, setRefreshingSettings] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOS, setFilterOS] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterImage, setFilterImage] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [activeTab, setActiveTab] = useState<"data" | "analytics" | "ai" | "reports" | "requests">("data");
  const [importing, setImporting] = useState<{ scope: ImportScope; mode: ImportMode } | null>(null);
  const [draftPackInfo, setDraftPackInfo] = useState<DraftPackInfo | null>(null);
  const [consolidating, setConsolidating] = useState(false);
  const [requests, setRequests] = useState(contentRequests);

  // AI Assist
  const [aiTitle, setAiTitle] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [aiOS, setAiOS] = useState("windows11");
  const [aiPath, setAiPath] = useState("");
  const [aiResult, setAiResult] = useState<{ aliases: string[]; keywords: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const refreshSettings = useCallback(async () => {
    setRefreshingSettings(true);
    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.settings)) throw new Error(data.error || "下書きデータを取得できませんでした");
      setSettings(data.settings as Setting[]);
      setSettingsLoadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "下書きデータを取得できませんでした";
      setSettingsLoadError(message);
    } finally {
      setRefreshingSettings(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void refreshSettings();
    setZeroHits(getZeroHitSearches(10));
    setPopularSearches(getPopularSearches(8));
    setPopularSettings(getPopularSettings(5));
    fetch("/api/admin/import-drafts").then((response) => response.ok ? response.json() : null).then((data) => { if (data) setDraftPackInfo(data); }).catch(() => {});
  }, [refreshSettings]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    setDeleting(id);
    try {
      const response = await fetch("/api/settings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "削除できませんでした");
      setSettings((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } catch (e) { alert(e instanceof Error ? e.message : "削除できませんでした"); }
    finally { setDeleting(null); }
  }

  async function handleBulkStatus(status: "published" | "draft") {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const label = status === "published" ? "公開" : "非公開（下書き）";
    if (!confirm(`選択した${ids.length}件を${label}に変更しますか？`)) return;
    setBulkUpdating(true);
    try {
      const response = await fetch("/api/admin/settings/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "公開状態を更新できませんでした");
      const publishedAt = status === "published" ? new Date().toISOString() : null;
      setSettings((items) => items.map((item) => ids.includes(item.id) ? { ...item, status, published_at: publishedAt } : item));
      setSelectedIds(new Set());
      alert(`${data.updated ?? ids.length}件を${label}に変更しました`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "公開状態を更新できませんでした");
    } finally {
      setBulkUpdating(false);
    }
  }

  async function handleAiGenerate() {
    if (!aiTitle.trim()) return;
    setAiLoading(true); setAiError(""); setAiResult(null);
    try {
      const res = await fetch("/api/ai-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: aiTitle, description: aiDesc, os: aiOS, path: aiPath }) });
      const data = await res.json();
      if (data.error) { setAiError(data.error); return; }
      setAiResult(data);
    } catch { setAiError("エラーが発生しました"); }
    finally { setAiLoading(false); }
  }

  async function importDraftPack(scope: ImportScope, mode: ImportMode) {
    const allSummary = draftPackInfo?.packs?.all || draftPackInfo;
    const troubleSummary = draftPackInfo?.packs?.troubleshoot;
    const selectedSummary = scope === "troubleshoot" ? troubleSummary : allSummary;
    const label = scope === "troubleshoot"
      ? "トラブル解決"
      : scope === "troubleshootUnique"
        ? "今回の重複しないトラブル記事"
        : "設定・トラブル候補";
    const countText = selectedSummary ? `${selectedSummary.total}件` : "候補";
    const message = mode === "draft"
      ? `${label}${countText}を下書きに同期します。新しい記事を追加し、同じ候補の公開記事も下書きに変更します。公開中の記事が非公開になります。続けますか？`
      : `${label}${countText}のうち、まだ存在しない記事だけを下書きとして保存します。既存記事は変更しません。続けますか？`;
    if (!confirm(message)) return;
    setImporting({ scope, mode });
    try {
      const response = await fetch("/api/admin/import-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error([data.error || "下書き保存に失敗しました", data.detail].filter(Boolean).join("\n"));
      const changedText = mode === "draft" ? `公開から下書きへ ${data.demoted}件` : `既存の公開記事 ${data.existingPublished}件`;
      alert(`新しい下書き ${data.inserted}件を保存しました。${changedText}。既存の下書き ${data.existingDraft}件。`);
      setFilterStatus("draft");
      await refreshSettings();
    } catch (error) { alert(error instanceof Error ? error.message : "下書き保存に失敗しました"); }
    finally { setImporting(null); }
  }

  async function handleConsolidateDrafts() {
    setConsolidating(true);
    try {
      const previewResponse = await fetch("/api/admin/consolidate-troubleshooting", { cache: "no-store" });
      const preview = await previewResponse.json().catch(() => ({}));
      if (!previewResponse.ok) throw new Error(preview.error || "統合候補を確認できませんでした");
      if (!preview.duplicateDraftRows) {
        alert("統合できる下書き候補はありません。公開記事を含むグループは安全のため変更していません。");
        return;
      }
      const confirmed = confirm(
        "同じテーマの下書き候補を" + preview.mergeableGroups + "グループにまとめ、重複する" + preview.duplicateDraftRows + "件を削除します。公開記事は変更しません。続けますか？",
      );
      if (!confirmed) return;
      const response = await fetch("/api/admin/consolidate-troubleshooting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error([data.error, data.detail].filter(Boolean).join("\n") || "類似候補を統合できませんでした");
      alert((data.mergedGroups ?? 0) + "グループを統合し、" + (data.deletedRows ?? 0) + "件の重複候補を整理しました。");
      await refreshSettings();
    } catch (error) {
      alert(error instanceof Error ? error.message : "類似候補を統合できませんでした");
    } finally {
      setConsolidating(false);
    }
  }

  async function updateRequestStatus(id: string, status: ContentRequest["status"]) {
    const response = await fetch("/api/admin/content-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { alert("状態を更新できませんでした"); return; }
    setRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  async function updateReportStatus(id: string, status: ContentReport["status"]) {
    const response = await fetch("/api/admin/content-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { alert("状態を更新できませんでした"); return; }
    setReports((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  const filtered = settings.filter((s) =>
    (!filterOS || s.os === filterOS) &&
    (!filterCat || s.category === filterCat) &&
    (!filterStatus || s.status === filterStatus) &&
    (!filterImage || (filterImage === "with"
      ? Boolean(s.screenshot_url || s.steps.some((step) => getStepImage(step).image_url))
      : !s.screenshot_url && !s.steps.some((step) => getStepImage(step).image_url))) &&
    (!filterQ || s.title.includes(filterQ) || s.slug.includes(filterQ))
  );
  const allVisibleSelected = filtered.length > 0 && filtered.every((item) => selectedIds.has(item.id));
  const draftCount = settings.filter((item) => item.status === "draft").length;
  const publishedCount = settings.length - draftCount;

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) filtered.forEach((item) => next.delete(item.id));
      else filtered.forEach((item) => next.add(item.id));
      return next;
    });
  }

  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 };
  const inp = { padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" };
  const tabBtn = (t: typeof activeTab) => ({
    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
    background: activeTab === t ? "var(--primary)" : "var(--surface-2)",
    color: activeTab === t ? "white" : "var(--text-secondary)",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={tabBtn("data")} onClick={() => setActiveTab("data")}>📋 データ管理</button>
        <button style={tabBtn("analytics")} onClick={() => setActiveTab("analytics")}>📊 アナリティクス</button>
        <button style={tabBtn("ai")} onClick={() => setActiveTab("ai")}>🤖 AI補助</button>
        <button style={tabBtn("reports")} onClick={() => setActiveTab("reports")}>🚩 報告 {reports.length > 0 && `(${reports.length})`}</button>
        <button style={tabBtn("requests")} onClick={() => setActiveTab("requests")}>💡 追加リクエスト {requests.length > 0 && `(${requests.length})`}</button>
        <Link href="/admin/duplicates" style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", borderRadius: 8, background: "#FFF7ED", color: "#9A3412", border: "1px solid #FDBA74", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>🔎 重複チェック</Link>
        <Link href="/admin/quality" style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", borderRadius: 8, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #93C5FD", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>🧹 低品質記事</Link>
      </div>

      {/* ===== DATA TAB ===== */}
      {activeTab === "data" && (
        <div>
          {/* Filters + Add button */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input style={{ ...inp, width: 180 }} placeholder="タイトル/slug検索" value={filterQ} onChange={(e) => setFilterQ(e.target.value)} />
            <select style={inp} value={filterOS} onChange={(e) => setFilterOS(e.target.value)}>
              <option value="">すべてのOS</option>
              {Object.entries(OS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select style={inp} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="">すべてのカテゴリ</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select style={inp} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">公開状態：すべて</option>
              <option value="published">公開のみ</option>
              <option value="draft">下書きのみ</option>
            </select>
            <select style={inp} value={filterImage} onChange={(e) => setFilterImage(e.target.value)}>
              <option value="">画像：すべて</option>
              <option value="with">画像あり</option>
              <option value="without">画像なし</option>
            </select>
            <button type="button" onClick={() => void refreshSettings()} disabled={refreshingSettings} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", cursor: refreshingSettings ? "wait" : "pointer", fontSize: 12, fontWeight: 600 }}>
              {refreshingSettings ? "更新中…" : "↻ 最新に更新"}
            </button>
            <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>{filtered.length}件表示 / 全{settings.length}件</span>
            <Link
              href="/admin/settings/new"
              style={{ display: "inline-flex", alignItems: "center", padding: "8px 18px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              ＋ 新規追加
            </Link>
            <button onClick={() => void importDraftPack("troubleshoot", "draft")} disabled={importing !== null} style={{ padding: "8px 14px", borderRadius: 8, background: "#FFF7ED", color: "#C2410C", border: "1px solid #FDBA74", cursor: importing !== null ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
              {importing?.scope === "troubleshoot" && importing.mode === "draft"
                ? "トラブル解決を同期中…"
                : draftPackInfo?.packs?.troubleshoot
                  ? `トラブル解決${draftPackInfo.packs.troubleshoot.total}件を下書きに同期`
                  : "トラブル解決候補を下書きに同期"}
            </button>
            <button onClick={() => void importDraftPack("troubleshoot", "new")} disabled={importing !== null} style={{ padding: "8px 14px", borderRadius: 8, background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC", cursor: importing !== null ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
              {importing?.scope === "troubleshoot" && importing.mode === "new" ? "新規候補を追加中…" : "新規トラブル候補だけ追加"}
            </button>
            <button onClick={() => void importDraftPack("troubleshootUnique", "new")} disabled={importing !== null} style={{ padding: "8px 14px", borderRadius: 8, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #93C5FD", cursor: importing !== null ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
              {importing?.scope === "troubleshootUnique" && importing.mode === "new"
                ? "重複しない300件を追加中…"
                : `重複しない記事${draftPackInfo?.packs?.troubleshootUnique?.total ? `（${draftPackInfo.packs.troubleshootUnique.total}件）` : ""}だけ追加`}
            </button>
            <button onClick={() => void importDraftPack("all", "draft")} disabled={importing !== null} style={{ padding: "8px 14px", borderRadius: 8, background: "var(--primary-soft)", color: "var(--primary)", border: "1px solid var(--primary)", cursor: importing !== null ? "wait" : "pointer", fontSize: 13, fontWeight: 600 }}>
              {importing?.scope === "all" && importing.mode === "draft" ? "候補を同期中…" : draftPackInfo ? `候補${draftPackInfo.total}件を下書きに同期` : "設定・トラブル候補を下書きに同期"}
            </button>
            <button onClick={() => void handleConsolidateDrafts()} disabled={importing !== null || consolidating} style={{ padding: "8px 14px", borderRadius: 8, background: "#F5F3FF", color: "#6D28D9", border: "1px solid #C4B5FD", cursor: importing !== null || consolidating ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
              {consolidating ? "類似候補を統合中…" : "類似する下書きをまとめる"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 16, color: "var(--text-muted)", fontSize: 12 }}>
            <span>公開 {publishedCount}件</span>
            <span>下書き {draftCount}件</span>
            <span>{draftPackInfo ? `候補：${draftPackInfo.total}件（トラブル解決${draftPackInfo.byCategory.troubleshoot || 0}件）` : "候補数を確認中…"}</span>
          </div>
          {settingsLoadError && (
            <div role="alert" style={{ marginBottom: 12, padding: "10px 12px", border: "1px solid #D95D43", borderRadius: 8, background: "#FFF1EC", color: "#8F2F20", fontSize: 13 }}>
              下書きデータを最新化できませんでした：{settingsLoadError}。［最新に更新］をもう一度お試しください。
            </div>
          )}

          {selectedIds.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "var(--primary-soft)", border: "1px solid var(--primary)" }}>
              <strong style={{ fontSize: 13, color: "var(--primary)" }}>{selectedIds.size}件選択中</strong>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>公開状態をまとめて変更できます</span>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                <button onClick={() => void handleBulkStatus("published")} disabled={bulkUpdating} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #86EFAC", background: "#F0FDF4", color: "#166534", cursor: bulkUpdating ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}>{bulkUpdating ? "更新中…" : "公開する"}</button>
                <button onClick={() => void handleBulkStatus("draft")} disabled={bulkUpdating} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #FCD34D", background: "#FFFBEB", color: "#92400E", cursor: bulkUpdating ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}>非公開にする</button>
                <button onClick={() => setSelectedIds(new Set())} disabled={bulkUpdating} style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}>選択解除</button>
              </div>
            </div>
          )}

          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "10px 12px", width: 42, textAlign: "center" }}>
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="表示中の記事をすべて選択" />
                    </th>
                    {["タイトル", "OS", "カテゴリ", "公開状態", "更新日", "操作"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                        条件に一致する記事がありません。フィルターを外すか、候補データを下書き保存してください。
                      </td>
                    </tr>
                  )}
                  {filtered.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelected(s.id)} aria-label={`${s.title}を選択`} />
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {s.status === "draft" ? (
                          <Link href={`/admin/settings/${s.id}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{s.title}</Link>
                        ) : (
                          <Link href={`/setting/${s.slug}?os=${s.os}`} target="_blank" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{s.title}</Link>
                        )}
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.slug}</div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{OS_LABELS[s.os]}</td>
                      <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{CATEGORIES[s.category] || s.category}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: s.status === "draft" ? "#FFFBEB" : "#F0FDF4", color: s.status === "draft" ? "#B45309" : "#15803D", fontSize: 12, fontWeight: 700 }}>{s.status === "draft" ? "下書き" : "公開"}</span></td>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: 12 }}>
                        {new Date(s.updated_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link
                            href={`/admin/settings/${s.id}`}
                            style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", cursor: "pointer", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                          >編集</Link>
                          <button
                            onClick={() => handleDelete(s.id, s.title)}
                            disabled={deleting === s.id}
                            style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >{deleting === s.id ? "削除中" : "🗑 削除"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {activeTab === "analytics" && mounted && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {popularSearches.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>🔍 人気検索ワード</h3>
              {popularSearches.map((item, i) => (
                <div key={item.query} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{item.query}</span>
                  <span style={{ color: "var(--text-muted)" }}>{item.count}回</span>
                </div>
              ))}
            </div>
          )}
          {popularSettings.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>📈 よく見られた設定</h3>
              {popularSettings.map((item, i) => (
                <div key={`${item.slug}-${item.os}`} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{item.title}</span>
                  <span style={{ color: "var(--text-muted)" }}>{item.count}PV</span>
                </div>
              ))}
            </div>
          )}
          {zeroHits.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>❌ ゼロヒット検索</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px" }}>データ追加の優先候補</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {zeroHits.map((q) => (
                  <span key={q} style={{ padding: "4px 10px", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 12, border: "1px solid #FECACA" }}>{q}</span>
                ))}
              </div>
            </div>
          )}
          {serverZeroHitSearches.length > 0 && (
            <div style={card}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>🌐 サイト全体のゼロヒット検索</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px" }}>実際の訪問者が検索して、答えが見つからなかった語</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {serverZeroHitSearches.map((item) => (
                  <div key={`${item.query}-${item.os || "all"}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ flex: 1 }}>{item.query}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{item.os ? (OS_LABELS[item.os] || item.os) : "全OS"}</span>
                    <strong style={{ color: "var(--danger)", fontSize: 12 }}>{item.count}回</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!mounted || (popularSearches.length === 0 && popularSettings.length === 0 && zeroHits.length === 0 && serverZeroHitSearches.length === 0) && (
            <div style={{ ...card, color: "var(--text-muted)", fontSize: 14 }}>
              検索・閲覧ログがまだありません。サイトを使い始めるとここに表示されます。
            </div>
          )}
        </div>
      )}

      {/* ===== AI TAB ===== */}
      {activeTab === "ai" && (
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>🤖 alias・keywords自動生成</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>設定情報を入力するとAIが検索用aliasとkeywordsを生成します。</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[
              ["タイトル *", aiTitle, (v: string) => setAiTitle(v), "例：ファイルの拡張子を表示する", "text"],
              ["説明文", aiDesc, (v: string) => setAiDesc(v), "例：ファイルの種類を示す拡張子を表示する方法", "text"],
              ["設定導線", aiPath, (v: string) => setAiPath(v), "例：エクスプローラー > 表示 > ファイル名拡張子", "text"],
            ].map(([l, val, set, ph]) => (
              <div key={String(l)}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>{String(l)}</label>
                <input value={String(val)} onChange={(e) => (set as (v: string) => void)(e.target.value)} placeholder={String(ph)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>OS</label>
              <select value={aiOS} onChange={(e) => setAiOS(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none" }}>
                {Object.entries(OS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleAiGenerate} disabled={aiLoading || !aiTitle.trim()}
            style={{ padding: "10px 24px", borderRadius: 8, background: aiLoading || !aiTitle.trim() ? "var(--border)" : "var(--primary)", color: aiLoading || !aiTitle.trim() ? "var(--text-muted)" : "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            {aiLoading ? "生成中..." : "✨ AIで生成する"}
          </button>
          {aiError && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>⚠ {aiError}</p>}
          {aiResult && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {[["aliases", aiResult.aliases, "#BFDBFE", "var(--primary)", "#EFF6FF"], ["keywords", aiResult.keywords, "#BBF7D0", "#15803D", "#F0FDF4"]].map(([name, items, border, color, bg]) => (
                <div key={String(name)}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{String(name)}（{(items as string[]).length}件）</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(items as string[]).map((a) => (
                      <span key={a} style={{ padding: "4px 12px", borderRadius: 6, background: String(bg), color: String(color), fontSize: 13, border: `1px solid ${String(border)}` }}>{a}</span>
                    ))}
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(items))}
                    style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                    JSONでコピー
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== REPORTS TAB ===== */}
      {activeTab === "reports" && mounted && (
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>🚩 ユーザーからの報告</h3>
          {reports.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>報告はまだありません</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reports.map((r) => (
                <div key={r.id} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                      {new Date(r.created_at).toLocaleDateString("ja-JP")}
                    </span>
                    <select value={r.status} onChange={(event) => updateReportStatus(r.id, event.target.value as ContentReport["status"])} style={{ fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, padding: "4px" }}><option value="new">未対応</option><option value="reviewing">確認中</option><option value="done">対応済み</option></select>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>💡 ユーザーが探している設定</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>ゼロヒット時に送られた内容です。記事作成の優先順位に使えます。</p>
          {requests.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 14 }}>リクエストはまだありません</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {requests.map((item) => (
                <div key={item.id} style={{ padding: "12px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}><strong style={{ fontSize: 14 }}>{item.query.startsWith("【問い合わせ】") ? item.query.replace("【問い合わせ】", "問い合わせ：") : item.query}</strong><select value={item.status} onChange={(event) => updateRequestStatus(item.id, event.target.value as ContentRequest["status"])} style={{ marginLeft: "auto", fontSize: 12, border: "1px solid var(--border)", borderRadius: 6, padding: "4px" }}><option value="new">未対応</option><option value="reviewing">確認中</option><option value="done">対応済み</option></select><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString("ja-JP")}</span></div>
                  {item.note && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{item.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
