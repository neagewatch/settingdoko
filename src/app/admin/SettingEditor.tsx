"use client";

import { useState } from "react";
import { Setting, OS_LABELS, CATEGORIES } from "@/lib/types";

const EMPTY: Omit<Setting, "id" | "updated_at"> = {
  title: "", slug: "", os: "windows11", version: "23H2", category: "system",
  difficulty: "beginner", estimate_minutes: 2,
  aliases: [], path: [], steps: [], related_slugs: [], keywords: [],
  description: "", screenshot_url: "",
};

function parseLines(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}
function toLines(arr: string[]): string {
  return arr.join("\n");
}

export function SettingEditorModal({
  setting,
  onClose,
  onSaved,
}: {
  setting?: Setting | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !setting;
  const [form, setForm] = useState<Omit<Setting, "id" | "updated_at">>(
    setting
      ? { title: setting.title, slug: setting.slug, os: setting.os, version: setting.version,
          category: setting.category, difficulty: setting.difficulty, estimate_minutes: setting.estimate_minutes,
          aliases: setting.aliases, path: setting.path, steps: setting.steps,
          related_slugs: setting.related_slugs, keywords: setting.keywords,
          description: setting.description, screenshot_url: setting.screenshot_url || "" }
      : { ...EMPTY }
  );
  const [aliasText, setAliasText] = useState(toLines(setting?.aliases || []));
  const [pathText, setPathText] = useState(toLines(setting?.path || []));
  const [stepsText, setStepsText] = useState(toLines(setting?.steps || []));
  const [keywordsText, setKeywordsText] = useState(toLines(setting?.keywords || []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", fontSize: 14, outline: "none",
  };
  const textarea = { ...inp, resize: "vertical" as const, fontFamily: "inherit" };
  const label = { fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block" as const, marginBottom: 4 };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      setForm((f) => ({ ...f, screenshot_url: url }));
    } catch (e) {
      alert("アップロード失敗: " + String(e));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      aliases: parseLines(aliasText),
      path: parseLines(pathText),
      steps: parseLines(stepsText),
      keywords: parseLines(keywordsText),
      related_slugs: parseLines(form.related_slugs?.join("\n") || ""),
    };
    try {
      const res = await fetch("/api/settings", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? payload : { id: setting!.id, ...payload }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onSaved();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderRadius: "var(--radius)",
          width: "min(760px, 95vw)", maxHeight: "90vh", overflow: "auto",
          padding: 32, boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isNew ? "新規設定を追加" : "設定を編集"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>タイトル *</label>
            <input style={inp} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="例：ファイルの拡張子を表示する" />
          </div>
          <div>
            <label style={label}>slug *</label>
            <input style={inp} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="show-file-extensions" />
          </div>
          <div>
            <label style={label}>OS *</label>
            <select style={inp} value={form.os} onChange={(e) => setForm((f) => ({ ...f, os: e.target.value as Setting["os"] }))}>
              {Object.entries(OS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>バージョン</label>
            <input style={inp} value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="23H2 / 17 / Sonoma" />
          </div>
          <div>
            <label style={label}>カテゴリ *</label>
            <select style={inp} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>難易度</label>
            <select style={inp} value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Setting["difficulty"] }))}>
              <option value="beginner">初心者向け</option>
              <option value="intermediate">中級者向け</option>
              <option value="advanced">上級者向け</option>
            </select>
          </div>
          <div>
            <label style={label}>所要時間（分）</label>
            <input style={inp} type="number" value={form.estimate_minutes || ""} onChange={(e) => setForm((f) => ({ ...f, estimate_minutes: Number(e.target.value) }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>説明文 *</label>
            <textarea style={textarea} rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>設定導線（1行1ステップ）*</label>
            <textarea style={textarea} rows={3} value={pathText} onChange={(e) => setPathText(e.target.value)} placeholder={"設定\nシステム\nディスプレイ"} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>手順（1行1ステップ）*</label>
            <textarea style={textarea} rows={5} value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder={"設定を開く（Win + I）\n「システム」をクリック\n..."} />
          </div>
          <div>
            <label style={label}>aliases（1行1件）</label>
            <textarea style={textarea} rows={4} value={aliasText} onChange={(e) => setAliasText(e.target.value)} placeholder={"拡張子表示\n拡張子を見たい\nファイルの種類"} />
          </div>
          <div>
            <label style={label}>keywords（1行1件）</label>
            <textarea style={textarea} rows={4} value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} placeholder={"拡張子\nextension\nファイル名"} />
          </div>
          <div>
            <label style={label}>関連slug（1行1件）</label>
            <textarea style={textarea} rows={3} value={toLines(form.related_slugs || [])} onChange={(e) => setForm((f) => ({ ...f, related_slugs: parseLines(e.target.value) }))} placeholder={"show-hidden-files\nchange-default-app"} />
          </div>
          <div>
            <label style={label}>スクリーンショット画像</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                style={{ ...inp, padding: "7px 12px", fontSize: 13 }}
                value={form.screenshot_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, screenshot_url: e.target.value }))}
                placeholder="https://... または下からアップロード"
              />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <span style={{ padding: "7px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 13, fontWeight: 500 }}>
                  {uploading ? "アップロード中..." : "📁 画像を選択"}
                </span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
              </label>
              {form.screenshot_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.screenshot_url} alt="preview" style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid var(--border)", objectFit: "cover" }} />
              )}
            </div>
          </div>
        </div>

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>⚠ {error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 14 }}>
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.title || !form.slug}
            style={{ padding: "10px 24px", borderRadius: 8, background: loading ? "var(--border)" : "var(--primary)", color: loading ? "var(--text-muted)" : "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}
          >
            {loading ? "保存中..." : isNew ? "追加する" : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
