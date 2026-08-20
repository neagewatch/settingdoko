export const revalidate = 60;

import { getSettingsBySlug, getRelatedSettings, getSettingsByOS } from "@/lib/data";
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
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { safeJsonLd } from "@/lib/structured-data";
import { getArticleRiskLevel, isReviewOverdue, isSettingIndexable, sourceLabel, type ArticleRiskLevel } from "@/lib/content-quality";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ os?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { os } = await searchParams;
  if (os && !isOSType(os)) return { title: "設定が見つかりません", robots: "noindex" };
  const allOS = await getSettingsBySlug(slug);
  const setting = os ? allOS.find((item) => item.os === os) : allOS.find((item) => item.os === "windows11") || allOS[0];
  if (!setting) return { title: "設定が見つかりません" };
  const versionLabel = setting.version ? ` ${setting.version}` : "";
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(setting.title)}&os=${setting.os}&path=${encodeURIComponent(setting.path.join(" › "))}`;
  const description = `${setting.description} 対応：${OS_LABELS[setting.os]}${versionLabel}`.slice(0, 160);
  return {
    title: `${setting.title}（${OS_LABELS[setting.os]}${versionLabel}）`,
    description,
    robots: isSettingIndexable(setting) ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${setting.title} | 設定どこ？`,
      description: setting.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: setting.title }],
    },
    twitter: { card: "summary_large_image", title: `${setting.title} | 設定どこ？`, description: setting.description, images: [ogImageUrl] },
    alternates: { canonical: `/setting/${setting.slug}?os=${setting.os}` },
  };
}

export default async function SettingDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { os } = await searchParams;
  const allOS = await getSettingsBySlug(slug);
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

  // 前/次ナビ用：同OSのカテゴリ内設定を取得
  const osSettings = await getSettingsByOS(setting.os as OSType);
  const catSettings = osSettings.filter((s) => s.category === setting.category);
  const currentIdx = catSettings.findIndex((s) => s.slug === setting.slug);
  const prevSetting = currentIdx > 0 ? catSettings[currentIdx - 1] : null;
  const nextSetting = currentIdx < catSettings.length - 1 ? catSettings[currentIdx + 1] : null;
  const explicitlyRelated = await getRelatedSettings(setting.related_slugs, setting.id);
  const related = explicitlyRelated.length > 0
    ? explicitlyRelated
    : catSettings.filter((item) => item.id !== setting.id).slice(0, 4);
  const stepImages = setting.steps
    .map(getStepImage)
    .flatMap(({ image_url }) => image_url ? [image_url] : []);

  const canonicalUrl = `${BASE_URL}/setting/${setting.slug}?os=${setting.os}`;
  const articleLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: setting.title,
    description: setting.description,
    datePublished: setting.published_at || setting.updated_at,
    dateModified: setting.updated_at,
    mainEntityOfPage: canonicalUrl,
    articleSection: CATEGORIES[setting.category] || setting.category,
    author: { "@type": "Organization", name: "設定どこ？", url: BASE_URL },
    publisher: { "@type": "Organization", name: "設定どこ？", url: BASE_URL },
    ...(setting.source_url ? { citation: setting.source_url } : {}),
    ...(stepImages.length > 0 ? { image: stepImages } : setting.screenshot_url ? { image: [setting.screenshot_url] } : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: OS_LABELS[setting.os], item: `${BASE_URL}/os/${setting.os}` },
      { "@type": "ListItem", position: 3, name: setting.title, item: canonicalUrl },
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
      <ViewTracker slug={slug} os={setting.os} title={setting.title} />

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
        <span style={{ color: "var(--text-secondary)" }}>{setting.title}</span>
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
              <OSBadge os={setting.os} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>{setting.version}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>{CATEGORIES[setting.category] || setting.category}</span>
              <span className="article-status-chip">全{setting.steps.length}手順</span>
              {setting.verified_at && <span className="article-status-chip verified">{new Date(setting.verified_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}確認</span>}
              {risk && <span className={`article-status-chip risk-${riskLevel}`}>{risk.label}</span>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.01em" }}>{setting.title}</h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{setting.description}</p>
          </div>
          <div className="no-print">
            <BookmarkButton slug={slug} os={setting.os} title={setting.title} category={setting.category} />
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>設定場所</span>
            <span className="no-print"><CopyPathButton path={setting.path} /></span>
          </div>
          <PathTrail path={setting.path} />
        </div>
      </div>

      {/* 最短回答 */}
      <div className="answer-card" style={{ ...card, borderColor: "var(--primary)", background: "var(--primary-soft)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--primary)", marginBottom: 8 }}>最短回答</div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.7 }}>
          {setting.path.join(" → ")}
        </p>
        {setting.device_scope && <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>対象：{setting.device_scope}</p>}
        {setting.impact && <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-secondary)" }}><strong>設定するとどうなる：</strong>{setting.impact}</p>}
      </div>

      {!setting.verified_at && (
        <aside className="verification-note" style={{ ...card, padding: "14px 18px", borderColor: "#FBBF24", background: "#FFFBEB", color: "#92400E", fontSize: 13, lineHeight: 1.7 }}>
          <strong>確認日未登録：</strong>OSの更新で設定名や場所が変わることがあります。画面が異なる場合は、下の「情報が古い・間違いを報告」から教えてください。
        </aside>
      )}

      {reviewOverdue && (
        <aside className="verification-note" style={{ ...card, padding: "14px 18px", fontSize: 13, lineHeight: 1.7 }}>
          <strong>再確認が必要です：</strong>見直し予定日を過ぎています。画面や項目名が違う場合は、ページ下部からお知らせください。
        </aside>
      )}

      {risk && !setting.caution && (
        <aside className={`risk-notice risk-${riskLevel}`} style={{ ...card, padding: "16px 18px" }}>
          <strong>{risk.label}：</strong>{risk.fallback}
        </aside>
      )}

      {/* Real screenshot if available */}
      {setting.screenshot_url && (
        <div className="setting-screenshot" style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>設定画面スクリーンショット</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setting.screenshot_url} alt={setting.title} style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", display: "block" }} />
        </div>
      )}

      {/* Steps */}
      <div className="steps-card" style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>手順</h2>
          <span className="no-print"><CopyStepsButton steps={setting.steps} path={setting.path} /></span>
        </div>
        <StepChecklist steps={setting.steps} progressKey={progressKey} />
      </div>

      {(setting.caution || setting.rollback) && (
        <div className="notice-card" style={{ ...card, background: "var(--surface-2)" }}>
          {setting.caution && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}><strong>注意：</strong>{setting.caution}</p>}
          {setting.rollback && <p style={{ margin: setting.caution ? "10px 0 0" : 0, fontSize: 13, lineHeight: 1.7 }}><strong>元に戻す：</strong>{setting.rollback}</p>}
        </div>
      )}

      {/* Helpful + report */}
      <div className="feedback-card no-print" style={{ ...card, padding: "18px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <HelpfulButton settingId={setting.id} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>更新: {new Date(setting.updated_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</span>
              {setting.verified_at ? <span style={{ fontSize: 12, color: "#15803D" }}>✓ {new Date(setting.verified_at).toLocaleDateString("ja-JP")}に確認</span> : <span style={{ fontSize: 12, color: "var(--danger)" }}>検証日未登録</span>}
              {setting.source_url && <a href={setting.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>{sourceLabel(setting.source_url)} ↗</a>}
            </div>
            <ReportButton settingId={setting.id} title={setting.title} />
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="share-card no-print" style={{ ...card, padding: "18px 28px" }}>
        <ShareBar title={setting.title} />
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

      {/* Prev/Next nav */}
      <div className="prev-next-nav no-print">
        {prevSetting ? (
          <Link href={`/setting/${prevSetting.slug}?os=${prevSetting.os}`} className="prev-next-btn prev">
            <span className="prev-next-label">← 前の設定</span>
            <span className="prev-next-title">{prevSetting.title}</span>
          </Link>
        ) : <div />}
        {nextSetting ? (
          <Link href={`/setting/${nextSetting.slug}?os=${nextSetting.os}`} className="prev-next-btn next">
            <span className="prev-next-label">次の設定 →</span>
            <span className="prev-next-title">{nextSetting.title}</span>
          </Link>
        ) : <div />}
      </div>

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
