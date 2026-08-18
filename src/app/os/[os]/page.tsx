import { getOSCategoryCounts, getSettingsByOSPage } from "@/lib/data";

export const revalidate = 60;

import { CATEGORIES, OSType, OS_LABELS, PRIMARY_OS_TYPES } from "@/lib/types";
import SearchBox from "@/components/SearchBox";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ os: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

function pageHref(os: OSType, category?: string, page = 1): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/os/${os}${query ? `?${query}` : ""}`;
}

function parsePage(value?: string): number {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(1000, parsed)) : 1;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { os } = await params;
  const label = OS_LABELS[os];
  if (!label) return { title: "OS Not Found" };
  return {
    title: `${label}の設定一覧`,
    description: `${label}の設定場所・最短手順を、目的と小ジャンルから探せます。`,
    alternates: { canonical: `/os/${os}` },
  };
}

export default async function OSPage({ params, searchParams }: Props) {
  const { os } = await params;
  const { category: rawCategory, page: rawPage } = await searchParams;
  const osType = os as OSType;

  if (!OS_LABELS[osType]) notFound();

  const selectedCategory = rawCategory && CATEGORIES[rawCategory] ? rawCategory : undefined;
  const requestedPage = parsePage(rawPage);
  const [categoryCounts, requestedResult] = await Promise.all([
    getOSCategoryCounts(osType),
    getSettingsByOSPage(osType, { category: selectedCategory, page: requestedPage, pageSize: PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(requestedResult.total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageResult = currentPage === requestedPage
    ? requestedResult
    : await getSettingsByOSPage(osType, { category: selectedCategory, page: currentPage, pageSize: PAGE_SIZE });
  const { items } = pageResult;

  const categoryEntries = Object.entries(categoryCounts)
    .filter(([, count]) => count > 0)
    .sort(([left], [right]) => {
      const leftIndex = Object.keys(CATEGORIES).indexOf(left);
      const rightIndex = Object.keys(CATEGORIES).indexOf(right);
      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right, "ja");
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    });
  const start = pageResult.total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, pageResult.total);

  return (
    <div className="listing-page os-page" style={{ padding: "32px 0 60px" }}>
      <div className="breadcrumb" style={{ marginBottom: 24 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>トップ</Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>›</span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{OS_LABELS[osType]}</span>
      </div>

      <div className="listing-heading os-page-heading">
        <p className="section-index">OS / {OS_LABELS[osType]}</p>
        <h1>{OS_LABELS[osType]}の設定</h1>
        <p>{pageResult.total}件の設定ガイドを、小ジャンルとページに分けて表示しています。</p>
      </div>

      <section className="os-page-search" aria-labelledby="os-search-heading">
        <div className="os-page-search-heading">
          <span className="section-index">SEARCH / このOSから探す</span>
          <h2 id="os-search-heading">困っていることをそのまま検索</h2>
        </div>
        <SearchBox large showButton os={osType} />
        <p className="os-page-search-note">例：通知うるさい、拡張子を見たい、Wi-Fiがつながらない</p>
      </section>

      <nav className="os-switcher" aria-label="OSを切り替える">
        {PRIMARY_OS_TYPES.map((targetOS) => (
          <Link key={targetOS} href={`/os/${targetOS}`} className={`os-tab ${targetOS === osType ? "active" : ""}`} aria-current={targetOS === osType ? "page" : undefined}>
            {OS_LABELS[targetOS]}
          </Link>
        ))}
      </nav>

      <section className="os-category-panel" aria-labelledby="os-category-heading">
        <div className="os-category-panel-heading">
          <h2 id="os-category-heading">小ジャンルから探す</h2>
          <span>{categoryEntries.length}ジャンル</span>
        </div>
        <div className="os-category-nav" role="list">
          <Link href={pageHref(osType)} className={`os-category-tab ${!selectedCategory ? "active" : ""}`} aria-current={!selectedCategory ? "page" : undefined}>
            すべて <small>{Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}</small>
          </Link>
          {categoryEntries.map(([category, count]) => (
            <Link key={category} href={pageHref(osType, category)} className={`os-category-tab ${selectedCategory === category ? "active" : ""}`} aria-current={selectedCategory === category ? "page" : undefined}>
              {CATEGORIES[category] || category} <small>{count}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="os-results" aria-labelledby="os-results-heading">
        <div className="os-results-heading">
          <div>
            <p className="section-index">GUIDES / 設定ガイド</p>
            <h2 id="os-results-heading">{selectedCategory ? CATEGORIES[selectedCategory] : "すべての設定"}</h2>
          </div>
          <p className="listing-range">{start}–{end} / {pageResult.total}件</p>
        </div>

        {items.length > 0 ? (
          <div className="setting-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((setting) => <SettingCard key={setting.id} setting={setting} />)}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
            <p style={{ margin: 0 }}>このジャンルのガイドはまだありません。</p>
            <Link href={`/os/${osType}`} style={{ display: "inline-block", marginTop: 12, color: "var(--primary)" }}>すべての設定を見る →</Link>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="category-pagination" aria-label="OS設定一覧のページ移動">
          {currentPage > 1 ? <Link href={pageHref(osType, selectedCategory, currentPage - 1)}>← 前の20件</Link> : <span aria-hidden="true" />}
          <span aria-current="page">{currentPage} / {totalPages}ページ</span>
          {currentPage < totalPages ? <Link href={pageHref(osType, selectedCategory, currentPage + 1)}>次の20件 →</Link> : <span aria-hidden="true" />}
        </nav>
      )}
    </div>
  );
}
