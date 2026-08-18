import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "編集方針・検証方法",
  description: "設定どこ？の設定ガイドをどのように確認・更新しているかを説明します。",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose-page" style={{ padding: "40px 0 72px", maxWidth: 760 }}>
      <h1>編集方針・検証方法</h1>
      <p>設定どこ？は、設定名を知らない人でも目的から設定場所へたどり着けることを重視しています。</p>
      <h2>掲載する情報</h2>
      <p>各ガイドでは、対象OS、設定場所、最短手順、注意点を短く整理します。OSや端末によって表示が異なる場合は、その条件を明記します。</p>
      <h2>更新と検証</h2>
      <p>OSの大型アップデート後や、利用者から変更報告を受けた場合に確認します。確認できていないガイドは、検証日を表示せず、公開状態を見直します。</p>
      <h2>情報源</h2>
      <p>可能な限りMicrosoft、Apple、Googleなどの公式サポート情報を参照します。公式情報と実際の画面が異なる場合は、対象バージョンや端末条件を分けて掲載します。</p>
      <h2>誤りの報告</h2>
      <p>各ガイドの「情報が古い・間違いを報告」からお知らせください。確認後、内容の修正または一時非公開を行います。</p>
    </article>
  );
}
