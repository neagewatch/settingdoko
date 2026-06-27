"use client";

import { useEffect, useState } from "react";
import { logView, markHelpful, isHelpful } from "@/lib/analytics";

export function ViewTracker({ slug, os, title }: { slug: string; os: string; title: string }) {
  useEffect(() => {
    logView(slug, os, title);
  }, [slug, os, title]);
  return null;
}

export function HelpfulButton({ settingId }: { settingId: string }) {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDone(isHelpful(settingId));
  }, [settingId]);

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>この記事は役に立ちましたか？</span>
      <button
        className={`helpful-btn ${done ? "done" : ""}`}
        onClick={() => {
          if (done) return;
          markHelpful(settingId);
          setDone(true);
        }}
        disabled={done}
      >
        {done ? "✓ 解決しました！" : "👍 解決した"}
      </button>
    </div>
  );
}
