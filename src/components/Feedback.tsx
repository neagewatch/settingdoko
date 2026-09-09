"use client";
/* localStorageのフィードバック状態を初回クライアント表示へ同期するeffect。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { getFeedbackResult, getFeedbackToken, logView, markFeedback } from "@/lib/analytics";

export function ViewTracker({ slug, os, title }: { slug: string; os: string; title: string }) {
  useEffect(() => {
    logView(slug, os, title);
  }, [slug, os, title]);
  return null;
}

export function HelpfulButton({ settingId, initialCount = 0 }: { settingId: string; initialCount?: number }) {
  const [result, setResult] = useState<"helpful" | "not_helpful" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(Math.max(0, initialCount));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(getFeedbackResult(settingId));
  }, [settingId]);

  if (!mounted) return null;

  async function handleFeedback(vote: "helpful" | "not_helpful") {
    if (result || saving) return;
    // まず同じ端末で二重送信を防ぐ。サーバー保存に失敗しても記事閲覧は壊さない。
    markFeedback(settingId, vote);
    setResult(vote);
    if (vote === "helpful") setCount((value) => value + 1);
    setSaving(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingId, result: vote, token: getFeedbackToken() }),
        keepalive: true,
      });
      const body = await response.json().catch(() => ({})) as { count?: unknown };
      if (response.ok && typeof body.count === "number") setCount(Math.max(0, body.count));
    } catch {
      // localStorageの記録は残し、データベース障害をユーザーへ見せない。
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>この記事は役に立ちましたか？</span>
      <button
        type="button"
        className={`helpful-btn ${result ? "done" : ""}`}
        onClick={() => void handleFeedback("helpful")}
        disabled={Boolean(result)}
      >
        {result === "helpful" ? "解決しました！" : result === "not_helpful" ? "回答済み" : "解決した"}
      </button>
      {!result && <button type="button" className="helpful-btn" onClick={() => void handleFeedback("not_helpful")} disabled={saving}>解決しなかった</button>}
      {count > 0 && <span aria-live="polite" style={{ fontSize: 12, color: "var(--text-muted)" }}>{count}人が役に立ったと回答</span>}
    </div>
  );
}
