export const revalidate = 60;

import { getSettingsBySlug, getRelatedSettings, getSettingsByOS, getStoredSourceHealth } from "@/lib/data";
import { OSType, Setting, OS_LABELS, CATEGORIES, getStepImage, isOSType } from "@/lib/types";
import PathTrail from "@/components/PathTrail";
import OSTabs from "@/components/OSTabs";
import OSBadge from "@/components/OSBadge";
import CopyPathButton from "@/components/CopyPathButton";
import { ViewTracker, HelpfulButton } from "@/components/Feedback";
import BookmarkButton from "@/components/BookmarkButton";
import ShareBar from "@/components/ShareBar";
import StepChecklist from "@/components/StepChecklist";
import { CopyStepsButton } from "@/components/Utilities";
import ReportButton from "@/components/ReportButton";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Metadata } from "next";
import { safeJsonLd } from "@/lib/structured-data";
import { getArticleRiskLevel, isReviewOverdue, isSettingIndexable, type ArticleRiskLevel } from "@/lib/content-quality";
import { rankContextualRelated, sourceHealthBlocksIndex } from "@/lib/content-operations";
import { canonicalSlug } from "@/lib/duplicate-detection";
import { getArticleCopy } from "@/lib/article-copy";
import { getReviewedSetting } from "@/lib/editorial-review";
import { GuideFollowUp, GuideOrientation } from "@/components/GuideContext";
import ArticleTrustSummary from "@/components/ArticleTrustSummary";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ os?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { os } = await searchParams;
  if (os && !isOSType(os)) return { title: "設定が見つかりません", robots: "noindex" };
  const legacySlug = canonicalSlug(slug);
  let allOS = await getSettingsBySlug(legacySlug);
  if (!allOS.length && legacySlug !== slug) allOS = await getSettingsBySlug(slug);
  const setting = os ? allOS.find((item) => item.os === os) : allOS.find((item) => item.os === "windows11") || allOS[0];
  if (!setting) return { title: "設定が見つかりません" };
  const displaySetting = getReviewedSetting(setting);
  const articleCopy = getArticleCopy(displaySetting);
  const versionLabel = displaySetting.version ? ` ${displaySetting.version}` : "";
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(displaySetting.title)}&os=${displaySetting.os}&path=${encodeURIComponent(displaySetting.path.join(" › "))}`;
  const description = `${articleCopy.description} 対応：${OS_LABELS[displaySetting.os]}${versionLabel}`.slice(0, 160);
  const sourceHealth = await getStoredSourceHealth();
  const health = setting.source_url ? sourceHealth.get(setting.source_url) : undefined;
  const indexable = isSettingIndexable(setting) && !sourceHealthBlocksIndex(health);
  return {
    title: `${displaySetting.title}（${OS_LABELS[displaySetting.os]}${versionLabel}）`,
    description,
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${displaySetting.title} | 設定どこ？`,
      description: articleCopy.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: displaySetting.title }],
    },
    twitter: { card: "summary_large_image", title: `${displaySetting.title} | 設定どこ？`, description: articleCopy.description, images: [ogImageUrl] },
    alternates: { canonical: `/setting/${setting.slug}?os=${setting.os}` },
  };
}

export default async function SettingDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { os } = await searchParams;
  const canonical = canonicalSlug(slug);
  if (canonical !== slug) {
    const canonicalSettings = await getSettingsBySlug(canonical);
    const canonicalSetting = os ? canonicalSettings.find((item) => item.os === os) : canonicalSettings[0];
    if (canonicalSetting) permanentRedirect(`/setting/${canonicalSetting.slug}?os=${canonicalSetting.os}`);
  }
  let allOS = await getSettingsBySlug(slug);
  const legacySlug = canonicalSlug(slug);
  if (!allOS.length && legacySlug !== slug) {
    const canonicalSettings = await getSettingsBySlug(legacySlug);
    const target = os ? canonicalSettings.find((item) => item.os === os) : canonicalSettings[0];
    if (target) permanentRedirect(`/setting/${target.slug}?os=${target.os}`);
    allOS = canonicalSettings;
  }
  if (os && !isOSType(os)) notFound();
  const setting = os
    ? allOS.find((item) => item.os === os) || null
    : allOS.find((item) => item.os === "windows11") || allOS[0] || null;
  const availableOS = allOS.map((s) => s.os);

  if (!setting) {
    notFound();
  }
  if (!os) redirect(`/setting/${slug}?os=${setting.os}`);
  return renderDetail(setting, slug, availableOS);
}

async function renderDetail(
  setting: Setting,
  slug: string,
  availableOS: string[]
) {
  const progressKey = `${setting.slug}-${setting.os}`;
  const displaySetting = getReviewedSetting(setting);
  const articleCopy = getArticleCopy(displaySetting);

  // 関連リンクの候補は同OSのカテゴリ内から、目的と内容の近さで選ぶ。
  const osSettings = await getSettingsByOS(setting.os as OSType);
  const explicitlyRelated = await getRelatedSettings(setting.related_slugs, setting.id);
  const contextualRelated = rankContextualRelated(setting, osSettings, new Set(explicitlyRelated.map((item) => item.id)));
  const related = [...explicitlyRelated, ...contextualRelated].slice(0, 5);
  const stepImages = displaySetting.steps
    .map(getStepImage)
    .flatMap(({ image_url }) => image_url ? [image_url] : []);

  const canonicalUrl = `${BASE_URL}/setting/${setting.slug}?os=${setting.os}`;
  const articleLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: displaySetting.title,
    description: articleCopy.description,
    datePublished: setting.published_at || setting.updated_at,
    dateModified: setting.updated_at,
    mainEntityOfPage: canonicalUrl,
    articleSection: CATEGORIES[setting.category] || setting.category,
    author: { "@type": "Organization", name: "設定どこ？", url: BASE_URL },
    publisher: { "@type": "Organization", name: "設定どこ？", url: BASE_URL },
    ...(setting.source_url ? { citation: setting.source_url } : {}),
    ...(stepImages.length > 0 ? { image: stepImages } : displaySetting.screenshot_url ? { image: [displaySetting.screenshot_url] } : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: OS_LABELS[setting.os], item: `${BASE_URL}/os/${setting.os}` },
      { "@type": "ListItem", position: 3, name: displaySetting.title, item: canonicalUrl },
    ],
  };
  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px 28px", marginBottom: 14 };
  const riskLevel = getArticleRiskLevel(setting);
  const reviewOverdue = isReviewOverdue(setting);
  const risk = riskPresentation(riskLevel);

  return (
    <div className="setting-page" style={{ padding: "28px 0 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <ViewTracker slug={slug} os={setting.os} title={displaySetting.title} />

      {/* 印刷用ヘッダー（画面では非表示） */}
      <div className="print-header" style={{ display: "none" }}>
        <span className="print-header-logo">⚙️ 設定どこ？</span>
        <span className="print-header-url">{BASE_URL}/setting/{slug}?os={setting.os}</span>
      </div>

      {/* Breadcrumb */}
      <nav className="breadcrumb no-print" aria-label="パンくず" style={{ marginBottom: 20, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span>›</span>
        <Link href={`/os/${setting.os}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{OS_LABELS[setting.os]}</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{displaySetting.title}</span>
      </nav>

      {/* OS Tabs */}
      {availableOS.length > 1 && (
        <div className="setting-os-switcher no-print" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <OSTabs current={setting.os} slug={slug} availableOS={availableOS} />
          <Link href={`/compare/${slug}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", marginLeft: 8, padding: "6px 12px", border: "1px solid var(--primary)", borderRadius: 999 }}>
            OS比較 →
          </Link>
        </div>
      )}

      {/* Header card */}
      <div className="setting-header-card" style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <OSBadge os={displaySetting.os} />
              {displaySetting.version && <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>{displaySetting.version}</span>}
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>{CATEGORIES[displaySetting.category] || displaySetting.category}</span>
              <span className="article-status-chip">全{displaySetting.steps.length}手順</span>
              {displaySetting.estimate_minutes && <span className="article-status-chip">目安{displaySetting.estimate_minutes}分</span>}
              {displaySetting.verified_at && <span className="article-status-chip verified">{new Date(displaySetting.verified_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}確認</span>}
              {risk && <span className={`article-status-chip risk-${riskLevel}`}>{risk.label}</span>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.01em" }}>{displaySetting.title}</h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{articleCopy.description}</p>
          </div>
          <div className="no-print">
            <BookmarkButton slug={slug} os={setting.os} title={displaySetting.title} category={setting.category} />
          </div>
        </div>
      </div>

      {/* 最短回答 */}
      <div className="answer-card" style={{ ...card, borderColor: "var(--primary)", background: "var(--primary-soft)" }}>
        <div className="answer-card-heading">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--primary)" }}>最短回答 / 設定場所</div>
          <span className="no-print"><CopyPathButton path={displaySetting.path} /></span>
        </div>
        <PathTrail path={displaySetting.path} />
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.7 }}>
          {articleCopy.firstAction}
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>対象：{articleCopy.scope}</p>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-secondary)" }}><strong>操作後の確認：</strong>{articleCopy.outcome}</p>
      </div>

      <ArticleTrustSummary
        scope={articleCopy.scope}
        sourceUrl={displaySetting.source_url}
        sourceType={displaySetting.source_type}
        verifiedAt={displaySetting.verified_at}
        reviewOverdue={reviewOverdue}
      />

      <GuideOrientation setting={displaySetting} />

      {risk && !displaySetting.caution && (
        <aside className={`risk-notice risk-${riskLevel}`} style={{ ...card, padding: "16px 18px" }}>
          <strong>{risk.label}：</strong>{risk.fallback}
        </aside>
      )}

      {/* Real screenshot if available */}
      {displaySetting.screenshot_url && (
        <div className="setting-screenshot" style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>設定画面スクリーンショット</span>
          </div>
          {isSupabaseImage(displaySetting.screenshot_url) ? (
            <Image src={displaySetting.screenshot_url} alt={displaySetting.title} width={1200} height={675} sizes="(max-width: 840px) 100vw, 840px" style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid var(--border)", display: "block" }} />
          ) : (
            // 管理画面に登録された旧URLも壊さず表示する。新規画像はSupabaseへ保存する。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displaySetting.screenshot_url} alt={displaySetting.title} loading="lazy" decoding="async" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", display: "block" }} />
          )}
        </div>
      )}

      {/* Steps */}
      <div className="steps-card" style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>手順</h2>
          <span className="no-print"><CopyStepsButton steps={displaySetting.steps} path={displaySetting.path} /></span>
        </div>
        <StepChecklist steps={displaySetting.steps} progressKey={progressKey} />
      </div>

      {(displaySetting.caution || displaySetting.rollback) && (
        <div className="notice-card" style={{ ...card, background: "var(--surface-2)" }}>
          {displaySetting.caution && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}><strong>注意：</strong>{displaySetting.caution}</p>}
          {displaySetting.rollback && <p style={{ margin: displaySetting.caution ? "10px 0 0" : 0, fontSize: 13, lineHeight: 1.7 }}><strong>元に戻す：</strong>{displaySetting.rollback}</p>}
        </div>
      )}

      <GuideFollowUp setting={displaySetting} />

      {/* Helpful + report */}
      <div className="feedback-card no-print" style={{ ...card, padding: "18px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <HelpfulButton settingId={setting.id} initialCount={setting.helpful_count || 0} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>更新: {new Date(setting.updated_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          <ReportButton settingId={setting.id} title={displaySetting.title} />
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="share-card no-print" style={{ ...card, padding: "18px 28px" }}>
        <ShareBar title={displaySetting.title} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="related-card" style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>関連する設定・解決方法</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {related.map((r) => (
              <Link key={r.id} href={`/setting/${r.slug}?os=${r.os}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)", textDecoration: "none", color: "var(--text)" }}>
                <OSBadge os={r.os} />
                <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>{r.title}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="no-print" style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <Link href={`/os/${setting.os}`} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
          ← {OS_LABELS[setting.os]}のガイド一覧に戻る
        </Link>
      </div>
    </div>
  );
}

function riskPresentation(level: ArticleRiskLevel | null): { label: string; fallback: string } | null {
  if (level === "data-loss") return { label: "データ消失の可能性", fallback: "削除・初期化・リセットの前に、必要なデータと復旧方法を確認してください。" };
  if (level === "security") return { label: "セキュリティ注意", fallback: "保護機能を弱める変更は影響を理解し、必要な範囲だけで行ってください。" };
  if (level === "admin") return { label: "管理者権限の可能性", fallback: "会社・学校の端末では実行せず、管理者へ確認してください。" };
  if (level === "caution") return { label: "注意事項あり", fallback: "注意事項を確認してから操作してください。" };
  return null;
}

function isSupabaseImage(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:" && new URL(value).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
