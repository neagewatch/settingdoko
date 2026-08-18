import { getSettingsByOS } from "@/lib/data";

export const revalidate = 60; // 60秒ごとに再生成
import { OSType, OS_LABELS, CATEGORIES, PRIMARY_OS_TYPES } from "@/lib/types";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ os: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { os } = await params;
  const label = OS_LABELS[os];
  if (!label) return { title: "OS Not Found" };
  return {
    title: `${label}の設定一覧`,
    description: `${label}の設定場所・最短手順を、目的とカテゴリから探せます。`,
    alternates: { canonical: `/os/${os}` },
  };
}

export default async function OSPage({ params }: Props) {
  const { os } = await params;
  const osType = os as OSType;

  if (!OS_LABELS[osType]) notFound();

  const settings = await getSettingsByOS(osType);

  // Group by category
  const grouped: Record<string, typeof settings> = {};
  for (const s of settings) {
    const cat = s.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  return (
    <div className="listing-page os-page" style={{ padding: "32px 0" }}>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ marginBottom: 24 }}>
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          トップ
        </Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>›</span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {OS_LABELS[osType]}
        </span>
      </div>

      <h1 className="page-title"
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        {OS_LABELS[osType]} の設定
      </h1>
      <p className="page-subtitle"
        style={{
          fontSize: 15,
          color: "var(--text-secondary)",
          marginBottom: 28,
        }}
      >
        {settings.length}件の設定ガイド
      </p>

      {/* OS switcher */}
      <div className="os-switcher" style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {PRIMARY_OS_TYPES.map((o) => (
          <Link
            key={o}
            href={`/os/${o}`}
            className={`os-tab ${o === osType ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            {OS_LABELS[o]}
          </Link>
        ))}
      </div>

      {/* Grouped settings */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="category-group" style={{ marginBottom: 36 }}>
          <h2 className="category-heading"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 14,
              paddingBottom: 8,
              borderBottom: "1px solid var(--border)",
            }}
          >
            {CATEGORIES[category] || category}
          </h2>
          <div className="setting-list"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {items.map((s) => (
              <SettingCard key={s.id} setting={s} />
            ))}
          </div>
        </div>
      ))}
      {settings.length === 0 && (
        <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
          <p style={{ margin: 0 }}>このOSのガイドは準備中です。</p>
          <Link href="/" style={{ display: "inline-block", marginTop: 12, color: "var(--primary)" }}>トップで検索する →</Link>
        </div>
      )}
    </div>
  );
}
