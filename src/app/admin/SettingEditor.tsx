"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStepImage, getStepText, Setting, SettingStep, OS_LABELS, CATEGORIES } from "@/lib/types";
import type { SettingRevision } from "@/lib/data";

const EMPTY: Omit<Setting, "id" | "updated_at"> = {
  title: "", slug: "", os: "windows11", version: "25H2", category: "system",
  aliases: [], path: [], steps: [], related_slugs: [], keywords: [],
  description: "", screenshot_url: "",
  status: "draft", published_at: null, verified_at: null, editor_note: "",
  source_url: "", device_scope: "", impact: "", rollback: "", caution: "", review_due_at: null,
};

function parseLines(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}
function toLines(arr: string[]): string {
  return arr.join("\n");
}

type StepMedia = { image_url: string; image_alt: string };

function stepMediaByIndex(steps: SettingStep[]): Record<number, StepMedia> {
  return Object.fromEntries(steps.map((step, index) => {
    const { image_url, image_alt } = getStepImage(step);
    return [index, { image_url: image_url || "", image_alt: image_alt || "" }];
  }));
}

export function SettingEditorPage({
  setting,
}: {
  setting?: Setting | null;
}) {
  const router = useRouter();
  const isNew = !setting;
  const [form, setForm] = useState<Omit<Setting, "id" | "updated_at">>(
    setting
      ? { title: setting.title, slug: setting.slug, os: setting.os, version: setting.version,
          category: setting.category,
          aliases: setting.aliases, path: setting.path, steps: setting.steps,
          related_slugs: setting.related_slugs, keywords: setting.keywords,
          description: setting.description, screenshot_url: setting.screenshot_url || "",
          status: setting.status || "published", published_at: setting.published_at || null,
          verified_at: setting.verified_at || null, editor_note: setting.editor_note || "", source_url: setting.source_url || "",
          device_scope: setting.device_scope || "", impact: setting.impact || "", rollback: setting.rollback || "",
          caution: setting.caution || "", review_due_at: setting.review_due_at || null }
      : { ...EMPTY }
  );
  const [aliasText, setAliasText] = useState(toLines(setting?.aliases || []));
  const [pathText, setPathText] = useState(toLines(setting?.path || []));
  const [stepsText, setStepsText] = useState((setting?.steps || []).map(getStepText).join("\n"));
  const [stepMedia, setStepMedia] = useState<Record<number, StepMedia>>(stepMediaByIndex(setting?.steps || []));
  const [keywordsText, setKeywordsText] = useState(toLines(setting?.keywords || []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<"cover" | number | null>(null);
  const [revisions, setRevisions] = useState<SettingRevision[]>([]);

  useEffect(() => {
    if (!setting?.id) return;
    fetch(`/api/admin/revisions/${setting.id}`).then((response) => response.ok ? response.json() : []).then(setRevisions).catch(() => {});
  }, [setting?.id]);

  async function restoreRevision(revisionId: string) {
    if (!setting || !confirm("この時点の内容へ復元します。現在の内容も履歴として保存されます。続けますか？")) return;
    const response = await fetch(`/api/admin/revisions/${setting.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revisionId }) });
    if (!response.ok) { setError("履歴を復元できませんでした"); return; }
    window.location.reload();
  }

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", fontSize: 14, outline: "none",
  };
  const textarea = { ...inp, resize: "vertical" as const, fontFamily: "inherit" };
  const label = { fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block" as const, marginBottom: 4 };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, target: "cover" | number) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(target);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (target === "cover") {
        setForm((f) => ({ ...f, screenshot_url: url }));
      } else {
        setStepMedia((current) => ({
          ...current,
          [target]: { image_url: url, image_alt: current[target]?.image_alt || "" },
        }));
      }
    } catch (e) {
      alert("アップロード失敗: " + String(e));
    } finally {
      setUploading(null);
    }
  }

  function handleStepsChange(nextText: string) {
    const previousSteps = parseLines(stepsText);
    const nextSteps = parseLines(nextText);
    setStepMedia((current) => {
      const mediaByText = new Map<string, StepMedia[]>();
      previousSteps.forEach((step, index) => {
        const media = current[index];
        if (!media?.image_url && !media?.image_alt) return;
        const list = mediaByText.get(step) || [];
        list.push(media);
        mediaByText.set(step, list);
      });

      const nextMedia: Record<number, StepMedia> = {};
      nextSteps.forEach((step, index) => {
        const matching = mediaByText.get(step);
        if (matching?.length) {
          nextMedia[index] = matching.shift()!;
        } else if (previousSteps[index] === step && current[index]) {
          nextMedia[index] = current[index];
        }
      });
      return nextMedia;
    });
    setStepsText(nextText);
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      aliases: parseLines(aliasText),
      path: parseLines(pathText),
      steps: parseLines(stepsText).map((text, index) => {
        const media = stepMedia[index];
        return media?.image_url || media?.image_alt
          ? { text, ...(media.image_url ? { image_url: media.image_url } : {}), ...(media.image_alt ? { image_alt: media.image_alt } : {}) }
          : text;
      }),
      keywords: parseLines(keywordsText),
      related_slugs: parseLines(form.related_slugs?.join("\n") || ""),
    };
    if (!payload.source_url) delete payload.source_url;
    try {
      const res = await fetch("/api/settings", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? payload : { id: setting!.id, ...payload }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push("/admin");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-editor-page">
      <div className="admin-editor-topbar">
        <Link href="/admin" className="admin-editor-back">← 管理画面に戻る</Link>
        <span>{isNew ? "新規設定を追加" : "設定を編集"}</span>
      </div>
      <form
        className="admin-editor-card"
        onSubmit={(event) => { event.preventDefault(); void handleSave(); }}
        style={{
          background: "var(--surface)", borderRadius: "var(--radius)",
          width: "100%", maxWidth: 920, margin: "0 auto",
          padding: 32, boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isNew ? "新規設定を追加" : "設定を編集"}
          </h2>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>保存前に下書きで確認できます</span>
        </div>

        <div className="admin-editor-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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
            <input style={inp} value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="Windows 11 25H2 / iOS 26 / Android 16" />
          </div>
          <div>
            <label style={label}>カテゴリ *</label>
            <select style={inp} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>説明文 *</label>
            <textarea style={textarea} rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label style={label}>公開状態</label>
            <select style={inp} value={form.status || "published"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))}>
              <option value="published">公開</option><option value="draft">下書き</option>
            </select>
          </div>
          <div>
            <label style={label}>最終検証日</label>
            <input style={inp} type="date" value={form.verified_at ? form.verified_at.slice(0, 10) : ""} onChange={(e) => setForm((f) => ({ ...f, verified_at: e.target.value ? new Date(`${e.target.value}T00:00:00Z`).toISOString() : null }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>編集メモ（公開ページには表示されません）</label>
            <textarea style={textarea} rows={2} value={form.editor_note || ""} onChange={(e) => setForm((f) => ({ ...f, editor_note: e.target.value }))} placeholder="確認したOSバージョン、更新理由、次回見直し内容など" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>公式情報URL（任意）</label>
            <input style={inp} type="url" value={form.source_url || ""} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://support.microsoft.com/..." />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>対象端末・表示差分（任意）</label>
            <input style={inp} value={form.device_scope || ""} onChange={(e) => setForm((f) => ({ ...f, device_scope: e.target.value }))} placeholder="例：Windows 11 25H2。メーカーにより項目名が異なります。" />
          </div>
          <div>
            <label style={label}>設定するとどうなる（短文・任意）</label>
            <textarea style={textarea} rows={2} maxLength={160} value={form.impact || ""} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value.slice(0, 160) }))} placeholder="例：文字の輪郭が滑らかになり、読みやすくなります。" />
            <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>設定後の変化を1文で。目安40〜80文字（最大160文字）</div>
          </div>
          <div>
            <label style={label}>元に戻す方法（任意）</label>
            <textarea style={textarea} rows={2} value={form.rollback || ""} onChange={(e) => setForm((f) => ({ ...f, rollback: e.target.value }))} placeholder="変更前へ戻す方法" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>注意事項（任意）</label>
            <textarea style={textarea} rows={2} value={form.caution || ""} onChange={(e) => setForm((f) => ({ ...f, caution: e.target.value }))} placeholder="データ消失・権限・再起動などの注意" />
          </div>
          <div>
            <label style={label}>次回見直し日</label>
            <input style={inp} type="date" value={form.review_due_at ? form.review_due_at.slice(0, 10) : ""} onChange={(e) => setForm((f) => ({ ...f, review_due_at: e.target.value ? new Date(`${e.target.value}T00:00:00Z`).toISOString() : null }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>設定導線（1行1ステップ）*</label>
            <textarea style={textarea} rows={3} value={pathText} onChange={(e) => setPathText(e.target.value)} placeholder={"設定\nシステム\nディスプレイ"} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={label}>手順（1行1ステップ）*</label>
            <textarea style={textarea} rows={5} value={stepsText} onChange={(e) => handleStepsChange(e.target.value)} placeholder={"設定を開く（Win + I）\n「システム」をクリック\n..."} />
          </div>
          {parseLines(stepsText).length > 0 && (
            <div style={{ gridColumn: "1/-1", padding: 16, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface-2)" }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ ...label, marginBottom: 2 }}>手順ごとの画像（任意）</label>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>画像を付けたい手順だけ選択してください。JPEG・PNG・WebP、8MB以下。代替テキストはアクセシビリティとSEOに使われます。</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {parseLines(stepsText).map((step, index) => {
                  const media = stepMedia[index] || { image_url: "", image_alt: "" };
                  return (
                    <div key={`${index}-${step}`} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>{index + 1}. {step}</p>
                      <div className="admin-editor-step-media-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8 }}>
                        <input style={{ ...inp, fontSize: 13 }} value={media.image_url} placeholder="画像URL または下からアップロード" onChange={(e) => setStepMedia((current) => ({ ...current, [index]: { ...media, image_url: e.target.value } }))} />
                        <input style={{ ...inp, fontSize: 13 }} value={media.image_alt} placeholder="画像の説明（例：表示メニュー）" onChange={(e) => setStepMedia((current) => ({ ...current, [index]: { ...media, image_alt: e.target.value } }))} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                          <span style={{ padding: "6px 12px", borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 500 }}>
                            {uploading === index ? "アップロード中..." : "📁 この手順に画像を選択"}
                          </span>
                          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => handleUpload(e, index)} disabled={uploading !== null} />
                        </label>
                        {media.image_url && <button type="button" onClick={() => setStepMedia((current) => ({ ...current, [index]: { image_url: "", image_alt: media.image_alt } }))} style={{ padding: "6px 10px", border: "none", background: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12 }}>画像を外す</button>}
                      </div>
                      {media.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={media.image_url} alt={media.image_alt || `手順${index + 1}のプレビュー`} style={{ display: "block", maxWidth: "100%", maxHeight: 180, marginTop: 10, borderRadius: 6, border: "1px solid var(--border)", objectFit: "contain" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                  {uploading === "cover" ? "アップロード中..." : "📁 画像を選択"}
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => handleUpload(e, "cover")} disabled={uploading !== null} />
              </label>
              {form.screenshot_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.screenshot_url} alt="preview" style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid var(--border)", objectFit: "cover" }} />
              )}
            </div>
          </div>
        </div>

        {!isNew && revisions.length > 0 && (
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, margin: "0 0 8px" }}>編集履歴</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {revisions.slice(0, 5).map((revision) => <div key={revision.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}><span>{new Date(revision.created_at).toLocaleString("ja-JP")}</span><span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{revision.snapshot.title}</span><button type="button" onClick={() => restoreRevision(revision.id)} style={{ border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>復元</button></div>)}
            </div>
          </div>
        )}

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>⚠ {error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={() => router.push("/admin")} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 14 }}>
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading || !form.title || !form.slug}
            style={{ padding: "10px 24px", borderRadius: 8, background: loading ? "var(--border)" : "var(--primary)", color: loading ? "var(--text-muted)" : "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}
          >
            {loading ? "保存中..." : isNew ? "追加する" : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
