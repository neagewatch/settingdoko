"use client";

import { useState, useEffect, useCallback } from "react";

export function CopyStepsButton({ steps, path }: { steps: string[]; path: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [
      `設定場所: ${path.join(" > ")}`,
      "",
      "手順:",
      ...steps.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
      {copied ? "✓ コピー済み" : "📋 手順をコピー"}
    </button>
  );
}

export function FontSizeToggle() {
  const [large, setLarge] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sdoko_fontsize") === "large";
    setLarge(saved);
    if (saved) document.documentElement.setAttribute("data-fontsize", "large");
  }, []);

  function toggle() {
    const next = !large;
    setLarge(next);
    localStorage.setItem("sdoko_fontsize", next ? "large" : "normal");
    document.documentElement.setAttribute("data-fontsize", next ? "large" : "");
  }

  if (!mounted) return null;

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      title={large ? "標準サイズに戻す" : "文字を大きくする"}
      style={{ fontSize: 14, fontWeight: 700 }}
    >
      {large ? "A" : "A+"}
    </button>
  );
}

// "/" キーで検索フォーカス
export function KeyboardShortcut() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "/" && e.target === document.body) {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>(".search-input");
        input?.focus();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  return null;
}
