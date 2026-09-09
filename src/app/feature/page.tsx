import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/lib/features";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "特集・設定チェックリスト",
  description: "初期設定、通知、プライバシー、接続トラブルなど、目的別に設定をまとめて確認できます。",
  alternates: { canonical: "/feature" },
};

export default function FeatureIndexPage() {
  return (
    <div className="listing-page feature-index-page" style={{ padding: "32px 0 60px" }}>
      <nav className="breadcrumb" aria-label="パンくず" style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>特集</span>
      </nav>

      <div className="listing-heading">
        <p className="section-index">特集 / まとめて探す</p>
        <h1>特集・設定チェックリスト</h1>
        <p>目的に近いまとめを選ぶと、関連する設定を順番に確認できます。</p>
      </div>

      <div className="feature-index-grid" aria-label="特集一覧">
        {FEATURES.map((feature, index) => (
          <Link key={feature.id} href={`/feature/${feature.id}`} className="feature-index-card">
            <span className="feature-index-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="feature-index-copy">
              <strong>{feature.title}</strong>
              <small>{feature.description}</small>
            </span>
            <span className="feature-index-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
