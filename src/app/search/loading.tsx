export default function SearchLoading() {
  return (
    <div className="listing-page search-page search-loading" aria-busy="true" aria-live="polite">
      <p className="section-index">設定・トラブルを探す</p>
      <h1>検索結果を読み込んでいます</h1>
      <div className="search-loading-bar" />
      <div className="search-loading-list" aria-hidden="true">
        {[1, 2, 3].map((item) => <div key={item} className="search-loading-card" />)}
      </div>
    </div>
  );
}
