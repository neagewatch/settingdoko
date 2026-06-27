export const revalidate = 60;

import { getSettingBySlugAndOS, getSettingsBySlug, getRelatedSettings, getSettingsByOS } from "@/lib/data";
import { OSType, OS_LABELS, CATEGORIES, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/types";
import PathTrail from "@/components/PathTrail";
import OSTabs from "@/components/OSTabs";
import OSBadge from "@/components/OSBadge";
import CopyPathButton from "@/components/CopyPathButton";
import { ViewTracker, HelpfulButton } from "@/components/Feedback";
import BookmarkButton from "@/components/BookmarkButton";
import ShareBar from "@/components/ShareBar";
import StepChecklist from "@/components/StepChecklist";
import MockScreenshot from "@/components/MockScreenshot";
import { CopyStepsButton } from "@/components/Utilities";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ os?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { os } = await searchParams;
  const osType = (os as OSType) || "windows11";
  const setting = await getSettingBySlugAndOS(slug, osType);
  if (!setting) return { title: "設定が見つかりません" };
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(setting.title)}&os=${setting.os}&path=${encodeURIComponent(setting.path.join(" › "))}`;
  return {
    title: `${setting.title}（${OS_LABELS[setting.os]}）`,
    description: `${OS_LABELS[setting.os]}で${setting.title}方法。設定場所：${setting.path.join(" > ")}`,
    openGraph: {
      title: `${setting.title} | 設定どこ？`,
      description: setting.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: setting.title }],
    },
    twitter: { card: "summary_large_image", title: `${setting.title} | 設定どこ？`, description: setting.description, images: [ogImageUrl] },
  };
}

export default async function SettingDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { os } = await searchParams;
  const osType = (os as OSType) || "windows11";

  const setting = await getSettingBySlugAndOS(slug, osType);
  const allOS = await getSettingsBySlug(slug);
  const availableOS = allOS.map((s) => s.os);

  if (!setting) {
    if (allOS.length > 0) return renderDetail(allOS[0], slug, availableOS);
    notFound();
  }
  return renderDetail(setting, slug, availableOS);
}

async function renderDetail(
  setting: NonNullable<Awaited<ReturnType<typeof getSettingBySlugAndOS>>>,
  slug: string,
  availableOS: string[]
) {
  const related = await getRelatedSettings(setting.related_slugs, setting.id);
  const progressKey = `${setting.slug}-${setting.os}`;

  // 前/次ナビ用：同OSのカテゴリ内設定を取得
  const osSettings = await getSettingsByOS(setting.os as OSType);
  const catSettings = osSettings.filter((s) => s.category === setting.category);
  const currentIdx = catSettings.findIndex((s) => s.slug === setting.slug);
  const prevSetting = currentIdx > 0 ? catSettings[currentIdx - 1] : null;
  const nextSetting = currentIdx < catSettings.length - 1 ? catSettings[currentIdx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "HowTo",
    name: setting.title, description: setting.description,
    step: setting.steps.map((step, i) => ({ "@type": "HowToStep", position: i + 1, text: step })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: OS_LABELS[setting.os], item: `${BASE_URL}/os/${setting.os}` },
      { "@type": "ListItem", position: 3, name: setting.title },
    ],
  };
  // FAQ Schema
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: `${OS_LABELS[setting.os]}で${setting.title}方法は？`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${setting.description} 設定場所：${setting.path.join(" > ")}。手順：${setting.steps.join("→")}`,
      },
    }],
  };

  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px 28px", marginBottom: 14 };

  return (
    <div style={{ padding: "28px 0 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ViewTracker slug={slug} os={setting.os} title={setting.title} />

      {/* 印刷用ヘッダー（画面では非表示） */}
      <div className="print-header" style={{ display: "none" }}>
        <span className="print-header-logo">⚙️ 設定どこ？</span>
        <span className="print-header-url">{BASE_URL}/setting/{slug}?os={setting.os}</span>
      </div>

      {/* Breadcrumb */}
      <div className="no-print" style={{ marginBottom: 20, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span>›</span>
        <Link href={`/os/${setting.os}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{OS_LABELS[setting.os]}</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{setting.title}</span>
      </div>

      {/* OS Tabs */}
      {availableOS.length > 1 && (
        <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <OSTabs current={setting.os} slug={slug} availableOS={availableOS} />
          <Link href={`/compare/${slug}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", marginLeft: 8, padding: "6px 12px", border: "1px solid var(--primary)", borderRadius: 999 }}>
            OS比較 →
          </Link>
        </div>
      )}

      {/* Header card */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <OSBadge os={setting.os} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>{setting.version}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>{CATEGORIES[setting.category] || setting.category}</span>
              {setting.difficulty && (
                <span className="diff-badge" style={{ background: `${DIFFICULTY_COLORS[setting.difficulty]}20`, color: DIFFICULTY_COLORS[setting.difficulty], border: `1px solid ${DIFFICULTY_COLORS[setting.difficulty]}40` }}>
                  {DIFFICULTY_LABELS[setting.difficulty]}
                </span>
              )}
              {setting.estimate_minutes && (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱ 約{setting.estimate_minutes}分</span>
              )}
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

      {/* Mock screenshot */}
      <div className="no-print" style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>設定画面イメージ</span>
        </div>
        <MockScreenshot os={setting.os} category={setting.category} path={setting.path} title={setting.title} />
      </div>

      {/* Steps */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>手順</h2>
          <span className="no-print"><CopyStepsButton steps={setting.steps} path={setting.path} /></span>
        </div>
        <StepChecklist steps={setting.steps} progressKey={progressKey} />
      </div>

      {/* Helpful */}
      <div className="no-print" style={{ ...card, padding: "18px 28px" }}>
        <HelpfulButton settingId={setting.id} />
      </div>

      {/* Share */}
      <div className="no-print" style={{ ...card, padding: "18px 28px" }}>
        <ShareBar title={setting.title} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>関連する設定</h2>
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
          ← {OS_LABELS[setting.os]}の設定一覧に戻る
        </Link>
      </div>
    </div>
  );
}
