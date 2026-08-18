import { getStepText, Setting } from "./types";

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
  | "missing-rollback";

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
};

const ISSUE_WEIGHTS: Record<QualityIssue, number> = {
  "missing-title": 35,
  "missing-description": 22,
  "short-description": 8,
  "missing-path": 28,
  "missing-steps": 35,
  "few-steps": 12,
  "short-steps": 10,
  "missing-source": 8,
  "invalid-source": 10,
  unverified: 6,
  "review-overdue": 12,
  "missing-search-terms": 6,
  "missing-version": 4,
  "missing-impact": 6,
  "missing-rollback": 4,
};

const HIGH_PRIORITY_ISSUES = new Set<QualityIssue>([
  "missing-title",
  "missing-description",
  "missing-path",
  "missing-steps",
  "invalid-source",
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

function getIssues(setting: Setting, now: number): { codes: QualityIssue[]; metrics: QualityMetrics } {
  const title = text(setting.title);
  const description = text(setting.description);
  const path = setting.path.filter((item) => text(item));
  const steps = setting.steps.map(getStepText).map(text).filter(Boolean);
  const source = text(setting.source_url);
  const searchTermCount = setting.aliases.filter((item) => text(item)).length
    + setting.keywords.filter((item) => text(item)).length;
  const reviewOverdue = isOverdue(setting.review_due_at, now);
  const metrics: QualityMetrics = {
    descriptionLength: description.length,
    stepCount: steps.length,
    stepCharacters: steps.join("").length,
    pathCount: path.length,
    searchTermCount,
    hasSource: Boolean(source),
    hasVerifiedDate: Boolean(text(setting.verified_at)),
    reviewOverdue,
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
  if (!metrics.hasVerifiedDate) codes.push("unverified");
  if (reviewOverdue) codes.push("review-overdue");
  if (searchTermCount < 2) codes.push("missing-search-terms");
  if (!text(setting.version)) codes.push("missing-version");
  if (text(setting.impact).length < 10) codes.push("missing-impact");
  if (text(setting.rollback).length < 10) codes.push("missing-rollback");

  return { codes, metrics };
}

function toQualityItem(setting: Setting, now: number): QualityItem | null {
  const { codes, metrics } = getIssues(setting, now);
  if (codes.length === 0) return null;

  const penalty = codes.reduce((sum, code) => sum + ISSUE_WEIGHTS[code], 0);
  const score = Math.max(0, 100 - penalty);
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
    priority,
    issueCodes: codes,
    issues: codes.map((code) => ISSUE_LABELS[code]),
    metrics,
  };
}

export function auditSettingsQuality(settings: Setting[], now = Date.now()): QualityAuditResult {
  const items = settings
    .map((setting) => toQualityItem(setting, now))
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
