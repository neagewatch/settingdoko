import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import SettingCard from '@/components/SettingCard';
import { fetchSettingsByCategory } from '@/lib/data';
import { CATEGORIES, getCategory } from '@/lib/data/index';
import { OS_LIST, APP_LIST, getOsInfo } from '@/lib/os';

type Props = { params: Promise<{ cat: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map(c => ({ cat: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const c = getCategory(cat);
  if (!c) return { title: 'カテゴリが見つかりません' };
  return {
    title: `${c.name}の設定一覧`,
    description: `${c.name}に関する設定場所と手順をOS・アプリ横断で確認できます。`,
    alternates: { canonical: `/category/${cat}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  const c = getCategory(cat);
  if (!c) notFound();

  const settings = await fetchSettingsByCategory(cat);
  // OS→アプリの順でグループ表示
  const order = [...OS_LIST, ...APP_LIST].map(o => o.id);
  const grouped: Record<string, typeof settings> = {};
  settings.forEach(s => { (grouped[s.os] ||= []).push(s); });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--sub)] mb-6" aria-label="パンくず">
        <Link href="/" className="hover:text-[var(--accent)]">トップ</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[var(--ink)]">{c.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-[var(--ink)] mb-1.5">{c.icon} {c.name}</h1>
        <p className="text-[var(--sub)] text-[14px]">{settings.length}件の設定ガイド（OS・アプリ横断）</p>
      </div>

      <div className="space-y-10">
        {order.map(osId => {
          const items = grouped[osId];
          if (!items?.length) return null;
          const info = getOsInfo(osId);
          return (
            <section key={osId}>
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                <span>{info.name}</span>
              </h2>
              <div className="space-y-3">
                {items.map(s => <SettingCard key={s.slug} setting={s} />)}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-12 pt-6 border-t border-[var(--line)]">
        <p className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-3">他のカテゴリ</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(x => x.id !== cat).slice(0, 12).map(x => (
            <Link key={x.id} href={`/category/${x.id}`}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[13px] text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
              {x.icon} {x.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
