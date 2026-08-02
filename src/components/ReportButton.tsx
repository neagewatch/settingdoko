"use client";

import { useState } from "react";

export default function ReportButton({ settingId, title }: { settingId: string; title: string }) {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    setSending(true); setError("");
    try {
      const response = await fetch("/api/content-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settingId, title, comment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "送信できませんでした");
      setSent(true); setOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : "送信できませんでした"); }
    finally { setSending(false); }
  }

  if (sent) {
    return (
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
        ✓ 報告を受け付けました。ありがとうございます。
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 12, color: "var(--text-muted)", background: "none",
          border: "none", cursor: "pointer", textDecoration: "underline",
          padding: 0,
        }}
      >
        🚩 情報が古い・間違いを報告
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>情報の修正を報告</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              「{title}」の情報が古い・間違っている点を教えてください。
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="例：iOS 18からメニューの場所が変わりました。設定 → プライバシー → ... が正しいです。"
              rows={4}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text)", fontSize: 13, resize: "vertical",
                outline: "none", marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 13 }}
              >
                キャンセル
              </button>
              <button disabled={sending || !comment.trim()} onClick={handleSubmit}
                style={{ padding: "8px 20px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                {sending ? "送信中…" : "送信する"}
              </button>
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: 12, margin: "10px 0 0" }}>{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
