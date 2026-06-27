export const revalidate = 60;

import { getAllSettings } from "@/lib/data";
import { OS_LABELS, CATEGORIES } from "@/lib/types";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ cat: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const label = CATEGORIES[cat];
  if (!label) return { title: "カテゴリ" };
  return {
    title: `${label}の設定一覧`,
    description: `Windows・iPhone・Macの${label}に関する設定場所・手順を一覧で見られます。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  if (!CATEGORIES[cat]) notFound();

  const all = await getAllSettings();
  const settings = all.filter((s) => s.category === cat);

  // OS別にグループ化
  const byOS: Record<string, typeof settings> = {};
  for (const s of settings) {
    if (!byOS[s.os]) byOS[s.os] = [];
    byOS[s.os].push(s);
  }

  // 全カテゴリ一覧（ナビ用）
  const allCats = [...new Set(all.map((s) => s.category))];

  return (
    <div style={{ padding: "32px 0 60px" }}>
      <div style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6 }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{CATEGORIES[cat]}</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{CATEGORIES[cat]}</h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>{settings.length}件の設定ガイド</p>

      {/* カテゴリ横断ナビ */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36, overflowX: "auto" }}>
        {allCats.map((c) => (
          <Link key={c} href={`/category/${c}`} className={`filter-chip ${c === cat ? "active" : ""}`}>
            {CATEGORIES[c] || c}
          </Link>
        ))}
      </div>

      {/* OS別グループ */}
      {Object.entries(byOS).map(([os, items]) => (
        <div key={os} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "3px 12px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)", fontSize: 13 }}>
              {OS_LABELS[os]}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>{items.length}件</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((s) => <SettingCard key={s.id} setting={s} />)}
          </div>
        </div>
      ))}

      {settings.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <p>このカテゴリの設定はまだありません</p>
        </div>
      )}
    </div>
  );
}
