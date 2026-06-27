"use client";

import { useState } from "react";

export default function CopyPathButton({ path }: { path: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = path.join(" > ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      className={`copy-btn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      title="導線をコピー"
    >
      {copied ? "✓ コピー済み" : "📋 コピー"}
    </button>
  );
}
