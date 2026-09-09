import { searchDB } from "@/lib/data";
import { DEVICE_OS_TYPES, OSType, OS_LABELS, isOSType } from "@/lib/types";
import SearchBox from "@/components/SearchBox";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import type { Metadata } from "next";
import ContentRequestForm from "@/components/ContentRequestForm";
import SearchTelemetry from "@/components/SearchTelemetry";

const FALLBACK_QUERIES = [
  { label: "Wi-Fiにつながらない", q: "wifiつながらない" },
  { label: "文字を大きくしたい", q: "文字大きくしたい" },
  { label: "音が出ない", q: "音出ない" },
  { label: "Bluetoothにつながらない", q: "Bluetoothつながらない" },
];

const SEARCH_PAGE_SIZE = 20;

type SearchParams = {
  q?: string | string[];
  os?: string | string[];
  page?: string | string[];
};

type Props = { searchParams: Promise<SearchParams> };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function searchHref(q: string, os?: OSType, page = 1): string {
  const params = new URLSearchParams({ q });
  if (os) params.set("os", os);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const displayQuery = firstParam((await searchParams).q)?.slice(0, 80);
  return {
    title: displayQuery ? `「${displayQuery}」の検索結果` : "検索",
    description: displayQuery ? `「${displayQuery}」に関する設定方法・トラブル解決の検索結果です。` : "PC・スマホの設定方法とトラブル解決を検索",
    robots: "noindex",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawQ = firstParam(params.q) || "";
  const os = firstParam(params.os);
  const rawPage = firstParam(params.page);
  const q = rawQ.trim().slice(0, 120);
  const osType = os && isOSType(os) ? os as OSType : undefined;
  const results = q ? await searchDB(q, osType) : [];
  const parsedPage = Number.parseInt(rawPage || "1", 10);
  const requestedPage = Number.isFinite(parsedPage) ? Math.max(1, Math.min(1000, parsedPage)) : 1;
  const totalPages = Math.max(1, Math.ceil(results.length / SEARCH_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleResults = results.slice((currentPage - 1) * SEARCH_PAGE_SIZE, currentPage * SEARCH_PAGE_SIZE);
  const start = results.length === 0 ? 0 : (currentPage - 1) * SEARCH_PAGE_SIZE + 1;
  const end = Math.min(currentPage * SEARCH_PAGE_SIZE, results.length);

  return (
    <div className="listing-page search-page" style={{ padding: "32px 0 60px" }}>
      {q && <SearchTelemetry query={q} resultCount={results.length} os={osType} />}
      <div className="listing-heading">
        <p className="section-index">設定・トラブルを探す</p>
        <h1>{q ? `「${q}」の検索結果` : "設定・トラブルを検索"}</h1>
        <p>正式な設定名が分からなくても、困っていることをそのまま入力できます。</p>
      </div>
      <div className="listing-search-box" style={{ marginBottom: 24 }}>
        <SearchBox defaultValue={q} showButton os={osType} />
      </div>

      {/* フィルターバー */}
      {q && (
        <div className="filter-bar" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* OS filter */}
          <Link href={searchHref(q)} className={`filter-chip ${!os ? "active" : ""}`}>すべてのOS</Link>
          {DEVICE_OS_TYPES.map((o) => (
            <Link key={o} href={searchHref(q, o)} className={`filter-chip ${os === o ? "active" : ""}`}>
              {OS_LABELS[o]}
            </Link>
          ))}
        </div>
      )}

      {q && (
        <p className="result-count" role="status" aria-live="polite" style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
          「{q}」の検索結果：<strong style={{ color: "var(--text)" }}>{results.length}件</strong>
          {results.length > 0 && <span className="search-result-range">（{start}–{end}件を表示）</span>}
        </p>
      )}

      <div className="result-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleResults.length > 0
          ? visibleResults.map((s) => <SettingCard key={s.id} setting={s} />)
          : q
          ? (
            <div className="empty-search-state" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              <p className="empty-search-mark" aria-hidden="true">?</p>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                「{q}」は0件でした
              </p>
              <p style={{ fontSize: 14, marginBottom: 28 }}>検索結果を無関係な記事で埋めていません。言い換えるか、端末・症状から探せます。</p>

              <div className="empty-search-actions">
                <Link href="/search" className="secondary-button">検索語をクリア</Link>
                {osType && <Link href={searchHref(q)} className="secondary-button">端末の絞り込みを解除</Link>}
                <Link href="/diagnose" className="primary-button">症状から探す</Link>
              </div>

              <ContentRequestForm query={q} os={os} />

              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {DEVICE_OS_TYPES.map((o) => (
                  <Link key={o} href={`/os/${o}`} className="os-tab">{OS_LABELS[o]}</Link>
                ))}
              </div>
              <div className="empty-search-links" aria-label="よくある検索">
                <p>次に試せる検索</p>
                <div>
                  {FALLBACK_QUERIES.map((item) => <Link key={item.q} href={`/search?q=${encodeURIComponent(item.q)}`} className="os-tab">{item.label}</Link>)}
                </div>
              </div>
            </div>
          )
          : !q ? (
            <div className="empty-search-start" aria-labelledby="empty-search-title">
              <h2 id="empty-search-title">探し方を選ぶ</h2>
              <p>検索語を入力するか、端末・症状から近い入口を選んでください。</p>
              <div className="empty-search-actions">
                <Link href="/diagnose" className="primary-button">症状から探す</Link>
                <Link href="/os/windows11" className="secondary-button">端末から探す</Link>
              </div>
            </div>
          ) : null}
      </div>

      {q && results.length > 0 && totalPages > 1 && (
        <nav className="search-pagination" aria-label="検索結果のページ移動">
          {currentPage > 1 ? <Link href={searchHref(q, osType, currentPage - 1)}>← 前の20件</Link> : <span aria-hidden="true" />}
          <span aria-current="page">{currentPage} / {totalPages}ページ</span>
          {currentPage < totalPages ? <Link href={searchHref(q, osType, currentPage + 1)}>次の20件 →</Link> : <span aria-hidden="true" />}
        </nav>
      )}
    </div>
  );
}
