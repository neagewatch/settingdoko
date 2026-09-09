import { sourceLabel } from "@/lib/content-quality";
import type { SettingSourceType } from "@/lib/types";

type Props = {
  scope: string;
  sourceUrl?: string | null;
  sourceType?: SettingSourceType | null;
  verifiedAt?: string | null;
  reviewOverdue?: boolean;
};

export default function ArticleTrustSummary({ scope, sourceUrl, sourceType, verifiedAt, reviewOverdue = false }: Props) {
  const verifiedLabel = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const officialSource = Boolean(sourceUrl && sourceLabel(sourceUrl) === "公式情報")
    || Boolean(sourceType && sourceType.startsWith("OFFICIAL"));
  const sourceHeading = officialSource ? "公式情報" : "参照情報";

  return (
    <aside className="article-trust-summary" aria-label="この記事の対象環境と確認状況">
      <div className="article-trust-heading">
        <strong>対象と確認状況</strong>
        <span className="article-trust-kind">公開情報の案内</span>
      </div>
      <dl className="article-trust-facts">
        <div>
          <dt>対象環境</dt>
          <dd>{scope}</dd>
        </div>
        <div>
            <dt>{sourceHeading}</dt>
          <dd>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                {officialSource ? "公式情報" : "参照先"}を確認 ↗
              </a>
            ) : "リンク未登録"}
          </dd>
        </div>
        <div>
          <dt>確認記録</dt>
          <dd className={!verifiedLabel || reviewOverdue ? "is-warning" : undefined}>
            {verifiedLabel || "未登録"}
            {reviewOverdue && <span className="article-trust-overdue">・再確認が必要</span>}
          </dd>
        </div>
      </dl>
      {(!verifiedLabel || reviewOverdue) && (
        <p className="article-trust-note">
          {sourceUrl ? `${officialSource ? "公式情報" : "参照先"}をもとにした案内ですが、` : ""}
          {!verifiedLabel ? "この記事の確認日は登録されていません。" : "見直し予定日を過ぎています。"} 画面が違う場合は、ページ下部の報告フォームからお知らせください。
        </p>
      )}
      <details className="article-trust-details">
        <summary>確認方法について</summary>
        <p>「確認記録」は公式資料との照合日または対象環境の画面確認日です。公式資料を参照しただけの場合、すべての端末での実機確認を意味しません。OS・アプリの更新や機種差で画面が違う場合は、ページ下部からお知らせください。</p>
      </details>
    </aside>
  );
}
