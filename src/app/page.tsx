import SearchBox from "@/components/SearchBox";
import { KeyboardShortcut } from "@/components/Utilities";
import Link from "next/link";
import { OS_LABELS, PRIMARY_OS_TYPES } from "@/lib/types";
import { getAllSettings } from "@/lib/data";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "設定どこ？｜設定方法・トラブル解決ガイド",
  description: "Windows 11・iPhone・Android・Macの設定方法とトラブル解決を検索。通知、Wi-Fi、音が出ない、マイクが使えないなどの困りごとを最短手順で解決します。",
  alternates: { canonical: "/" },
};

const POPULAR_SEARCHES = [
  { label: "拡張子を表示したい", q: "拡張子見たい" },
  { label: "通知を止めたい", q: "通知うるさい" },
  { label: "画面を暗くしたい", q: "画面暗くしたい" },
  { label: "Wi-Fiが切れる", q: "WiFi切れる" },
  { label: "マイクが使えない", q: "マイク使えない" },
  { label: "Bluetoothにつながらない", q: "Bluetoothつながらない" },
];

const PURPOSE_SEARCHES = [
  { label: "通知・音を減らす", note: "うるさい、鳴る、邪魔", q: "通知うるさい" },
  { label: "見やすくする", note: "明るさ、文字、表示", q: "画面暗くしたい" },
  { label: "接続トラブル", note: "Wi-Fi、Bluetooth、ネット", q: "WiFi切れる" },
  { label: "権限を見直す", note: "マイク、カメラ、位置情報", q: "マイク使えない" },
];

const FEATURES = [
  { id: "new-pc-setup", mark: "A", title: "Windows 11初期設定" },
  { id: "iphone-switch", mark: "B", title: "iPhone乗り換え" },
  { id: "privacy-settings", mark: "C", title: "権限・プライバシー" },
];

export default async function Home() {
  const allSettings = await getAllSettings();
  const counts = Object.fromEntries(PRIMARY_OS_TYPES.map((os) => [os, allSettings.filter((setting) => setting.os === os).length]));

  return (
    <div className="home-page">
      <KeyboardShortcut />

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <h1 id="home-title">設定どこ？</h1>
          <p className="home-subtitle">設定方法とトラブル解決を、最短で案内</p>
          <div className="home-supported home-supported-focus" aria-label="重点対応端末">
            <strong>重点対応</strong>
            <span>Windows 11</span>
            <span>iPhone</span>
            <span>Android</span>
            <span>Mac</span>
          </div>
        </div>

        <div className="home-search-panel" aria-label="設定・トラブルを検索">
          <div className="search-panel-kicker"><strong>設定・トラブル検索</strong><span>困っていることを、そのまま入力</span></div>
          <SearchBox large showButton />
          <p className="search-panel-example">例：通知うるさい・拡張子見たい・マイク使えない</p>
          <div className="search-panel-foot"><kbd className="kbd">/</kbd><span>キーでいつでも検索欄へ移動</span></div>
        </div>
      </section>

      <section className="home-section popular-section" aria-labelledby="popular-title">
        <div className="section-heading-row">
          <div>
            <p className="section-index">入口を選ぶ / START HERE</p>
            <h2 id="popular-title">よくある探し方</h2>
          </div>
          <span className="section-aside">言い方はざっくりでOK</span>
        </div>
        <div className="quick-link-list">
          {POPULAR_SEARCHES.map((item, index) => (
            <Link key={item.q} href={`/search?q=${encodeURIComponent(item.q)}`} className="quick-link">
              <span className="quick-link-no">{String(index + 1).padStart(2, "0")}</span>
              <span>{item.label}</span>
              <span className="quick-link-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="diagnose-title">
        <div className="section-heading-row">
          <div>
            <p className="section-index">症状から / BY SYMPTOM</p>
            <h2 id="diagnose-title">トラブルを解決する</h2>
          </div>
          <Link href="/diagnose" className="section-link">解決方法を探す →</Link>
        </div>
        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.8 }}>「Wi-Fiがつながらない」「音が出ない」「通知が届かない」など、症状から原因確認と解決方法を探せます。</p>
      </section>

      <div className="home-two-column">
        <section className="home-section" aria-labelledby="purpose-title">
          <div className="section-heading-row">
            <div>
              <p className="section-index">目的から / BY PURPOSE</p>
              <h2 id="purpose-title">設定したいことから探す</h2>
            </div>
          </div>
          <div className="purpose-grid">
            {PURPOSE_SEARCHES.map((item, index) => (
              <Link key={item.q} href={`/search?q=${encodeURIComponent(item.q)}`} className="purpose-card">
                <span className="purpose-card-no">0{index + 1}</span>
                <span className="purpose-card-copy"><strong>{item.label}</strong><small>{item.note}</small></span>
                <span className="purpose-card-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="home-route-card" aria-label="使い方">
          <p className="section-index">最短ルート / HOW IT WORKS</p>
          <h2>3ステップで到着</h2>
          <ol>
            <li><b>01</b><span><strong>言葉で探す</strong><small>「うるさい」「使えない」でも検索</small></span></li>
            <li><b>02</b><span><strong>端末を選ぶ</strong><small>Windows 11 / iPhone / Android / Mac</small></span></li>
            <li><b>03</b><span><strong>手順を試す</strong><small>チェックしながら設定を完了</small></span></li>
          </ol>
        </aside>
      </div>

      <section className="home-section os-section" aria-labelledby="os-title">
        <div className="section-heading-row">
          <div>
            <p className="section-index">端末から / BY DEVICE</p>
            <h2 id="os-title">先に端末を選ぶ</h2>
          </div>
          <span className="section-aside">現在 {allSettings.length} 件を掲載</span>
        </div>
        <div className="os-card-grid">
          {PRIMARY_OS_TYPES.map((os, index) => (
            <Link key={os} href={`/os/${os}`} className={`os-card os-card-${index + 1}`}>
              <span className="os-card-mark">0{index + 1}</span>
              <span className="os-card-name">{OS_LABELS[os]}</span>
              <span className="os-card-count">{counts[os] || 0}件のガイド <b aria-hidden="true">→</b></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section feature-section" aria-labelledby="feature-title">
        <div className="section-heading-row">
          <div>
            <p className="section-index">まとめ / FIELD NOTES</p>
            <h2 id="feature-title">まとめて片づける</h2>
          </div>
          <Link href="/feature/new-pc-setup" className="section-link">特集をすべて見る →</Link>
        </div>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <Link key={feature.id} href={`/feature/${feature.id}`} className="feature-card">
              <span className="feature-mark" aria-hidden="true">{feature.mark}</span>
              <span>{feature.title}</span>
              <span className="feature-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
