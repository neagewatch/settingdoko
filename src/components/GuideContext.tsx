import { getArticleCopy } from "@/lib/article-copy";
import type { Setting } from "@/lib/types";

export function GuideOrientation({ setting }: { setting: Setting }) {
  const copy = getArticleCopy(setting);

  return (
    <section className="guide-orientation" aria-labelledby="guide-orientation-heading">
      <div className="guide-orientation-header">
        <div>
        <p className="section-index">この記事の読み方</p>
          <h2 id="guide-orientation-heading">この記事の使い方</h2>
        </div>
        <span className="guide-type-badge">{copy.kindLabel}</span>
      </div>
      <p className="guide-orientation-lead">{copy.lead}</p>
      <dl className="guide-facts">
        <div>
          <dt>対象</dt>
          <dd>{copy.scope}</dd>
        </div>
        <div>
          <dt>手順</dt>
          <dd>{copy.stepSummary}</dd>
        </div>
      </dl>
      <div className="guide-orientation-tip">
        <strong>操作前</strong>
        <p>{copy.preflight}</p>
      </div>
      <div className="guide-orientation-tip">
        <strong>進め方</strong>
        <p>{copy.process}</p>
      </div>
    </section>
  );
}

export function GuideFollowUp({ setting }: { setting: Setting }) {
  const copy = getArticleCopy(setting);

  return (
    <section className="guide-follow-up" aria-labelledby="guide-follow-up-heading">
      <div className="guide-follow-up-grid">
        <div className="guide-follow-up-panel">
          <p className="section-index">操作後</p>
          <h2 id="guide-follow-up-heading">{copy.outcomeHeading}</h2>
          <p>{copy.outcome}</p>
        </div>
        <div className="guide-follow-up-panel">
          <p className="section-index">項目が見つからない場合</p>
          <h2>{copy.missingHeading}</h2>
          <p>{copy.missing}</p>
        </div>
      </div>
    </section>
  );
}
