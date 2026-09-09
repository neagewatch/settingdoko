"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OS_LABELS } from "@/lib/types";

type DiagnoseOption = {
  label: string;
  query: string;
  targets: { label: string; slug?: string; os: keyof typeof OS_LABELS; note?: string }[];
};

export default function DiagnoseClient({ options }: { options: DiagnoseOption[] }) {
  const [choice, setChoice] = useState<string | null>(null);
  const selected = options.find((item) => item.query === choice);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    resultRef.current?.focus({ preventScroll: true });
  }, [selected]);

  return <div className="utility-page diagnose-page" style={{ maxWidth: 680, margin: "0 auto", padding: "34px 0 64px" }}>
    <p className="section-index">トラブルから探す</p>
    <h1 className="page-title" style={{ fontSize: 28, margin: "0 0 10px" }}>症状からトラブル解決方法を探す</h1>
    <p className="page-subtitle" style={{ margin: "0 0 24px" }}>設定名が分からなくても大丈夫です。困っていることを選ぶと、対応するトラブル解決ガイドへ案内します。</p>
    <div className="diagnose-options" style={{ display: "grid", gap: 10 }}>
      {options.map((item) => <button className={`diagnose-option ${choice === item.query ? "selected" : ""}`} type="button" key={item.query} aria-pressed={choice === item.query} onClick={() => setChoice(item.query)} style={{ textAlign: "left", padding: "16px 18px", cursor: "pointer", borderRadius: 10, border: choice === item.query ? "2px solid var(--primary)" : "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, fontWeight: 600 }}>{item.label}<span className="diagnose-option-arrow" aria-hidden="true">→</span></button>)}
    </div>
    {selected && <div ref={resultRef} className="diagnose-result" tabIndex={-1} aria-live="polite" style={{ marginTop: 20, padding: 18, borderRadius: 10, background: "var(--primary-soft)", border: "1px solid var(--border)" }}>
      <div className="diagnose-result-heading">
        <p style={{ margin: 0, fontWeight: 600 }}>「{selected.label}」の案内先</p>
        <button type="button" className="diagnose-reset" onClick={() => setChoice(null)}>選び直す</button>
      </div>
      {selected.targets.length > 0 ? (
        <div className="diagnose-targets">
          {selected.targets.map((target) => (
            target.slug ? (
              <div key={`${target.slug}-${target.os}`} className="diagnose-target">
                <Link className="primary-button" href={`/setting/${target.slug}?os=${target.os}`}>
                  {target.label || OS_LABELS[target.os]} →
                </Link>
                {target.note && <small>{target.note}</small>}
              </div>
            ) : (
              <div key={`${target.label}-${target.os}`} className="diagnose-target diagnose-target-unavailable">
                <span>{target.label || OS_LABELS[target.os]}</span>
                <small>{target.note || "対応記事を準備中です。"}</small>
              </div>
            )
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
