import { searchDB, getAllSettings } from "@/lib/data";
import { OSType, OS_LABELS, isOSType } from "@/lib/types";
import SearchBox from "@/components/SearchBox";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import type { Metadata } from "next";
import { searchSettings } from "@/lib/search";
import ContentRequestForm from "@/components/ContentRequestForm";
import SearchTelemetry from "@/components/SearchTelemetry";

type Props = { searchParams: Promise<{ q?: string; os?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const displayQuery = q?.slice(0, 80);
  return {
    title: displayQuery ? `「${displayQuery}」の検索結果` : "検索",
    description: displayQuery ? `「${displayQuery}」に関する設定場所・手順の検索結果です。` : "PC・スマホの設定を検索",
    robots: "noindex",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ = "", os } = await searchParams;
  const q = rawQ.trim().slice(0, 120);
  const osType = os && isOSType(os) ? os as OSType : undefined;
  const results = q ? await searchDB(q, osType) : [];

  // ゼロヒット時の「もしかして」
  let suggestions: Awaited<ReturnType<typeof searchDB>> = [];
  if (q && results.length === 0) {
    const all = await getAllSettings();
    suggestions = searchSettings(all, q, osType).slice(0, 4);
  }

  return (
    <div className="listing-page search-page" style={{ padding: "32px 0 60px" }}>
      {q && <SearchTelemetry query={q} resultCount={results.length} os={osType} />}
      <div className="listing-heading">
        <p className="section-index">SEARCH / 設定を探す</p>
        <h1>{q ? `「${q}」の検索結果` : "設定を検索"}</h1>
        <p>正式な設定名が分からなくても、困っていることをそのまま入力できます。</p>
      </div>
      <div className="listing-search-box" style={{ marginBottom: 24 }}>
        <SearchBox defaultValue={q} showButton />
      </div>

      {/* フィルターバー */}
      {q && (
        <div className="filter-bar" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* OS filter */}
          <Link href={`/search?q=${encodeURIComponent(q)}`} className={`filter-chip ${!os ? "active" : ""}`}>すべてのOS</Link>
          {(["windows11", "ios", "macos", "android"] as const).map((o) => (
            <Link key={o} href={`/search?q=${encodeURIComponent(q)}&os=${o}`} className={`filter-chip ${os === o ? "active" : ""}`}>
              {OS_LABELS[o]}
            </Link>
          ))}
        </div>
      )}

      {q && (
        <p className="result-count" style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
          「{q}」の検索結果：<strong style={{ color: "var(--text)" }}>{results.length}件</strong>
        </p>
      )}

      <div className="result-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.length > 0
          ? results.map((s) => <SettingCard key={s.id} setting={s} />)
          : q
          ? (
            <div className="empty-search-state" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              <p className="empty-search-mark" aria-hidden="true">?</p>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                「{q}」は見つかりませんでした
              </p>
              <p style={{ fontSize: 14, marginBottom: 28 }}>別のキーワードで検索するか、OS一覧から探してみてください</p>

              <ContentRequestForm query={q} os={os} />
              <Link href="/diagnose" style={{ display: "inline-block", fontSize: 13, color: "var(--primary)", textDecoration: "none", margin: "18px 0 22px", fontWeight: 600 }}>症状から診断する →</Link>

              {suggestions.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
                    もしかして…
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480, margin: "0 auto" }}>
                    {suggestions.map((s) => (
                      <Link key={s.id} href={`/setting/${s.slug}?os=${s.os}`} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 16px", borderRadius: 10,
                        background: "var(--surface)", border: "1px solid var(--border)",
                        textDecoration: "none", color: "var(--text)",
                        transition: "border-color 0.15s",
                      }}>
                        <span style={{ fontSize: 13, background: "var(--primary-soft)", color: "var(--primary)", padding: "2px 8px", borderRadius: 6, fontWeight: 600, whiteSpace: "nowrap" }}>
                          {OS_LABELS[s.os]}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{s.title}</span>
                        <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {(["windows11", "ios", "macos", "android"] as const).map((o) => (
                  <Link key={o} href={`/os/${o}`} className="os-tab">{OS_LABELS[o]}</Link>
                ))}
              </div>
            </div>
          )
          : null}
      </div>
    </div>
  );
}
