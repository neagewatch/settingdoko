"use client";

import { useEffect, useState } from "react";
import { getZeroHitSearches, getPopularSearches, getPopularSettings } from "@/lib/analytics";
import { Setting } from "@/lib/types";

export default function AdminClient({ settings }: { settings: Setting[] }) {
  const [zeroHits, setZeroHits] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [popularSettings, setPopularSettings] = useState<{ slug: string; os: string; title: string; count: number }[]>([]);
  const [mounted, setMounted] = useState(false);

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
  }, []);

  async function handleAiGenerate() {
    if (!aiTitle.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: aiTitle, description: aiDesc, os: aiOS, path: aiPath }),
      });
      const data = await res.json();
      if (data.error) { setAiError(data.error); return; }
      setAiResult(data);
    } catch {
      setAiError("エラーが発生しました");
    } finally {
      setAiLoading(false);
    }
  }

  if (!mounted) return null;

  const cardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Analytics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {popularSearches.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>🔍 人気検索ワード</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {popularSearches.map((item, i) => (
                <div key={item.query} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{item.query}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.count}回</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {popularSettings.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>📈 よく見られた設定</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {popularSettings.map((item, i) => (
                <div key={`${item.slug}-${item.os}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{item.title}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.count}PV</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {zeroHits.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0" }}>❌ ゼロヒット検索</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px 0" }}>データ追加の優先候補</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {zeroHits.map((q) => (
                <span key={q} style={{ padding: "4px 10px", borderRadius: 6, background: "#FEF2F2", color: "#DC2626", fontSize: 12, border: "1px solid #FECACA" }}>{q}</span>
              ))}
            </div>
          </div>
        )}
        {popularSearches.length === 0 && popularSettings.length === 0 && zeroHits.length === 0 && (
          <div style={{ ...cardStyle, color: "var(--text-muted)", fontSize: 14 }}>
            検索・閲覧ログがまだありません。サイトを使い始めるとここに分析データが表示されます。
          </div>
        )}
      </div>

      {/* AI Assist */}
      <div style={{ ...cardStyle, padding: "24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px 0" }}>🤖 AI補助 — alias・keywords自動生成</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px 0" }}>設定情報を入力すると、検索にヒットしやすいaliasとkeywordsをAIが生成します。</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>タイトル *</label>
            <input value={aiTitle} onChange={(e) => setAiTitle(e.target.value)} placeholder="例：ファイルの拡張子を表示する" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>OS</label>
            <select value={aiOS} onChange={(e) => setAiOS(e.target.value)} style={inputStyle}>
              <option value="windows11">Windows 11</option>
              <option value="ios">iPhone / iOS</option>
              <option value="macos">macOS</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>説明文</label>
            <input value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} placeholder="例：ファイルの種類を示す拡張子を表示する方法" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>設定導線</label>
            <input value={aiPath} onChange={(e) => setAiPath(e.target.value)} placeholder="例：エクスプローラー > 表示 > ファイル名拡張子" style={inputStyle} />
          </div>
        </div>

        <button
          onClick={handleAiGenerate}
          disabled={aiLoading || !aiTitle.trim()}
          style={{
            padding: "10px 24px", borderRadius: 8,
            background: aiLoading || !aiTitle.trim() ? "var(--border)" : "var(--primary)",
            color: aiLoading || !aiTitle.trim() ? "var(--text-muted)" : "white",
            border: "none", cursor: aiLoading || !aiTitle.trim() ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 600,
          }}
        >
          {aiLoading ? "生成中..." : "✨ AIで生成する"}
        </button>

        {aiError && <p style={{ color: "#DC2626", fontSize: 13, marginTop: 12 }}>⚠ {aiError}</p>}

        {aiResult && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>aliases（{aiResult.aliases.length}件）</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {aiResult.aliases.map((a) => (
                  <span key={a} style={{ padding: "4px 12px", borderRadius: 6, background: "var(--primary-soft)", color: "var(--primary)", fontSize: 13, border: "1px solid #BFDBFE" }}>{a}</span>
                ))}
              </div>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(aiResult.aliases))}
                style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                JSONでコピー
              </button>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>keywords（{aiResult.keywords.length}件）</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {aiResult.keywords.map((k) => (
                  <span key={k} style={{ padding: "4px 12px", borderRadius: 6, background: "#F0FDF4", color: "#15803D", fontSize: 13, border: "1px solid #BBF7D0" }}>{k}</span>
                ))}
              </div>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(aiResult.keywords))}
                style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                JSONでコピー
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
