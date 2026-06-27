import { searchDB } from "@/lib/data";
import { OSType, OS_LABELS } from "@/lib/types";
import SearchBox from "@/components/SearchBox";
import SettingCard from "@/components/SettingCard";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { searchParams: Promise<{ q?: string; os?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `「${q}」の検索結果` : "検索",
    description: q ? `「${q}」に関する設定場所・手順の検索結果です。` : "PC・スマホの設定を検索",
    robots: "noindex",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", os } = await searchParams;
  const osType = os as OSType | undefined;
  const results = await searchDB(q, osType);

  return (
    <div style={{ padding: "32px 0 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <SearchBox defaultValue={q} />
      </div>

      {/* OS filter tabs */}
      {q && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className={`os-tab ${!os ? "active" : ""}`}
          >すべて</Link>
          {(["windows11", "ios", "macos"] as const).map((o) => (
            <Link
              key={o}
              href={`/search?q=${encodeURIComponent(q)}&os=${o}`}
              className={`os-tab ${os === o ? "active" : ""}`}
            >{OS_LABELS[o]}</Link>
          ))}
        </div>
      )}

      {q && (
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
          「{q}」{os ? `（${OS_LABELS[os]}）` : ""}の検索結果：<strong style={{ color: "var(--text)" }}>{results.length}件</strong>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.length > 0
          ? results.map((s) => <SettingCard key={s.id} setting={s} />)
          : q
          ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>該当する設定が見つかりませんでした</p>
              <p style={{ fontSize: 14 }}>別のキーワードや、OS名を付けて検索してみてください</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
                {(["windows11", "ios", "macos"] as const).map((o) => (
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
