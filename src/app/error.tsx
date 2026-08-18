"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="empty-state" style={{ padding: "96px 0" }}>
      <p className="eyebrow">一時的なエラー</p>
      <h1>ページを表示できませんでした</h1>
      <p>通信状態を確認して、もう一度お試しください。</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <button type="button" className="primary-button" onClick={() => reset()}>再読み込み</button>
        <Link href="/" className="secondary-button">トップへ戻る</Link>
      </div>
    </main>
  );
}
