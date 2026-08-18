"use client";

import { useState } from "react";
import Link from "next/link";
import { OS_LABELS } from "@/lib/types";

type DiagnoseOption = {
  label: string;
  query: string;
  targets: { label: string; slug: string; os: keyof typeof OS_LABELS }[];
};

export default function DiagnoseClient({ options }: { options: DiagnoseOption[] }) {
  const [choice, setChoice] = useState<string | null>(null);
  const selected = options.find((item) => item.query === choice);
  return <div className="utility-page diagnose-page" style={{ maxWidth: 680, margin: "0 auto", padding: "34px 0 64px" }}>
    <p className="section-index">DIAGNOSE / トラブルから探す</p>
    <h1 className="page-title" style={{ fontSize: 28, margin: "0 0 10px" }}>症状からトラブル解決方法を探す</h1>
    <p className="page-subtitle" style={{ margin: "0 0 24px" }}>設定名が分からなくても大丈夫です。困っていることを選ぶと、対応するトラブル解決ガイドへ案内します。</p>
    <div className="diagnose-options" style={{ display: "grid", gap: 10 }}>
      {options.map((item) => <button className={`diagnose-option ${choice === item.query ? "selected" : ""}`} type="button" key={item.query} aria-pressed={choice === item.query} onClick={() => setChoice(item.query)} style={{ textAlign: "left", padding: "16px 18px", cursor: "pointer", borderRadius: 10, border: choice === item.query ? "2px solid var(--primary)" : "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, fontWeight: 600 }}>{item.label}<span aria-hidden="true" style={{ float: "right", color: "var(--text-muted)" }}>→</span></button>)}
    </div>
    {selected && <div className="diagnose-result" style={{ marginTop: 20, padding: 18, borderRadius: 10, background: "var(--primary-soft)", border: "1px solid var(--border)" }}>
      <p style={{ margin: "0 0 12px", fontWeight: 600 }}>「{selected.label}」のトラブル解決ガイド</p>
      {selected.targets.length > 0 ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {selected.targets.map((target) => (
            <Link key={`${target.slug}-${target.os}`} className="primary-button" href={`/setting/${target.slug}?os=${target.os}`} style={{ display: "inline-block", padding: "10px 14px", background: "var(--primary)", borderRadius: 8, color: "white", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              {target.label || OS_LABELS[target.os]} →
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>対応記事を準備中です。トラブル解決一覧または検索から探せます。</p>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
        <Link href="/category/troubleshoot" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>トラブル解決一覧 →</Link>
        <Link href={`/search?q=${encodeURIComponent(selected.query)}`} style={{ color: "var(--text-secondary)", fontSize: 13 }}>検索結果を見る →</Link>
      </div>
    </div>}
  </div>;
}
