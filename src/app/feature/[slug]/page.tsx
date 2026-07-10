import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import SettingCard from '@/components/SettingCard';
import { FEATURES, ALL_SETTINGS } from '@/lib/data/index';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURES.map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = FEATURES.find(x => x.slug === slug);
  if (!f) return { title: '特集が見つかりません' };
  return {
    title: f.title,
    description: f.description,
    alternates: { canonical: `/feature/${slug}` },
  };
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = FEATURES.find(x => x.slug === slug);
  if (!feature) notFound();

  const items = feature.setting_refs
    .map(ref => ALL_SETTINGS.find(s => s.slug === ref.slug && s.os === ref.os))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--sub)] mb-6" aria-label="パンくず">
        <Link href="/" className="hover:text-[var(--accent)]">トップ</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[var(--ink)]">特集</span>
      </nav>

      <div className="mb-8">
        <span className="text-4xl block mb-3">{feature.icon}</span>
        <h1 className="text-[26px] font-bold text-[var(--ink)] mb-2">{feature.title}</h1>
        <p className="text-[var(--sub)]">{feature.description}</p>
        <p className="text-[13px] text-[var(--sub)] mt-2">
          {feature.os_label ? `${feature.os_label} ・ ` : ''}{items.length}件の設定
        </p>
      </div>

      <div className="space-y-3 mb-12">
        {items.map((s, i) => <SettingCard key={`${s.os}-${s.slug}`} setting={s} order={i + 1} />)}
      </div>

      <div className="pt-6 border-t border-[var(--line)]">
        <p className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-3">他の特集</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURES.filter(f => f.slug !== slug).map(f => (
            <Link key={f.slug} href={`/feature/${f.slug}`}
              className="card card-hover p-4 flex items-center gap-3 group">
              <span className="text-xl">{f.icon}</span>
              <span className="text-[14px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)]">{f.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
