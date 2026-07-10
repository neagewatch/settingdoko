import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import SearchBar from '@/components/SearchBar';
import SettingCard from '@/components/SettingCard';
import { fetchSettingsByOs } from '@/lib/data';
import { getOsInfo, ALL_TARGETS } from '@/lib/os';
import { CATEGORIES } from '@/lib/data/index';

type Props = { params: Promise<{ os: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_TARGETS.map(t => ({ os: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { os } = await params;
  const info = getOsInfo(os);
  return {
    title: `${info.name}の設定一覧`,
    description: `${info.name}の設定場所と手順を一覧で確認できます。`,
    alternates: { canonical: `/os/${os}` },
  };
}

export default async function OsPage({ params }: Props) {
  const { os } = await params;
  if (!ALL_TARGETS.some(t => t.id === os)) notFound();

  const info = getOsInfo(os);
  const settings = await fetchSettingsByOs(os);

  const grouped: Record<string, typeof settings> = {};
  settings.forEach(s => {
    const c = s.category || 'other';
    (grouped[c] ||= []).push(s);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--sub)] mb-6" aria-label="パンくず">
        <Link href="/" className="hover:text-[var(--accent)]">トップ</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[var(--ink)]">{info.name}</span>
      </nav>

      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
          <h1 className="text-[26px] font-bold text-[var(--ink)]">{info.name} の設定</h1>
        </div>
        <p className="text-[var(--sub)] text-[14px]">{settings.length}件の設定ガイド{info.tagline ? ` — ${info.tagline}` : ''}</p>
      </div>

      <div className="mb-9"><SearchBar /></div>

      <div className="space-y-10">
        {CATEGORIES.map(cat => {
          const items = grouped[cat.id];
          if (!items?.length) return null;
          return (
            <section key={cat.id} id={cat.id}>
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">
                <span>{cat.icon}</span><span>{cat.name}</span>
                <span className="text-slate-300 font-normal">{items.length}</span>
              </h2>
              <div className="space-y-3">
                {items.map(s => <SettingCard key={s.slug} setting={s} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
