import { getStepText, Setting } from "./types";
import { getArticleRiskLevel, hasBoilerplateContent } from "./content-quality";
import { evaluateGuide, type ContentType, type QualityStatus, type SourceHealth } from "./content-operations";
import { assessSource, type SourceType } from "./source-quality";

export type QualityIssue =
  | "missing-title"
  | "missing-description"
  | "short-description"
  | "missing-path"
  | "missing-steps"
  | "few-steps"
  | "short-steps"
  | "missing-source"
  | "invalid-source"
  | "unverified"
  | "review-overdue"
  | "missing-search-terms"
  | "missing-version"
  | "missing-impact"
  | "missing-rollback"
  | "missing-if-missing"
  | "missing-related"
  | "generic-source"
  | "unknown-source"
  | "broken-source"
  | "source-redirect"
  | "future-verification"
  | "placeholder-text"
  | "boilerplate-content"
  | "draft-language"
  | "risk-without-caution";

export type QualityPriority = "high" | "medium" | "low";

export interface QualityMetrics {
  descriptionLength: number;
  stepCount: number;
  stepCharacters: number;
  pathCount: number;
  searchTermCount: number;
  hasSource: boolean;
  hasVerifiedDate: boolean;
  reviewOverdue: boolean;
  hasIfMissing: boolean;
  hasRelated: boolean;
}

export interface QualityItem {
  id: string;
  title: string;
  slug: string;
  os: Setting["os"];
  category: string;
  status: "draft" | "published";
  version: string;
  updated_at: string;
  score: number;
  qualityStatus: QualityStatus;
  contentType: ContentType;
  sourceType: SourceType;
  indexable: boolean;
  recommendedAction: string;
  priority: QualityPriority;
  issueCodes: QualityIssue[];
  issues: string[];
  metrics: QualityMetrics;
}

export interface QualityAuditResult {
  items: QualityItem[];
  counts: Record<QualityPriority, number>;
  issueCounts: Partial<Record<QualityIssue, number>>;
}

const ISSUE_LABELS: Record<QualityIssue, string> = {
  "missing-title": "タイトルが短い・未入力",
  "missing-description": "概要が未入力",
  "short-description": "概要が短い",
  "missing-path": "設定場所が未入力",
  "missing-steps": "手順が未入力",
  "few-steps": "手順が1つだけ",
  "short-steps": "手順の説明が短い",
  "missing-source": "公式情報源が未登録",
  "invalid-source": "情報源URLを確認",
  unverified: "最終確認日が未登録",
  "review-overdue": "見直し期限を超過",
  "missing-search-terms": "検索語が少ない",
  "missing-version": "対応バージョンが未入力",
  "missing-impact": "設定するとどうなるか未記載",
  "missing-rollback": "元に戻す方法が未記載",
  "missing-if-missing": "項目がない場合の案内が未記載",
  "missing-related": "関連ガイドが未登録",
  "generic-source": "情報源が一般的な案内ページ",
  "unknown-source": "情報源の信頼区分を確認",
  "broken-source": "情報源が404・一般ページ化",
  "source-redirect": "情報源の移転先を確認",
  "future-verification": "最終確認日が未来日",
  "placeholder-text": "プレースホルダー表現が残っている",
  "boilerplate-content": "自動生成の定型文が残っている",
  "draft-language": "公開記事に下書き表現が残っている",
  "risk-without-caution": "危険な操作に注意書きがない",
};

const HIGH_PRIORITY_ISSUES = new Set<QualityIssue>([
  "missing-title",
  "missing-description",
  "missing-path",
  "missing-steps",
  "invalid-source",
  "broken-source",
  "boilerplate-content",
  "draft-language",
  "risk-without-caution",
  "future-verification",
  "placeholder-text",
]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s]+$/i.test(value);
}

function isOverdue(value: string | null | undefined, now: number): boolean {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp < now;
}

function getIssues(setting: Setting, now: number, sourceHealth: ReadonlyMap<string, SourceHealth>): { codes: QualityIssue[]; metrics: QualityMetrics } {
  const title = text(setting.title);
  const description = text(setting.description);
  const path = setting.path.filter((item) => text(item));
  const steps = setting.steps.map(getStepText).map(text).filter(Boolean);
  const source = text(setting.source_url);
  const searchTermCount = setting.aliases.filter((item) => text(item)).length
    + setting.keywords.filter((item) => text(item)).length;
  const reviewOverdue = isOverdue(setting.review_due_at, now);
  const sourceAssessment = assessSource(source);
  const evaluation = evaluateGuide(setting, { now, sourceHealth });
  const health = setting.source_url ? sourceHealth.get(setting.source_url) : undefined;
  const metrics: QualityMetrics = {
    descriptionLength: description.length,
    stepCount: steps.length,
    stepCharacters: steps.join("").length,
    pathCount: path.length,
    searchTermCount,
    hasSource: Boolean(source),
    hasVerifiedDate: Boolean(text(setting.verified_at)),
    reviewOverdue,
    hasIfMissing: Boolean(text(setting.if_missing)),
    hasRelated: setting.related_slugs.length > 0,
  };
  const codes: QualityIssue[] = [];

  if (title.length < 5) codes.push("missing-title");
  if (description.length === 0) codes.push("missing-description");
  else if (description.length < 40) codes.push("short-description");
  if (path.length === 0) codes.push("missing-path");
  if (steps.length === 0) codes.push("missing-steps");
  else {
    if (steps.length === 1) codes.push("few-steps");
    if (metrics.stepCharacters < 45) codes.push("short-steps");
  }
  if (!source) codes.push("missing-source");
  else if (!hasHttpUrl(source)) codes.push("invalid-source");
  else if (sourceAssessment.generic) codes.push("generic-source");
  else if (!sourceAssessment.authoritative) codes.push("unknown-source");
  if (health?.status === "broken" || health?.status === "invalid") codes.push("broken-source");
  else if (health?.status === "redirect") codes.push("source-redirect");
  if (!metrics.hasVerifiedDate) codes.push("unverified");
  else if ((Date.parse(setting.verified_at || "") || 0) > now + 86_400_000) codes.push("future-verification");
  if (reviewOverdue) codes.push("review-overdue");
  if (searchTermCount < 2) codes.push("missing-search-terms");
  if (!text(setting.version)) codes.push("missing-version");
  if (text(setting.impact).length < 10) codes.push("missing-impact");
  if (evaluation.requiresUndo && text(setting.rollback).length < 10) codes.push("missing-rollback");
  if (evaluation.requiresIfMissing && !metrics.hasIfMissing) codes.push("missing-if-missing");
  if (!metrics.hasRelated) codes.push("missing-related");
  if (hasBoilerplateContent(setting)) codes.push("boilerplate-content");
  if (/(TODO|TBD|仮タイトル|ここに|ダミー|Lorem ipsum)/i.test(`${setting.title} ${setting.description} ${steps.join(" ")}`)) codes.push("placeholder-text");
  if (setting.status === "published" && /(下書き|公開前|候補記事)/.test(`${setting.title} ${setting.description}`)) codes.push("draft-language");
  const risk = getArticleRiskLevel(setting);
  const securityDisable = risk === "security" && /(無効|オフ|解除|削除)/.test(`${setting.title} ${steps.join(" ")}`);
  if ((risk === "data-loss" || risk === "admin" || securityDisable) && !text(setting.caution)) codes.push("risk-without-caution");

  return { codes, metrics };
}

function toQualityItem(setting: Setting, now: number, sourceHealth: ReadonlyMap<string, SourceHealth>): QualityItem | null {
  const { codes, metrics } = getIssues(setting, now, sourceHealth);
  if (codes.length === 0) return null;

  // 点数は不透明な印象値ではなく、content-operations.tsの公開チェックリストの達成点。
  const evaluation = evaluateGuide(setting, { now, sourceHealth });
  const score = evaluation.completeness;
  const priority: QualityPriority = codes.some((code) => HIGH_PRIORITY_ISSUES.has(code)) || score <= 55
    ? "high"
    : score <= 78 ? "medium" : "low";

  return {
    id: setting.id,
    title: setting.title,
    slug: setting.slug,
    os: setting.os,
    category: setting.category,
    status: setting.status === "draft" ? "draft" : "published",
    version: setting.version,
    updated_at: setting.updated_at,
    score,
    qualityStatus: evaluation.qualityStatus,
    contentType: evaluation.contentType,
    sourceType: evaluation.sourceType,
    indexable: evaluation.indexable,
    recommendedAction: evaluation.recommendedAction,
    priority,
    issueCodes: codes,
    issues: codes.map((code) => ISSUE_LABELS[code]),
    metrics,
  };
}

export function auditSettingsQuality(
  settings: Setting[],
  now = Date.now(),
  sourceHealth: ReadonlyMap<string, SourceHealth> = new Map(),
): QualityAuditResult {
  const items = settings
    .map((setting) => toQualityItem(setting, now, sourceHealth))
    .filter((item): item is QualityItem => item !== null)
    .sort((left, right) => {
      const priorityOrder: Record<QualityPriority, number> = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[left.priority] !== priorityOrder[right.priority]) return priorityOrder[left.priority] - priorityOrder[right.priority];
      if (left.status !== right.status) return left.status === "published" ? -1 : 1;
      if (left.score !== right.score) return left.score - right.score;
      return left.title.localeCompare(right.title, "ja");
    });

  const counts: Record<QualityPriority, number> = { high: 0, medium: 0, low: 0 };
  const issueCounts: Partial<Record<QualityIssue, number>> = {};
  for (const item of items) {
    counts[item.priority] += 1;
    for (const code of item.issueCodes) issueCounts[code] = (issueCounts[code] || 0) + 1;
  }
  return { items, counts, issueCounts };
}
