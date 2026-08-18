import type { Metadata } from "next";
import Link from "next/link";

const OPERATOR_NAME = process.env.NEXT_PUBLIC_OPERATOR_NAME || "設定どこ？運営";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const LAST_UPDATED = "2026年8月18日";

export const metadata: Metadata = {
  title: "プライバシー",
  description: "設定どこ？のプライバシーに関する基本方針です。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="prose-page" style={{ padding: "40px 0 72px", maxWidth: 760 }}>
      <h1>プライバシー</h1>
      <p className="legal-date">最終更新日：{LAST_UPDATED}</p>
      <p>設定どこ？（以下「当サイト」）は、設定方法とトラブル解決方法を検索するサービスを提供するために必要な範囲で情報を取り扱います。</p>

      <h2>1. 運営者・問い合わせ先</h2>
      <p>公開名：{OPERATOR_NAME}</p>
      {CONTACT_EMAIL ? (
        <p>個人情報に関する問い合わせ先：<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      ) : (
        <p>問い合わせ先は<Link href="/contact">お問い合わせページ</Link>をご確認ください。氏名やメールアドレスを入力せずに連絡できます。</p>
      )}

      <h2>2. ブラウザ内に保存する情報</h2>
      <p>ブックマーク、最近見たページ、最近の検索、手順のチェック状態、役に立った設定の回答、ダークモードや文字サイズの設定は、初期設定では利用者のブラウザ内（localStorage）に保存します。これらは当サイトのサーバーへ自動送信しません。</p>

      <h2>3. サーバーへ送信・保存する情報</h2>
      <p>検索結果が0件の場合、検索語、選択中のOS、0件だったことを、記事の追加や検索改善のためにデータベースへ保存します。検索成功時の検索語は当サイトのデータベースへ保存しません。</p>
      <p>記事の追加リクエスト、問い合わせフォーム、ガイドの誤り報告を送信した場合は、入力された内容と対象記事の情報を、対応・改善のために保存します。氏名やメールアドレスの入力欄は設けていませんが、送信内容に個人情報が含まれていれば保存される可能性があるため、入力しないでください。</p>

      <h2>4. 利用目的</h2>
      <ul className="legal-list">
        <li>設定ガイドの追加・修正・更新</li>
        <li>検索結果が見つからないキーワードの分析</li>
        <li>不具合や誤情報への対応</li>
        <li>サービスの安全な運営と品質改善</li>
      </ul>

      <h2>5. 保存期間・削除</h2>
      <p>サーバーに保存した情報は、上記の目的に必要な期間だけ利用します。目的を達成した情報や、保存の必要がなくなった情報は、運営上可能な範囲で削除します。削除や利用停止の相談は、<Link href="/contact">お問い合わせページ</Link>からご連絡ください。</p>

      <h2>6. 外部サービス</h2>
      <p>サイトのホスティングにVercel、データ保存にSupabaseを利用します。これらのサービス上で、サイトの運用に必要なアクセスログや障害情報が処理される場合があります。各サービスの利用規約・プライバシーポリシーも適用されます。</p>
      <p>管理画面は公開ページとは別の認証で保護し、管理用の秘密情報を公開ページへ送信しない構成にしています。</p>

      <h2>7. Cookie・広告</h2>
      <p>公開ページでは、設定の保存や表示改善のためにlocalStorageを利用します。将来Google AdSenseなどの広告を導入する場合、Googleなどの第三者配信事業者がCookie、ウェブビーコン、IPアドレスなどを使って広告を配信することがあります。広告開始前に、利用目的と第三者による情報利用を本ページへ反映します。</p>
      <p>当サイトは、商品やサービスへのアフィリエイトリンクを掲載する場合があります。リンク経由で購入や申込みがあった場合、当サイトに紹介料が入ることがあります。広告・アフィリエイトの詳細は<Link href="/advertising">広告・アフィリエイトについて</Link>をご確認ください。</p>

      <h2>8. 方針の変更</h2>
      <p>サービス内容や利用する外部サービスの変更に応じて、本方針を更新する場合があります。重要な変更がある場合は、当サイト上でお知らせします。</p>

      <p className="legal-links"><Link href="/terms">利用規約</Link> ・ <Link href="/editorial-policy">編集方針・検証方法</Link> ・ <Link href="/contact">お問い合わせ</Link></p>
    </article>
  );
}
