"use client";

import { useState } from "react";
import Link from "next/link";

const OPTIONS = [
  { label: "Wi-Fi・ネットがつながらない", query: "Wi-Fiが切れる" },
  { label: "通知が多い・止めたい", query: "通知を消したい" },
  { label: "バッテリーを長持ちさせたい", query: "バッテリーを長持ち" },
  { label: "画面が明るすぎる・見づらい", query: "画面を暗くしたい" },
  { label: "Bluetooth機器がつながらない", query: "Bluetooth 接続" },
  { label: "動作が遅い・容量を空けたい", query: "ストレージ 容量" },
];

export default function DiagnoseClient() {
  const [choice, setChoice] = useState<string | null>(null);
  const selected = OPTIONS.find((item) => item.query === choice);
  return <div style={{ maxWidth: 680, margin: "0 auto", padding: "34px 0 64px" }}>
    <h1 style={{ fontSize: 28, margin: "0 0 10px" }}>症状から設定を探す</h1>
    <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>設定名が分からなくても大丈夫です。困っていることを選ぶと、検索結果へ案内します。</p>
    <div style={{ display: "grid", gap: 10 }}>
      {OPTIONS.map((item) => <button key={item.query} onClick={() => setChoice(item.query)} style={{ textAlign: "left", padding: "16px 18px", cursor: "pointer", borderRadius: 10, border: choice === item.query ? "2px solid var(--primary)" : "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, fontWeight: 600 }}>{item.label}<span style={{ float: "right", color: "var(--text-muted)" }}>→</span></button>)}
    </div>
    {selected && <div style={{ marginTop: 20, padding: 18, borderRadius: 10, background: "var(--primary-soft)", border: "1px solid var(--border)" }}>
      <p style={{ margin: "0 0 12px", fontWeight: 600 }}>「{selected.label}」の設定を探します</p>
      <Link href={`/search?q=${encodeURIComponent(selected.query)}`} style={{ display: "inline-block", padding: "10px 16px", background: "var(--primary)", borderRadius: 8, color: "white", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>候補を見る</Link>
    </div>}
  </div>;
}
