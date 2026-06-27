import { searchDB, getAllSettings } from "@/lib/data";
import { OSType, OS_LABELS, CATEGORIES } from "@/lib/types";
import SearchBox from "@/components/SearchBox";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import type { Metadata } from "next";
import { searchSettings } from "@/lib/search";

type Props = { searchParams: Promise<{ q?: string; os?: string; diff?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `「${q}」の検索結果` : "検索",
    description: q ? `「${q}」に関する設定場所・手順の検索結果です。` : "PC・スマホの設定を検索",
    robots: "noindex",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", os, diff } = await searchParams;
  const osType = os as OSType | undefined;
  let results = await searchDB(q, osType);

  // 難易度フィルター
  if (diff) results = results.filter((s) => s.difficulty === diff);

  // ゼロヒット時の「もしかして」
  let suggestions: Awaited<ReturnType<typeof searchDB>> = [];
  if (q && results.length === 0) {
    const all = await getAllSettings();
    // クエリを短くして再検索
    const shortQ = q.slice(0, Math.ceil(q.length / 2));
    suggestions = searchSettings(all, shortQ, osType).slice(0, 4);
  }

  return (
    <div style={{ padding: "32px 0 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <SearchBox defaultValue={q} />
      </div>

      {/* フィルターバー */}
      {q && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* OS filter */}
          <Link href={`/search?q=${encodeURIComponent(q)}${diff ? `&diff=${diff}` : ""}`} className={`filter-chip ${!os ? "active" : ""}`}>すべてのOS</Link>
          {(["windows11", "ios", "macos", "android"] as const).map((o) => (
            <Link key={o} href={`/search?q=${encodeURIComponent(q)}&os=${o}${diff ? `&diff=${diff}` : ""}`} className={`filter-chip ${os === o ? "active" : ""}`}>
              {OS_LABELS[o]}
            </Link>
          ))}
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
          {/* Difficulty filter */}
          <Link href={`/search?q=${encodeURIComponent(q)}${os ? `&os=${os}` : ""}`} className={`filter-chip ${!diff ? "active" : ""}`}>すべての難易度</Link>
          {[["beginner","初心者"],["intermediate","中級"],["advanced","上級"]].map(([d, label]) => (
            <Link key={d} href={`/search?q=${encodeURIComponent(q)}${os ? `&os=${os}` : ""}&diff=${d}`} className={`filter-chip ${diff === d ? "active" : ""}`}>
              {label}
            </Link>
          ))}
        </div>
      )}

      {q && (
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
          「{q}」の検索結果：<strong style={{ color: "var(--text)" }}>{results.length}件</strong>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.length > 0
          ? results.map((s) => <SettingCard key={s.id} setting={s} />)
          : q
          ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                「{q}」は見つかりませんでした
              </p>
              <p style={{ fontSize: 14, marginBottom: 28 }}>別のキーワードで検索するか、OS一覧から探してみてください</p>

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
