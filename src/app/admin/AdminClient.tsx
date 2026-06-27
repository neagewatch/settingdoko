"use client";

import { useEffect, useState, useCallback } from "react";
import { getZeroHitSearches, getPopularSearches, getPopularSettings } from "@/lib/analytics";
import { Setting, OS_LABELS, CATEGORIES } from "@/lib/types";
import Link from "next/link";
import { SettingEditorModal } from "./SettingEditor";

interface Report { id: string; title: string; comment: string; timestamp: number; }

export default function AdminClient({ settings: initialSettings }: { settings: Setting[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [zeroHits, setZeroHits] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [popularSettings, setPopularSettings] = useState<{ slug: string; os: string; title: string; count: number }[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editTarget, setEditTarget] = useState<Setting | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterOS, setFilterOS] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [activeTab, setActiveTab] = useState<"data" | "analytics" | "ai" | "reports">("data");

  // AI Assist
  const [aiTitle, setAiTitle] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [aiOS, setAiOS] = useState("windows11");
  const [aiPath, setAiPath] = useState("");
  const [aiResult, setAiResult] = useState<{ aliases: string[]; keywords: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    setMounted(true);
    setZeroHits(getZeroHitSearches(10));
    setPopularSearches(getPopularSearches(8));
    setPopularSettings(getPopularSettings(5));
    try {
      setReports(JSON.parse(localStorage.getItem("sdoko_reports") || "[]"));
    } catch {}
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    setDeleting(id);
    try {
      await fetch("/api/settings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setSettings((prev) => prev.filter((s) => s.id !== id));
    } catch (e) { alert("削除失敗: " + e); }
    finally { setDeleting(null); }
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

  const filtered = settings.filter((s) =>
    (!filterOS || s.os === filterOS) &&
    (!filterCat || s.category === filterCat) &&
    (!filterQ || s.title.includes(filterQ) || s.slug.includes(filterQ))
  );

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
      </div>

      {/* ===== DATA TAB ===== */}
      {activeTab === "data" && (
        <div>
          {/* Filters + Add button */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input style={{ ...inp, width: 180 }} placeholder="タイトル/slug検索" value={filterQ} onChange={(e) => setFilterQ(e.target.value)} />
            <select style={inp} value={filterOS} onChange={(e) => setFilterOS(e.target.value)}>
              <option value="">すべてのOS</option>
              {Object.entries(OS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select style={inp} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="">すべてのカテゴリ</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>{filtered.length}件</span>
            <button
              onClick={() => setEditTarget(null)}
              style={{ padding: "8px 18px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              ＋ 新規追加
            </button>
          </div>

          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                    {["タイトル", "OS", "カテゴリ", "更新日", "操作"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <Link href={`/setting/${s.slug}?os=${s.os}`} target="_blank" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{s.title}</Link>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.slug}</div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{OS_LABELS[s.os]}</td>
                      <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{CATEGORIES[s.category] || s.category}</td>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: 12 }}>
                        {new Date(s.updated_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setEditTarget(s)}
                            style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >✏️ 編集</button>
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
          {!mounted || (popularSearches.length === 0 && popularSettings.length === 0 && zeroHits.length === 0) && (
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
              {reports.map((r, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                      {new Date(r.timestamp).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor modal */}
      {editTarget !== undefined && (
        <SettingEditorModal
          setting={editTarget}
          onClose={() => setEditTarget(undefined)}
          onSaved={() => { window.location.reload(); }}
        />
      )}
    </div>
  );
}
