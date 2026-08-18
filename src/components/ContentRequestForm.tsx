"use client";

import { useEffect, useRef, useState } from "react";

export default function ContentRequestForm({ query, os }: { query: string; os?: string }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const startedAt = useRef<number | null>(null);

  useEffect(() => { startedAt.current = Date.now(); }, []);

  async function submit() {
    startedAt.current ??= Date.now();
    setStatus("sending");
    try {
      const response = await fetch("/api/content-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, os, note, startedAt: startedAt.current, website: "" }) });
      if (!response.ok) throw new Error();
      setStatus("done");
    } catch { setStatus("error"); }
  }

  if (status === "done") return <p style={{ fontSize: 13, color: "#15803D", margin: "20px 0 0" }}>送信ありがとうございました。追加候補として確認します。</p>;
  return (
    <div style={{ maxWidth: 480, margin: "28px auto 0", padding: 16, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", textAlign: "left" }}>
      <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>探している設定を送る</p>
      <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.6, color: "var(--text-muted)" }}>氏名・メールアドレスは不要です。パスワードや個人情報は入力しないでください。</p>
      <label htmlFor="content-request-note" className="sr-only">補足</label>
      <textarea id="content-request-note" value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={500} placeholder="例：Teamsの会議通知だけ消したい" style={{ width: "100%", resize: "vertical", padding: 9, borderRadius: 7, border: "1px solid var(--border)", font: "inherit", boxSizing: "border-box" }} />
      <button type="button" onClick={submit} disabled={status === "sending"} style={{ marginTop: 8, padding: "8px 12px", border: 0, borderRadius: 7, background: "var(--primary)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>{status === "sending" ? "送信中…" : "追加をリクエスト"}</button>
      {status === "error" && <p style={{ color: "var(--danger)", fontSize: 12, margin: "8px 0 0" }}>送信できませんでした。管理者にお問い合わせください。</p>}
    </div>
  );
}
