import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "広告・アフィリエイトについて",
  description: "設定どこ？の広告掲載とアフィリエイトに関する方針です。",
  alternates: { canonical: "/advertising" },
};

export default function AdvertisingPage() {
  return (
    <article className="prose-page" style={{ padding: "40px 0 72px", maxWidth: 760 }}>
      <h1>広告・アフィリエイトについて</h1>
      <p className="legal-date">最終更新日：2026年8月18日</p>
      <p>設定どこ？は、サイトの運営費を補うため、将来的に広告やアフィリエイトを利用する場合があります。</p>

      <h2>アフィリエイト広告</h2>
      <p>当サイトに掲載した商品・サービスへのリンクを経由して購入や申込みがあった場合、当サイトに紹介料が入ることがあります。アフィリエイトリンクや広告を掲載する場合は、広告であることが分かる表示を付けます。</p>

      <h2>Google AdSense</h2>
      <p>Google AdSenseを導入する場合、Googleなどの第三者配信事業者がCookie、ウェブビーコン、IPアドレスなどを利用して広告を配信することがあります。導入時には、<Link href="/privacy">プライバシー</Link>へ利用目的と情報の扱いを追記します。</p>

      <h2>記事との関係</h2>
      <p>広告やアフィリエイトの有無にかかわらず、設定ガイドは公式情報や実際の設定画面を確認し、利用者の問題解決に役立つかを基準に掲載します。</p>

      <p className="legal-links"><Link href="/privacy">プライバシー</Link> ・ <Link href="/terms">利用規約</Link> ・ <Link href="/contact">お問い合わせ</Link></p>
    </article>
  );
}
