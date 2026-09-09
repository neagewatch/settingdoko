"use client";

export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <div className="listing-page search-page search-error" role="alert">
        <p className="section-index">設定・トラブルを探す</p>
      <h1>検索結果を表示できませんでした</h1>
      <p>通信状態を確認して、もう一度お試しください。検索語はそのまま保持されます。</p>
      <div className="empty-search-actions">
        <button type="button" className="primary-button" onClick={() => reset()}>もう一度読み込む</button>
        <a className="secondary-button" href="/diagnose">症状から探す</a>
      </div>
    </div>
  );
}
