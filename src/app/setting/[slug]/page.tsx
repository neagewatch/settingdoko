import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchSettingBySlug, fetchRelatedSettings, fetchAllSettings, fetchPrevNext } from '@/lib/data';
import { getOsInfo, DIFFICULTY_LABEL } from '@/lib/os';
import { getCategory, ALL_SETTINGS } from '@/lib/data/index';
import PathKeys from '@/components/PathKeys';
import StepsList from '@/components/StepsList';
import ShareRow from '@/components/ShareRow';
import BookmarkButton from '@/components/BookmarkButton';
import CopyButton from '@/components/CopyButton';
import SettingCard from '@/components/SettingCard';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await fetchAllSettings();
  return all.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const setting = await fetchSettingBySlug(slug);
  if (!setting) return { title: '設定が見つかりません' };
  const os = getOsInfo(setting.os);
  const pathStr = setting.path.join(' › ');
  return {
    title: `${setting.title}（${os.name}）`,
    description: `${os.name}で${setting.title}方法。設定場所: ${pathStr}`,
    alternates: { canonical: `/setting/${slug}` },
    openGraph: {
      title: `${setting.title} | 設定どこ？`,
      description: setting.description || pathStr,
    },
  };
}

export default async function SettingDetailPage({ params }: Props) {
  const { slug } = await params;
  const setting = await fetchSettingBySlug(slug);
  if (!setting) notFound();

  const os = getOsInfo(setting.os);
  const cat = getCategory(setting.category);
  const diff = DIFFICULTY_LABEL[setting.difficulty];
  const related = await fetchRelatedSettings(setting);
  const { prev, next } = await fetchPrevNext(setting);
  // 「他のOSで見る」: 同一タイトルの別OS版
  const variants = ALL_SETTINGS.filter(s => s.title === setting.title && s.os !== setting.os);

  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://settingdoko.vercel.app';
  // BreadcrumbList構造化データ（SEO）
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'トップ', item: SITE },
      { '@type': 'ListItem', position: 2, name: os.name, item: `${SITE}/os/${setting.os}` },
      { '@type': 'ListItem', position: 3, name: setting.title, item: `${SITE}/setting/${setting.slug}` },
    ],
  };

  // HowTo構造化データ（SEO）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${os.name}で${setting.title}`,
    description: setting.description || undefined,
    totalTime: `PT${setting.minutes}M`,
    step: setting.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: s.text,
      ...(s.image_url ? { image: s.image_url } : {}),
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb（ナビとしてのパンくず。設定パスとは別物） */}
      <nav className="no-print flex items-center gap-1.5 text-[13px] text-[var(--sub)] mb-7" aria-label="パンくず">
        <Link href="/" className="hover:text-[var(--accent)]">トップ</Link>
        <span className="text-slate-300">›</span>
        <Link href={`/os/${setting.os}`} className="hover:text-[var(--accent)]">{os.name}</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[var(--ink)] truncate">{setting.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[12px] px-2.5 py-1 rounded-lg font-semibold border"
            style={{ color: os.color, borderColor: os.color + '38', backgroundColor: os.color + '0C' }}>
            {os.name}
          </span>
          {setting.version && <span className="text-[12px] text-[var(--sub)]">{setting.version}</span>}
          {cat && (
            <Link href={`/category/${cat.id}`} className="text-[12px] text-[var(--sub)] hover:text-[var(--accent)]">
              {cat.icon} {cat.name}
            </Link>
          )}
          {diff && (
            <span className="text-[12px] font-medium" style={{ color: diff.color }}>{diff.label}</span>
          )}
          <span className="text-[12px] text-[var(--sub)]">⏱ 約{setting.minutes}分</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[var(--ink)] leading-tight">{setting.title}</h1>
          <BookmarkButton slug={setting.slug} title={setting.title} os={setting.os} />
        </div>
        {setting.description && (
          <p className="text-[var(--sub)] leading-relaxed mt-3">{setting.description}</p>
        )}
      </div>

      {/* 設定の場所（シグネチャーのキーキャップ表示） */}
      {setting.path.length > 0 && (
        <div className="card p-5 mb-7">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider">📍 設定の場所</h2>
            <CopyButton text={setting.path.join(' > ')} label="📋 コピー" />
          </div>
          <PathKeys path={setting.path} size="lg" />
        </div>
      )}

      {/* 他のOSで見る */}
      {variants.length > 0 && (
        <div className="no-print mb-7 flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[var(--sub)]">他の環境で見る:</span>
          {variants.map(v => {
            const vOs = getOsInfo(v.os);
            return (
              <Link key={v.slug} href={`/setting/${v.slug}`}
                className="px-3 py-1.5 rounded-xl text-[13px] font-medium bg-white border border-[var(--line)] text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                {vOs.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* 手順 */}
      {setting.steps.length > 0 && (
        <div className="card p-5 sm:p-6 mb-7">
          <StepsList steps={setting.steps} title={setting.title} />
        </div>
      )}

      {/* Tips */}
      {setting.tips && (
        <div className="mb-7 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-2.5 items-start">
          <span className="text-lg leading-none pt-0.5">💡</span>
          <p className="text-sm text-amber-900 leading-relaxed">{setting.tips}</p>
        </div>
      )}

      {/* 更新日・報告 */}
      <div className="no-print flex items-center justify-between text-[12px] text-[var(--sub)] mb-7">
        <span>最終更新: {setting.updated_at}</span>
        <a
          href={process.env.NEXT_PUBLIC_REPORT_FORM_URL
            ? `${process.env.NEXT_PUBLIC_REPORT_FORM_URL}?usp=pp_url&entry.1=${encodeURIComponent(setting.slug)}`
            : `mailto:report@example.com?subject=${encodeURIComponent(`【設定どこ？】報告: ${setting.slug}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="hover:text-[var(--accent)]"
        >
          🚩 情報が古い・間違いを報告
        </a>
      </div>

      <div className="mb-10">
        <ShareRow title={setting.title} path={`/setting/${setting.slug}`} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mb-10">
          <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">関連する設定</h2>
          <div className="space-y-3">
            {related.map(r => <SettingCard key={`${r.os}-${r.slug}`} setting={r} />)}
          </div>
        </div>
      )}

      {/* Prev / Next */}
      <div className="no-print grid grid-cols-2 gap-3 pt-6 border-t border-[var(--line)]">
        {prev ? (
          <Link href={`/setting/${prev.slug}`} className="card card-hover p-4 group">
            <p className="text-[11px] text-[var(--sub)] mb-1">← 前の設定</p>
            <p className="text-[13px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)] line-clamp-2">{prev.title}</p>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/setting/${next.slug}`} className="card card-hover p-4 text-right group">
            <p className="text-[11px] text-[var(--sub)] mb-1">次の設定 →</p>
            <p className="text-[13px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)] line-clamp-2">{next.title}</p>
          </Link>
        ) : <div />}
      </div>

      <div className="no-print mt-8">
        <Link href={`/os/${setting.os}`} className="text-[14px] text-[var(--accent)] font-medium hover:underline">
          ← {os.name}の設定一覧に戻る
        </Link>
      </div>
    </div>
  );
}
