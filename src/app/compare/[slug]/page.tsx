import { getSettingsBySlug } from "@/lib/data";

export const revalidate = 60;
import { OS_LABELS, CATEGORIES } from "@/lib/types";
import PathTrail from "@/components/PathTrail";
import OSBadge from "@/components/OSBadge";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getSettingsBySlug(slug);
  if (!settings.length) return { title: "比較" };
  return {
    title: `${settings[0].title} — OS別比較`,
    description: `${settings[0].title}の設定方法をWindows・iPhone・Macで比較します。`,
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSettingsBySlug(slug);
  if (!settings.length) notFound();

  const title = settings[0].title;

  return (
    <div style={{ padding: "32px 0 60px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>OS比較</span>
        <span style={{ margin: "0 8px" }}>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{title}</span>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
        {title}
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>
        OS別の設定場所・手順を横並びで比較
      </p>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${settings.length}, 1fr)`, gap: 16 }}>
        {settings.map((s) => (
          <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
              <OSBadge os={s.os} />
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{s.version}</div>
            </div>
            {/* Path */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>設定場所</p>
              <PathTrail path={s.path} />
            </div>
            {/* Steps */}
            <div style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>手順</p>
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {s.steps.map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ background: "var(--primary)", color: "white", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            {/* Link */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
              <Link href={`/setting/${s.slug}?os=${s.os}`} style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>
                詳細を見る →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
