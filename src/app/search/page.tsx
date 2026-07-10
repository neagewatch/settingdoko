import Link from 'next/link';
import type { Metadata } from 'next';
import SearchBar from '@/components/SearchBar';
import SettingCard from '@/components/SettingCard';
import { searchSettingsData } from '@/lib/data';
import { OS_LIST, APP_LIST } from '@/lib/os';

type Props = { searchParams: Promise<{ q?: string; os?: string; diff?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `「${q}」の検索結果` : '検索',
    robots: { index: false }, // 検索結果はnoindex
  };
}

const DIFFS = [
  { id: '', label: 'すべての難易度' },
  { id: 'beginner', label: '初心者' },
  { id: 'intermediate', label: '中級' },
  { id: 'advanced', label: '上級' },
];

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', os = '', diff = '' } = await searchParams;
  const results = q ? await searchSettingsData(q, os || undefined, diff || undefined) : [];

  const buildUrl = (newOs: string, newDiff: string) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (newOs) p.set('os', newOs);
    if (newDiff) p.set('diff', newDiff);
    return `/search?${p.toString()}`;
  };

  const chip = (isActive: boolean) =>
    `px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap ${
      isActive
        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
        : 'bg-white border-[var(--line)] text-[var(--sub)] hover:border-slate-300'
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <div className="mb-6"><SearchBar defaultValue={q} autoFocus={!q} /></div>

      {/* OSフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-2 no-print">
        <Link href={buildUrl('', diff)} className={chip(!os)}>すべて</Link>
        {OS_LIST.map(o => (
          <Link key={o.id} href={buildUrl(o.id, diff)} className={chip(os === o.id)}>{o.name}</Link>
        ))}
      </div>
      {/* アプリフィルター（本番の欠落を修正） */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 no-print">
        {APP_LIST.map(a => (
          <Link key={a.id} href={buildUrl(a.id, diff)} className={chip(os === a.id)}>{a.short}</Link>
        ))}
      </div>
      {/* 難易度フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-7 no-print">
        {DIFFS.map(d => (
          <Link key={d.id} href={buildUrl(os, d.id)} className={chip(diff === d.id)}>{d.label}</Link>
        ))}
      </div>

      {q ? (
        <>
          <p className="text-[14px] text-[var(--sub)] mb-5">
            「<span className="font-bold text-[var(--ink)]">{q}</span>」の検索結果: <span className="font-bold text-[var(--ink)]">{results.length}件</span>
          </p>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(s => <SettingCard key={`${s.os}-${s.slug}`} setting={s} />)}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-[var(--ink)] font-bold mb-2">見つかりませんでした</p>
              <p className="text-[14px] text-[var(--sub)] mb-5">別のキーワードや言い換え（例:「消したい」→「オフ」）をお試しください</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Bluetooth', '明るさ', '通知', 'ミュート', '共有'].map(kw => (
                  <Link key={kw} href={`/search?q=${encodeURIComponent(kw)}`}
                    className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-[var(--line)] text-[13px] text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    {kw}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[14px] text-[var(--sub)]">キーワードを入力して検索してください。</p>
      )}
    </div>
  );
}
