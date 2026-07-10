import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-16 text-center">
      <p className="text-[64px] font-bold text-slate-200 mb-2 leading-none">404</p>
      <h1 className="text-xl font-bold text-[var(--ink)] mb-3">ページが見つかりませんでした</h1>
      <p className="text-[14px] text-[var(--sub)] mb-8">お探しの設定は移動または削除された可能性があります。<br />キーワードで検索してみてください。</p>
      <SearchBar />
      <Link href="/" className="inline-block mt-8 text-[14px] text-[var(--accent)] font-medium hover:underline">
        ← トップに戻る
      </Link>
    </div>
  );
}
