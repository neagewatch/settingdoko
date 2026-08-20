export const revalidate = 60;

import { getSettingsByCategory } from "@/lib/data";
import { OS_LABELS, CATEGORIES, PRIMARY_OS_TYPES, isOSType } from "@/lib/types";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ cat: string }>;
  searchParams: Promise<{ page?: string | string[]; os?: string | string[] }>;
};

const CATEGORY_PAGE_SIZE = 20;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(cat: string, page: number, os?: string): string {
  const query = new URLSearchParams();
  if (os) query.set("os", os);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return `/category/${cat}${suffix ? `?${suffix}` : ""}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const label = CATEGORIES[cat];
  if (!label) return { title: "カテゴリ" };
  return {
    title: `${label}の設定・トラブル解決一覧`,
    description: `Windows 11・iPhone・Android・Mac・各種アプリの${label}に関する設定方法と解決手順を探せます。`,
    alternates: { canonical: `/category/${cat}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { cat } = await params;
  if (!CATEGORIES[cat]) notFound();

  const query = await searchParams;
  const requestedPage = Number.parseInt(firstParam(query.page) || "1", 10);
  const safeRequestedPage = Number.isFinite(requestedPage) ? Math.max(1, Math.min(1000, requestedPage)) : 1;
  const osParam = firstParam(query.os);
  const selectedOS = osParam && isOSType(osParam) ? osParam : undefined;
  let pageResult = await getSettingsByCategory(cat, { os: selectedOS, page: safeRequestedPage, pageSize: CATEGORY_PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(pageResult.total / CATEGORY_PAGE_SIZE));
  const currentPage = Math.min(safeRequestedPage, totalPages);
  if (currentPage !== safeRequestedPage) {
    pageResult = await getSettingsByCategory(cat, { os: selectedOS, page: currentPage, pageSize: CATEGORY_PAGE_SIZE });
  }
  const settings = pageResult.items;

  // OS別にグループ化
  const byOS: Record<string, typeof settings> = {};
  for (const s of settings) {
    if (!byOS[s.os]) byOS[s.os] = [];
    byOS[s.os].push(s);
  }

  // 全カテゴリ一覧（ナビ用）。記事全件を取得せず、定義済みカテゴリから作る。
  const allCats = Object.keys(CATEGORIES);
  const firstItem = pageResult.total === 0 ? 0 : (currentPage - 1) * CATEGORY_PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * CATEGORY_PAGE_SIZE, pageResult.total);

  return (
    <div className="listing-page category-page" style={{ padding: "32px 0 60px" }}>
      <div className="breadcrumb" style={{ marginBottom: 24, fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 6 }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{CATEGORIES[cat]}</span>
      </div>

      <p className="section-index">CATEGORY / カテゴリから探す</p>
      <h1 className="page-title" style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{CATEGORIES[cat]}</h1>
      <p className="page-subtitle" style={{ marginBottom: 18 }}>
        {pageResult.total}件の設定ガイド
        {pageResult.total > 0 && <span className="listing-range">（{firstItem}〜{lastItem}件を表示）</span>}
      </p>

      {/* カテゴリ横断ナビ */}
      <div className="category-switcher" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36, overflowX: "auto" }}>
        {allCats.map((c) => (
          <Link key={c} href={`/category/${c}`} className={`filter-chip ${c === cat ? "active" : ""}`}>
            {CATEGORIES[c] || c}
          </Link>
        ))}
      </div>

      <div className="category-os-filter" aria-label="OSで絞り込む">
        <span className="category-os-filter-label">端末</span>
        <Link href={pageHref(cat, 1)} className={`filter-chip ${!selectedOS ? "active" : ""}`}>すべて</Link>
        {PRIMARY_OS_TYPES.map((os) => (
          <Link key={os} href={pageHref(cat, 1, os)} className={`filter-chip ${selectedOS === os ? "active" : ""}`}>
            {OS_LABELS[os]}
          </Link>
        ))}
      </div>

      {/* OS別グループ */}
      {Object.entries(byOS).map(([os, items]) => (
        <div key={os} className="category-os-group" style={{ marginBottom: 40 }}>
          <h2 className="category-os-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="category-os-badge" style={{ padding: "3px 12px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)", fontSize: 13 }}>
              {OS_LABELS[os]}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>{items.length}件表示</span>
          </h2>
          <div className="setting-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((s) => <SettingCard key={s.id} setting={s} />)}
          </div>
        </div>
      ))}

      {settings.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <p>このカテゴリの設定はまだありません</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="category-pagination" aria-label="カテゴリのページ移動">
          {currentPage > 1 ? (
            <Link href={pageHref(cat, currentPage - 1, selectedOS)}>← 前の20件</Link>
          ) : <span aria-hidden="true" />}
          <span aria-current="page">{currentPage} / {totalPages}ページ</span>
          {currentPage < totalPages ? (
            <Link href={pageHref(cat, currentPage + 1, selectedOS)}>次の20件 →</Link>
          ) : <span aria-hidden="true" />}
        </nav>
      )}
    </div>
  );
}
