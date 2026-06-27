import { getSettingBySlugAndOS, getSettingsBySlug, getRelatedSettings } from "@/lib/data";
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
  return {
    title: `${setting.title}（${OS_LABELS[setting.os]}）`,
    description: `${OS_LABELS[setting.os]}で${setting.title}方法。設定場所：${setting.path.join(" > ")}`,
    openGraph: {
      title: `${setting.title} | 設定どこ？`,
      description: setting.description,
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: setting.title,
    description: setting.description,
    step: setting.steps.map((step, i) => ({ "@type": "HowToStep", position: i + 1, text: step })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://settingdoko.vercel.app/" },
      { "@type": "ListItem", position: 2, name: OS_LABELS[setting.os], item: `https://settingdoko.vercel.app/os/${setting.os}` },
      { "@type": "ListItem", position: 3, name: setting.title },
    ],
  };

  const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px 28px", marginBottom: 14 };

  return (
    <div style={{ padding: "28px 0 60px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ViewTracker slug={slug} os={setting.os} title={setting.title} />

      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span>›</span>
        <Link href={`/os/${setting.os}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{OS_LABELS[setting.os]}</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{setting.title}</span>
      </div>

      {/* OS Tabs */}
      {availableOS.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <OSTabs current={setting.os} slug={slug} availableOS={availableOS} />
          <Link href={`/compare/${slug}`} style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", marginLeft: 8, padding: "6px 12px", border: "1px solid var(--primary)", borderRadius: 999 }}>
            OS比較 →
          </Link>
        </div>
      )}

      {/* Header */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <OSBadge os={setting.os} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>
                {setting.version}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 10px", borderRadius: 6 }}>
                {CATEGORIES[setting.category] || setting.category}
              </span>
              {setting.difficulty && (
                <span className="diff-badge" style={{
                  background: `${DIFFICULTY_COLORS[setting.difficulty]}20`,
                  color: DIFFICULTY_COLORS[setting.difficulty],
                  border: `1px solid ${DIFFICULTY_COLORS[setting.difficulty]}40`,
                }}>
                  {DIFFICULTY_LABELS[setting.difficulty]}
                </span>
              )}
              {setting.estimate_minutes && (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱ 約{setting.estimate_minutes}分</span>
              )}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
              {setting.title}
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
              {setting.description}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <BookmarkButton slug={slug} os={setting.os} title={setting.title} category={setting.category} />
          </div>
        </div>

        {/* Path */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>設定場所</span>
            <CopyPathButton path={setting.path} />
          </div>
          <PathTrail path={setting.path} />
        </div>
      </div>

      {/* Mock screenshot */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>設定画面イメージ</span>
        </div>
        <MockScreenshot os={setting.os} category={setting.category} path={setting.path} title={setting.title} />
      </div>

      {/* Steps with checklist */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>手順</h2>
          <CopyStepsButton steps={setting.steps} path={setting.path} />
        </div>
        <StepChecklist steps={setting.steps} progressKey={progressKey} />
      </div>

      {/* Helpful feedback */}
      <div style={{ ...card, padding: "18px 28px" }}>
        <HelpfulButton settingId={setting.id} />
      </div>

      {/* Share */}
      <div style={{ ...card, padding: "18px 28px" }}>
        <ShareBar title={setting.title} />
      </div>

      {/* Related settings */}
      {related.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>関連する設定</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {related.map((r) => (
              <Link key={r.id} href={`/setting/${r.slug}?os=${r.os}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)",
                textDecoration: "none", color: "var(--text)",
              }}>
                <OSBadge os={r.os} />
                <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>{r.title}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nav: prev/next placeholder */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Link href={`/os/${setting.os}`} style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", padding: "8px 0" }}>
          ← {OS_LABELS[setting.os]}の設定一覧に戻る
        </Link>
        {availableOS.length > 1 && (
          <Link href={`/compare/${slug}`} style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", padding: "8px 0" }}>
            OS比較を見る →
          </Link>
        )}
      </div>
    </div>
  );
}
