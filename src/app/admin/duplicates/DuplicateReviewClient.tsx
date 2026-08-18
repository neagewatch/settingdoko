"use client";
/* 管理画面を開いた時のサーバー監査結果を同期するためのeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, OS_LABELS } from "@/lib/types";
import type { DuplicateGroup, DuplicateItem } from "@/lib/duplicate-detection";

type DuplicateResponse = {
  totalArticles: number;
  totalGroups: number;
  autoMergeGroups: number;
  duplicateDeleteItems: number;
  legacyDeleteItems: number;
  conditionDeleteItems: number;
  cleanupDeleteItems: number;
  autoDeleteItems: number;
  reviewGroups: number;
  groups: DuplicateGroup[];
};

function statusLabel(status: DuplicateItem["status"]): string {
  return status === "draft" ? "下書き" : "公開";
}

export default function DuplicateReviewClient() {
  const [data, setData] = useState<DuplicateResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");

  const loadDuplicates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/duplicates", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "重複候補を確認できませんでした");
      setData(body as DuplicateResponse);
      setSelectedIds(new Set());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "重複候補を確認できませんでした");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDuplicates();
  }, [loadDuplicates]);

  const allItems = useMemo(() => data?.groups.flatMap((group) => group.items) || [], [data]);
  const selectedItems = allItems.filter((item) => selectedIds.has(item.id));
  const selectedPublished = selectedItems.filter((item) => item.status === "published");

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectGroup(group: DuplicateGroup) {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = group.items.every((item) => next.has(item.id));
      for (const item of group.items) {
        if (allSelected) next.delete(item.id); else next.add(item.id);
      }
      return next;
    });
  }

  async function deleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0 || deleting || merging) return;

    const publishedWarning = selectedPublished.length > 0
      ? `\n\n公開記事が${selectedPublished.length}件含まれています。削除すると公開ページも消えます。`
      : "";
    if (!window.confirm(`選択した${ids.length}件を完全に削除しますか？${publishedWarning}\n\nこの操作は元に戻せません。`)) return;

    setDeleting(true);
    try {
      const response = await fetch("/api/admin/duplicates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, confirmPublished: selectedPublished.length > 0 }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "重複候補を削除できませんでした");
      window.alert(`${body.deleted ?? ids.length}件を削除しました。`);
      await loadDuplicates(true);
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : "重複候補を削除できませんでした");
    } finally {
      setDeleting(false);
    }
  }

  async function cleanupAllDuplicates() {
    const count = data?.autoDeleteItems ?? 0;
    if (count === 0 || merging || deleting) return;
    const duplicateCount = data?.duplicateDeleteItems ?? 0;
    const legacyCount = data?.legacyDeleteItems ?? 0;
    const conditionCount = data?.conditionDeleteItems ?? 0;
    const confirmed = window.confirm(
      `合計${count}件を整理します。\n\n・高確度の重複 ${duplicateCount}件は各グループ1件に統合\n・旧trouble7/trouble8 ${legacyCount}件は削除\n・指定された条件付き記事 ${conditionCount}件は削除\n\ntrouble9と通常記事は残します。公開記事も削除対象になる場合があります。\nタイトルが似ているだけの「要確認」候補は変更しません。\n\nこの操作は元に戻せません。続けますか？`,
    );
    if (!confirmed) return;

    setMerging(true);
    setError("");
    try {
      const response = await fetch("/api/admin/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute: true }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "記事を一括整理できませんでした");
      window.alert(`${body.mergedGroups ?? 0}グループを整理し、${body.deletedRows ?? 0}件を削除しました。`);
      await loadDuplicates(true);
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : "重複記事を一括整理できませんでした");
    } finally {
      setMerging(false);
    }
  }

  const cardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
  };

  if (loading) {
    return <div style={{ ...cardStyle, padding: 28, color: "var(--text-muted)" }}>全記事を確認中です…（記事数によって少し時間がかかります）</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...cardStyle, padding: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>重複候補の確認</h2>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              全{data?.totalArticles ?? 0}記事を確認しています。重複の統合と、指定された旧・条件付き記事の整理ができます。
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(data?.autoDeleteItems ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => void cleanupAllDuplicates()}
                disabled={refreshing || deleting || merging}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", cursor: merging ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}
              >{merging ? "整理中…" : `重複・旧記事を一括整理（${data?.autoDeleteItems}件）`}</button>
            )}
            <button
              type="button"
              onClick={() => void loadDuplicates(true)}
              disabled={refreshing || deleting || merging}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", cursor: refreshing ? "wait" : "pointer", fontSize: 12, fontWeight: 600 }}
            >{refreshing ? "確認中…" : "↻ 再確認"}</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16, fontSize: 13 }}>
          <span>候補グループ <strong>{data?.totalGroups ?? 0}</strong>件</span>
          <span style={{ color: "#B91C1C" }}>一括整理対象 {data?.autoDeleteItems ?? 0}件</span>
          <span style={{ color: "#7F1D1D" }}>旧trouble7/8 {data?.legacyDeleteItems ?? 0}件</span>
          <span style={{ color: "#7F1D1D" }}>条件付き {data?.conditionDeleteItems ?? 0}件</span>
          <span style={{ color: "#92400E" }}>要確認 {data?.reviewGroups ?? 0}グループ</span>
          <span style={{ color: "#166534" }}>高確度は「一致」</span>
          <span style={{ color: "#92400E" }}>中確度は「要確認」</span>
        </div>
        {error && <p role="alert" style={{ margin: "14px 0 0", padding: "10px 12px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: 13 }}>{error}</p>}
      </div>

      {selectedIds.size > 0 && (
        <div style={{ ...cardStyle, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "var(--primary-soft)" }}>
          <strong style={{ color: "var(--primary)", fontSize: 13 }}>{selectedIds.size}件選択中</strong>
          <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>削除する記事だけ選択してください。</span>
          <button
            type="button"
            onClick={() => void deleteSelected()}
            disabled={deleting || merging}
            style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", cursor: deleting ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}
          >{deleting ? "削除中…" : "🗑 選択した記事を削除"}</button>
          <button type="button" onClick={() => setSelectedIds(new Set())} disabled={deleting || merging} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}>選択解除</button>
        </div>
      )}

      {data?.groups.length === 0 && (
        <div style={{ ...cardStyle, padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          重複の可能性がある記事は見つかりませんでした。
        </div>
      )}

      {data?.groups.map((group, groupIndex) => {
        const groupSelected = group.items.every((item) => selectedIds.has(item.id));
        return (
          <section key={group.id} style={{ ...cardStyle, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: group.confidence === "high" ? "#F0FDF4" : "#FFFBEB", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <strong style={{ fontSize: 13 }}>候補 {groupIndex + 1}</strong>
              <span style={{ padding: "3px 8px", borderRadius: 999, background: group.confidence === "high" ? "#DCFCE7" : "#FEF3C7", color: group.confidence === "high" ? "#166534" : "#92400E", fontSize: 11, fontWeight: 700 }}>{group.confidence === "high" ? "一致・高確度" : "要確認"}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{group.reason}</span>
              <button type="button" onClick={() => selectGroup(group)} disabled={merging} style={{ marginLeft: "auto", padding: "5px 9px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", cursor: merging ? "wait" : "pointer", fontSize: 11 }}>{groupSelected ? "グループの選択解除" : "グループを選択"}</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 11 }}>
                    <th style={{ padding: "9px 12px", width: 40 }} aria-label="選択" />
                    <th style={{ padding: "9px 12px", textAlign: "left" }}>記事</th>
                    <th style={{ padding: "9px 12px", textAlign: "left" }}>OS / カテゴリ</th>
                    <th style={{ padding: "9px 12px", textAlign: "left" }}>状態</th>
                    <th style={{ padding: "9px 12px", textAlign: "left" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "11px 12px", textAlign: "center" }}>
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`${item.title}を削除候補に選択`} />
                      </td>
                      <td style={{ padding: "11px 12px", maxWidth: 420 }}>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ marginTop: 3, color: "var(--text-muted)", fontSize: 11, wordBreak: "break-all" }}>{item.slug}</div>
                      </td>
                      <td style={{ padding: "11px 12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {OS_LABELS[item.os] || item.os}<br />
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{CATEGORIES[item.category] || item.category}</span>
                      </td>
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                        <span style={{ padding: "3px 7px", borderRadius: 999, background: item.status === "draft" ? "#FEF3C7" : "#DCFCE7", color: item.status === "draft" ? "#92400E" : "#166534", fontSize: 11, fontWeight: 700 }}>{statusLabel(item.status)}</span>
                      </td>
                      <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/admin/settings/${item.id}`} style={{ color: "var(--primary)", fontSize: 12, textDecoration: "none" }}>編集</Link>
                          {item.status === "published" && <Link href={`/setting/${item.slug}?os=${item.os}`} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontSize: 12, textDecoration: "none" }}>公開ページ</Link>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
