import { getAllSettings } from "@/lib/data";

export const revalidate = 60;
import { OS_LABELS } from "@/lib/types";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FEATURES } from "@/lib/features";

type Props = { params: Promise<{ id: string }> };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://settingdoko.vercel.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const feature = FEATURES.find(f => f.id === id);
  if (!feature) return { title: "特集" };
  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(feature.emoji + " " + feature.title)}`;
  return {
    title: feature.title,
    description: feature.description,
    openGraph: {
      title: `${feature.title} | 設定どこ？`,
      description: feature.description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImageUrl] },
    alternates: { canonical: `/feature/${id}` },
  };
}

export default async function FeaturePage({ params }: Props) {
  const { id } = await params;
  const feature = FEATURES.find(f => f.id === id);
  if (!feature) notFound();

  const allSettings = await getAllSettings();
  let settings = allSettings;

  if (feature.os) settings = settings.filter(s => s.os === feature.os);
  if (feature.slugs) {
    const order = feature.slugs;
    settings = order.map(slug => settings.find(s => s.slug === slug)).filter(Boolean) as typeof settings;
  } else if (feature.categories) {
    settings = settings.filter(s => feature.categories!.includes(s.category));
  }

  const featureNumber = String(FEATURES.findIndex((item) => item.id === id) + 1).padStart(2, "0");

  return (
    <div className="listing-page feature-page" style={{ padding: "32px 0 60px" }}>
      <div className="breadcrumb" style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>特集</span>
      </div>

      <div className="feature-page-heading" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <span className="feature-page-mark" aria-hidden="true">{featureNumber}</span>
        <div>
          <p className="section-index">特集</p>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{feature.title}</h1>
          <p className="page-subtitle" style={{ marginTop: 4 }}>{feature.description}</p>
        </div>
      </div>

      {feature.os && (
        <div style={{ marginBottom: 24 }}>
          <span className="feature-os-badge" style={{ fontSize: 13, color: "var(--text-secondary)", background: "var(--surface-2)", padding: "4px 12px", borderRadius: 999, border: "1px solid var(--border)" }}>
            {OS_LABELS[feature.os]}
          </span>
        </div>
      )}

      <p className="result-count" style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>{settings.length}件の設定</p>

      <div className="feature-setting-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {settings.map((s, i) => (
          <div key={s.id} className="feature-setting-item" style={{ position: "relative" }}>
            {feature.slugs && (
              <span className="feature-setting-number" style={{
                position: "absolute", left: -32, top: 22, width: 22, height: 22,
                background: "var(--primary)", color: "white", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>{i + 1}</span>
            )}
            <SettingCard setting={s} />
          </div>
        ))}
      </div>

      {/* Other features */}
      <div className="other-features" style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>他の特集</h2>
        <div className="other-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {FEATURES.filter(f => f.id !== id).map(f => (
            <Link key={f.id} href={`/feature/${f.id}`} className="other-feature-card" style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              textDecoration: "none", color: "var(--text)",
            }}>
              <span className="other-feature-mark" aria-hidden="true">{String(FEATURES.findIndex((item) => item.id === f.id) + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{f.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
