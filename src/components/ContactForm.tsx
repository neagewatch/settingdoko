"use client";

import { useEffect, useRef, useState } from "react";

const CONTACT_PREFIX = "【問い合わせ】";
const CONTACT_CATEGORIES = ["記事の修正", "設定の追加", "表示・動作の不具合", "その他"] as const;

export default function ContactForm() {
  const [category, setCategory] = useState<(typeof CONTACT_CATEGORIES)[number]>(CONTACT_CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const startedAt = useRef<number | null>(null);

  useEffect(() => { startedAt.current = Date.now(); }, []);

  async function submit() {
    if (!message.trim() || status === "sending") return;
    startedAt.current ??= Date.now();
    setStatus("sending");
    try {
      const response = await fetch("/api/content-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${CONTACT_PREFIX}${category}`,
          note: message,
          startedAt: startedAt.current,
          website: "",
        }),
      });
      if (!response.ok) throw new Error();
      setMessage("");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="contact-form-success" role="status">送信を受け付けました。確認・改善に利用します。</p>;
  }

  return (
    <div className="contact-form">
      <p className="contact-form-note">氏名・メールアドレスは不要です。返信が必要な内容や個人情報は送らないでください。</p>
      <label htmlFor="contact-category">内容</label>
      <select id="contact-category" value={category} onChange={(event) => setCategory(event.target.value as (typeof CONTACT_CATEGORIES)[number])}>
        {CONTACT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
      </select>
      <label htmlFor="contact-message">メッセージ</label>
      <textarea
        id="contact-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        maxLength={500}
        rows={5}
        placeholder="例：Windows 11のBluetooth設定の記事で、表示される項目名が違います。"
      />
      <button type="button" className="primary-button" onClick={() => void submit()} disabled={status === "sending" || !message.trim()}>
        {status === "sending" ? "送信中…" : "送信する"}
      </button>
      {status === "error" && <p className="contact-form-error" role="alert">送信できませんでした。時間をおいてお試しください。</p>}
    </div>
  );
}
