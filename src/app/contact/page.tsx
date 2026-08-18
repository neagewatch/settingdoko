import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "設定どこ？への記事修正、掲載リクエスト、不具合に関するお問い合わせ窓口です。",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="prose-page" style={{ padding: "40px 0 72px", maxWidth: 760 }}>
      <h1>お問い合わせ</h1>
      <p>記事の誤り、追加してほしい設定、不具合などをお知らせください。内容を確認し、必要に応じて記事の修正・追加・非公開を行います。</p>

      <div className="contact-options">
        <section className="contact-option">
          <p className="contact-option-label">01 / 記事の誤り</p>
          <h2>情報が古い・間違っている</h2>
          <p>対象の記事を開き、「情報が古い・間違いを報告」から送信してください。記事の内容と対象OSが自動で記録されるため、確認が早くなります。</p>
          <p className="contact-option-note">パスワードや個人情報は入力しないでください。</p>
        </section>

        <section className="contact-option">
          <p className="contact-option-label">02 / 記事の追加</p>
          <h2>探している設定がない</h2>
          <p>検索結果が0件のときに表示される「探している設定を送る」から、やりたいことを送信できます。</p>
          <Link className="secondary-button contact-option-link" href="/search">検索画面を開く →</Link>
        </section>

        <section className="contact-option">
          <p className="contact-option-label">03 / その他</p>
          <h2>問い合わせフォーム</h2>
          <p>氏名やメールアドレスを入力せずに、内容だけ送信できます。返信は行わず、サイト改善に利用します。</p>
          <ContactForm />
        </section>
      </div>

      <h2>送信時の注意</h2>
      <ul className="legal-list">
        <li>氏名、メールアドレス、住所、電話番号、パスワード、決済情報などは送らないでください。</li>
        <li>記事の修正依頼には、対象ページのURLと、問題の箇所を添えてください。</li>
        <li>フォームの内容は運営データベースに保存し、確認・改善に利用します。</li>
      </ul>

      <p className="legal-links"><Link href="/privacy">プライバシー</Link> ・ <Link href="/terms">利用規約</Link> ・ <Link href="/editorial-policy">編集方針・検証方法</Link></p>
    </article>
  );
}
