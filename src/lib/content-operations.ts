import { getArticleRiskLevel, getSettingIndexingIssues, hasBoilerplateContent, isSettingIndexable } from "./content-quality";
import { assessSource, type SourceType } from "./source-quality";
import { normalizeQuery } from "./search";
import { CATEGORIES, getStepImage, getStepText, isOSType, type Setting } from "./types";

export type ContentType = "SETTING_GUIDE" | "TROUBLESHOOTING_GUIDE" | "ERROR_CODE_GUIDE";
export type QualityStatus =
  | "VERIFIED"
  | "NEEDS_VERIFICATION"
  | "INCOMPLETE"
  | "DUPLICATE_CANDIDATE"
  | "OUTDATED"
  | "CONFLICTING"
  | "LOW_VALUE"
  | "BROKEN_SOURCE"
  | "MISSING_VERSION"
  | "MISSING_STEPS"
  | "UNSAFE_TO_PUBLISH";

export type SourceHealthStatus = "ok" | "redirect" | "broken" | "blocked" | "invalid" | "unchecked";

export type SourceHealth = {
  sourceUrl: string;
  status: SourceHealthStatus;
  httpStatus?: number;
  finalUrl?: string;
  checkedAt?: string;
};

export type CompletenessFactor = {
  key: string;
  label: string;
  earned: number;
  possible: number;
  requiredForPublication: boolean;
};

export type GuideEvaluation = {
  id: string;
  title: string;
  slug: string;
  os: Setting["os"];
  category: string;
  contentType: ContentType;
  sourceType: SourceType;
  qualityStatus: QualityStatus;
  statuses: QualityStatus[];
  completeness: number;
  factors: CompletenessFactor[];
  indexable: boolean;
  indexingIssues: string[];
  recommendedAction: string;
  requiresUndo: boolean;
  requiresIfMissing: boolean;
};

export type InventoryDimension = {
  total: number;
  published: number;
  draft: number;
  verified: number;
  sourceBacked: number;
  indexable: number;
  noindex: number;
};

export type ContentInventory = {
  generatedAt: string;
  total: number;
  published: number;
  draft: number;
  verified: number;
  sourceBacked: number;
  indexable: number;
  noindex: number;
  unverified: number;
  screenshots: number;
  orphanGuides: number;
  explicitOrphanGuides: number;
  guidesWithoutRelated: number;
  guidesWithoutExplicitRelated: number;
  dynamicRelatedEdges: number;
  invalidRelatedLinks: number;
  guidesWithoutIfMissing: number;
  reviewOverdue: number;
  duplicateCandidates: number;
  brokenSourceCandidates: number;
  statusCounts: Record<QualityStatus, number>;
  sourceTypeCounts: Record<SourceType, number>;
  byOS: Record<string, InventoryDimension>;
  byCategory: Record<string, InventoryDimension>;
  byContentType: Record<ContentType, InventoryDimension>;
};

export type ReverificationItem = {
  id: string;
  slug: string;
  os: Setting["os"];
  title: string;
  priority: number;
  status: "HIGH_PRIORITY_REVIEW" | "REVIEW" | "MONITOR";
  reasons: string[];
  helpfulVotes: number;
  notHelpfulVotes: number;
};

const ERROR_CODE_PATTERN = /(?:0x[0-9a-f]{4,}|\b(?:caa|err_|error[-_ ]?)?[a-z]*\d{3,}(?:-\d{2,})?\b)/i;
const TROUBLE_PATTERN = /(できない|つながらない|繋がらない|表示されない|見つからない|使えない|動かない|開かない|届かない|出ない|消えた|遅い|落ちる|失敗|不具合|対処|トラブル)/;
const MUTATION_PATTERN = /(オフ|無効|解除|削除|消去|変更|リセット|初期化|停止|許可|ブロック|忘れる|サインアウト|ログアウト)/;
const PLACEHOLDER_PATTERN = /(TODO|TBD|仮タイトル|ここに|ダミー|Lorem ipsum|公開前|候補記事)/i;

export function inferContentType(setting: Pick<Setting, "title" | "category" | "aliases" | "keywords"> & { content_type?: Setting["content_type"] }): ContentType {
  if (setting.content_type === "setting") return "SETTING_GUIDE";
  if (setting.content_type === "troubleshooting") return "TROUBLESHOOTING_GUIDE";
  if (setting.content_type === "error_code") return "ERROR_CODE_GUIDE";
  const text = `${setting.title} ${setting.aliases.join(" ")} ${setting.keywords.join(" ")}`;
  if (ERROR_CODE_PATTERN.test(text)) return "ERROR_CODE_GUIDE";
  if (setting.category === "troubleshoot" || TROUBLE_PATTERN.test(text)) return "TROUBLESHOOTING_GUIDE";
  return "SETTING_GUIDE";
}

/**
 * 記事ページで表示する文脈関連リンクの共通実装。
 * 監査と公開ページが別々の類似判定を持つと、孤立記事数やリンク品質を
 * 誤って報告するため、同じ決定的スコアを共有する。
 */
export function rankContextualRelated(
  setting: Setting,
  candidates: Setting[],
  excludedIds: ReadonlySet<string> = new Set(),
  limit = 5,
): Setting[] {
  const termsCache = rankContextualRelatedTerms;
  const relatedTerms = termsCache(setting);
  const ranked: Array<{ item: Setting; score: number }> = [];
  const maxItems = Math.max(0, Math.min(20, Math.floor(limit)));
  if (maxItems === 0) return [];
  for (const item of candidates) {
    if (item.id === setting.id || excludedIds.has(item.id)) continue;
    const candidateTerms = termsCache(item);
    const sharedTerms = [...relatedTerms].filter((term) => [...candidateTerms].some((candidate) => candidate.includes(term) || term.includes(candidate))).length;
    const sameCategoryBonus = item.category === setting.category ? 3 : 0;
    const problemBonus = item.category === "troubleshoot" || setting.category === "troubleshoot" ? 2 : 0;
    ranked.push({ item, score: sharedTerms * 10 + sameCategoryBonus + problemBonus });
    ranked.sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title, "ja"));
    if (ranked.length > maxItems) ranked.pop();
  }
  return ranked.map(({ item }) => item);
}

const relatedTermsCache = new WeakMap<object, Set<string>>();
function rankContextualRelatedTerms(setting: Setting): Set<string> {
  const cached = relatedTermsCache.get(setting);
  if (cached) return cached;
  const terms = new Set(
    [setting.title, ...setting.aliases, ...setting.keywords]
      .flatMap((value) => normalizeQuery(value).split(/\s+/))
      .filter((value) => value.length >= 2),
  );
  relatedTermsCache.set(setting, terms);
  return terms;
}

export function normalizedPlatform(setting: Pick<Setting, "os" | "version">) {
  const family = setting.os === "windows11" || setting.os === "windows10"
    ? "windows"
    : setting.os === "ios" || setting.os === "ipados"
      ? setting.os
      : setting.os === "macos" ? "macos" : setting.os === "android" ? "android" : "application";
  const majorVersion = setting.version.trim() || null;
  return { platformId: setting.os, family, majorVersion, displayVersion: setting.version.trim() || null };
}

function validDate(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function needsUndo(setting: Setting, contentType: ContentType): boolean {
  if (contentType === "TROUBLESHOOTING_GUIDE" && !getArticleRiskLevel(setting)) return false;
  return MUTATION_PATTERN.test(`${setting.title} ${setting.steps.map(getStepText).join(" ")}`);
}

function needsIfMissing(setting: Setting, contentType: ContentType): boolean {
  return setting.path.length > 0 && contentType !== "ERROR_CODE_GUIDE";
}

function factor(key: string, label: string, earned: number, possible: number, requiredForPublication = false): CompletenessFactor {
  return { key, label, earned: Math.max(0, Math.min(possible, earned)), possible, requiredForPublication };
}

export function completenessFactors(setting: Setting): CompletenessFactor[] {
  const title = setting.title.trim();
  const description = setting.description.trim();
  const stepText = setting.steps.map(getStepText).map((item) => item.trim()).filter(Boolean);
  const stepCharacters = stepText.join("").length;
  const contentType = inferContentType(setting);
  const source = assessSource(setting.source_url);
  const verifiedAt = validDate(setting.verified_at);
  const undoRequired = needsUndo(setting, contentType);
  const ifMissingRequired = needsIfMissing(setting, contentType);
  const searchTerms = [...setting.aliases, ...setting.keywords].filter((item) => item.trim());
  const hasScope = setting.os !== "android" || Boolean(setting.device_scope?.trim());

  return [
    factor("title", "タイトル", title.length >= 5 && !PLACEHOLDER_PATTERN.test(title) ? 8 : 0, 8, true),
    factor("identifiers", "slug・OS・カテゴリ", setting.slug && isOSType(setting.os) && Boolean(CATEGORIES[setting.category]) ? 8 : 0, 8, true),
    factor("version", "対応バージョン", setting.version.trim() ? 7 : 0, 7, true),
    factor("description", "概要", description.length >= 24 && !PLACEHOLDER_PATTERN.test(description) ? 8 : description.length >= 15 ? 4 : 0, 8),
    factor("path", "最短設定経路", setting.path.filter((item) => item.trim()).length > 0 ? 8 : 0, 8, true),
    factor("steps", "具体的な手順", stepText.length >= 2 && stepCharacters >= 60 ? 16 : stepText.length >= 2 && stepCharacters >= 45 ? 12 : stepText.length ? 5 : 0, 16, true),
    factor("source", "情報源", source.secure && source.authoritative && !source.generic ? 12 : source.secure && source.type !== "INVALID" ? 7 : 0, 12, true),
    factor("verified", "検証日", verifiedAt !== null && verifiedAt <= Date.now() + 86_400_000 ? 10 : 0, 10, true),
    factor("search", "検索別名・キーワード", searchTerms.length >= 4 ? 6 : searchTerms.length >= 2 ? 4 : searchTerms.length ? 2 : 0, 6),
    factor("undo", "元に戻す方法", !undoRequired || Boolean(setting.rollback?.trim()) ? 5 : 0, 5),
    factor("if-missing", "項目がない場合", !ifMissingRequired || Boolean(setting.if_missing?.trim()) ? 5 : 0, 5),
    factor("related", "関連ガイド", setting.related_slugs.length > 0 ? 4 : 0, 4),
    factor("scope", "適用範囲", hasScope ? 3 : 0, 3),
  ];
}

function recommendedAction(status: QualityStatus): string {
  const labels: Record<QualityStatus, string> = {
    VERIFIED: "通常の再検証周期で維持",
    NEEDS_VERIFICATION: "公式・信頼できる情報源を付け、実機または対象版で検証",
    INCOMPLETE: "不足している必須項目を補完してから公開判断",
    DUPLICATE_CANDIDATE: "既存の正規記事へ別名統合できるか人手で確認",
    OUTDATED: "現在版で手順と画面名を再検証",
    CONFLICTING: "同一意図の記事間で手順・適用範囲の差を確認",
    LOW_VALUE: "定型文を具体的な固有手順へ書き直すかnoindexを維持",
    BROKEN_SOURCE: "移転先の公式資料を探し、手順を再検証",
    MISSING_VERSION: "確認した対象バージョンを記録",
    MISSING_STEPS: "実行可能な手順と最短経路を追加",
    UNSAFE_TO_PUBLISH: "公開せず、安全性・必須データを修正",
  };
  return labels[status];
}

export function evaluateGuide(
  setting: Setting,
  options: {
    now?: number;
    duplicateIds?: ReadonlySet<string>;
    conflictingIds?: ReadonlySet<string>;
    sourceHealth?: ReadonlyMap<string, SourceHealth>;
  } = {},
): GuideEvaluation {
  const now = options.now ?? Date.now();
  const factors = completenessFactors(setting);
  const completeness = factors.reduce((sum, item) => sum + item.earned, 0);
  const contentType = inferContentType(setting);
  const source = assessSource(setting.source_url);
  const verifiedAt = validDate(setting.verified_at);
  const reviewDueAt = validDate(setting.review_due_at);
  const sourceHealth = setting.source_url ? options.sourceHealth?.get(setting.source_url) : undefined;
  const statuses: QualityStatus[] = [];
  const stepCharacters = setting.steps.map(getStepText).join("").trim().length;
  const risk = getArticleRiskLevel(setting);
  const securityDisable = risk === "security" && /(無効|オフ|解除|削除)/.test(`${setting.title} ${setting.steps.map(getStepText).join(" ")}`);
  const unsafe = !setting.title.trim()
    || !setting.slug.trim()
    || !isOSType(setting.os)
    || !CATEGORIES[setting.category]
    || PLACEHOLDER_PATTERN.test(`${setting.title} ${setting.description}`)
    || Boolean(verifiedAt && verifiedAt > now + 86_400_000)
    || Boolean((risk === "data-loss" || risk === "admin" || securityDisable) && !setting.caution?.trim());

  if (unsafe) statuses.push("UNSAFE_TO_PUBLISH");
  if (setting.steps.length < 2 || stepCharacters < 45 || setting.path.length === 0) statuses.push("MISSING_STEPS");
  if (!setting.version.trim()) statuses.push("MISSING_VERSION");
  if (options.duplicateIds?.has(setting.id)) statuses.push("DUPLICATE_CANDIDATE");
  if (options.conflictingIds?.has(setting.id)) statuses.push("CONFLICTING");
  if (sourceHealth?.status === "broken" || sourceHealth?.status === "invalid") statuses.push("BROKEN_SOURCE");
  if ((reviewDueAt !== null && reviewDueAt < now) || (verifiedAt !== null && verifiedAt < now - 548 * 86_400_000)) statuses.push("OUTDATED");
  if (hasBoilerplateContent(setting)) statuses.push("LOW_VALUE");
  if (completeness < 70) statuses.push("INCOMPLETE");
  if (!verifiedAt || !source.secure || !source.authoritative || source.generic) statuses.push("NEEDS_VERIFICATION");
  if (statuses.length === 0) statuses.push("VERIFIED");

  const statusOrder: QualityStatus[] = [
    "UNSAFE_TO_PUBLISH", "MISSING_STEPS", "BROKEN_SOURCE", "CONFLICTING", "DUPLICATE_CANDIDATE",
    "OUTDATED", "LOW_VALUE", "INCOMPLETE", "MISSING_VERSION", "NEEDS_VERIFICATION", "VERIFIED",
  ];
  statuses.sort((left, right) => statusOrder.indexOf(left) - statusOrder.indexOf(right));
  const qualityStatus = statuses[0];

  return {
    id: setting.id,
    title: setting.title,
    slug: setting.slug,
    os: setting.os,
    category: setting.category,
    contentType,
    sourceType: source.type,
    qualityStatus,
    statuses,
    completeness,
    factors,
    indexable: setting.status !== "draft"
      && isSettingIndexable(setting, now)
      && sourceHealth?.status !== "broken"
      && sourceHealth?.status !== "invalid",
    indexingIssues: getSettingIndexingIssues(setting, now),
    recommendedAction: recommendedAction(qualityStatus),
    requiresUndo: needsUndo(setting, contentType),
    requiresIfMissing: needsIfMissing(setting, contentType),
  };
}

function emptyDimension(): InventoryDimension {
  return { total: 0, published: 0, draft: 0, verified: 0, sourceBacked: 0, indexable: 0, noindex: 0 };
}

function addDimension(target: Record<string, InventoryDimension>, key: string, setting: Setting, evaluation: GuideEvaluation) {
  const item = target[key] || emptyDimension();
  item.total += 1;
  if (setting.status === "draft") item.draft += 1; else item.published += 1;
  if (setting.verified_at) item.verified += 1;
  if (setting.source_url) item.sourceBacked += 1;
  if (evaluation.indexable) item.indexable += 1;
  else if (setting.status !== "draft") item.noindex += 1;
  target[key] = item;
}

export function buildContentInventory(
  settings: Setting[],
  options: {
    now?: number;
    duplicateIds?: ReadonlySet<string>;
    conflictingIds?: ReadonlySet<string>;
    sourceHealth?: ReadonlyMap<string, SourceHealth>;
  } = {},
): { inventory: ContentInventory; evaluations: GuideEvaluation[] } {
  const evaluations = settings.map((setting) => evaluateGuide(setting, options));
  const evaluationById = new Map(evaluations.map((item) => [item.id, item]));
  const published = settings.filter((item) => item.status !== "draft");
  const availableSlugs = new Set(published.map((item) => item.slug));
  const publishedBySlug = new Map<string, Setting[]>();
  const publishedByOS = new Map<string, Setting[]>();
  for (const item of published) {
    publishedBySlug.set(item.slug, [...(publishedBySlug.get(item.slug) || []), item]);
    publishedByOS.set(item.os, [...(publishedByOS.get(item.os) || []), item]);
  }
  const inbound = new Map<string, number>();
  const explicitInbound = new Map<string, number>();
  const outgoing = new Map<string, number>();
  let invalidRelatedLinks = 0;
  let dynamicRelatedEdges = 0;
  for (const setting of published) {
    const explicitRelated = setting.related_slugs
      .flatMap((slug) => publishedBySlug.get(slug) || [])
      .filter((candidate) => candidate.id !== setting.id);
    const contextualRelated = rankContextualRelated(
      setting,
      publishedByOS.get(setting.os) || [],
      new Set(explicitRelated.map((candidate) => candidate.id)),
    );
    const related = [...explicitRelated, ...contextualRelated].slice(0, 5);
    outgoing.set(setting.id, related.length);
    dynamicRelatedEdges += related.length;
    for (const relatedItem of related) inbound.set(relatedItem.id, (inbound.get(relatedItem.id) || 0) + 1);
    for (const slug of setting.related_slugs) {
      if (availableSlugs.has(slug)) {
        for (const relatedItem of (publishedBySlug.get(slug) || []).filter((candidate) => candidate.id !== setting.id)) {
          explicitInbound.set(relatedItem.id, (explicitInbound.get(relatedItem.id) || 0) + 1);
        }
      }
      else invalidRelatedLinks += 1;
    }
  }

  const statusCounts = Object.fromEntries([
    "VERIFIED", "NEEDS_VERIFICATION", "INCOMPLETE", "DUPLICATE_CANDIDATE", "OUTDATED", "CONFLICTING",
    "LOW_VALUE", "BROKEN_SOURCE", "MISSING_VERSION", "MISSING_STEPS", "UNSAFE_TO_PUBLISH",
  ].map((status) => [status, 0])) as Record<QualityStatus, number>;
  const sourceTypeCounts = Object.fromEntries([
    "OFFICIAL_SUPPORT", "OFFICIAL_DOCUMENTATION", "OFFICIAL_VENDOR", "DEVICE_MANUFACTURER",
    "TRUSTED_SECONDARY", "UNKNOWN", "INVALID",
  ].map((status) => [status, 0])) as Record<SourceType, number>;
  const byOS: Record<string, InventoryDimension> = {};
  const byCategory: Record<string, InventoryDimension> = {};
  const byContentType = {} as Record<ContentType, InventoryDimension>;

  for (const setting of settings) {
    const evaluation = evaluationById.get(setting.id)!;
    statusCounts[evaluation.qualityStatus] += 1;
    sourceTypeCounts[evaluation.sourceType] += 1;
    addDimension(byOS, setting.os, setting, evaluation);
    addDimension(byCategory, setting.category, setting, evaluation);
    addDimension(byContentType, evaluation.contentType, setting, evaluation);
  }

  const indexable = evaluations.filter((item) => item.indexable).length;
  const brokenSourceCandidates = evaluations.filter((item) => item.statuses.includes("BROKEN_SOURCE")).length;
  const now = options.now ?? Date.now();
  return {
    inventory: {
      generatedAt: new Date(now).toISOString(),
      total: settings.length,
      published: published.length,
      draft: settings.length - published.length,
      verified: settings.filter((item) => Boolean(item.verified_at)).length,
      sourceBacked: settings.filter((item) => Boolean(item.source_url)).length,
      indexable,
      noindex: published.length - indexable,
      unverified: settings.filter((item) => !item.verified_at || !item.source_url).length,
      screenshots: settings.filter((item) => Boolean(item.screenshot_url) || item.steps.some((step) => Boolean(getStepImage(step).image_url))).length,
      orphanGuides: published.filter((item) => !inbound.has(item.id)).length,
      explicitOrphanGuides: published.filter((item) => !explicitInbound.has(item.id)).length,
      guidesWithoutRelated: published.filter((item) => (outgoing.get(item.id) || 0) === 0).length,
      guidesWithoutExplicitRelated: published.filter((item) => item.related_slugs.length === 0).length,
      dynamicRelatedEdges,
      invalidRelatedLinks,
      guidesWithoutIfMissing: settings.filter((item) => evaluateGuide(item, options).requiresIfMissing && !item.if_missing?.trim()).length,
      reviewOverdue: evaluations.filter((item) => item.statuses.includes("OUTDATED")).length,
      duplicateCandidates: options.duplicateIds?.size || 0,
      brokenSourceCandidates,
      statusCounts,
      sourceTypeCounts,
      byOS,
      byCategory,
      byContentType,
    },
    evaluations,
  };
}

export function editorialReviewRows(settings: Setting[], evaluations: GuideEvaluation[]) {
  const byId = new Map(evaluations.map((item) => [item.id, item]));
  return settings.map((setting) => {
    const evaluation = byId.get(setting.id)!;
    return {
      slug: setting.slug,
      title: setting.title,
      os: setting.os,
      version: setting.version,
      category: setting.category,
      content_type: evaluation.contentType,
      quality_status: evaluation.qualityStatus,
      quality_flags: evaluation.statuses.join("|"),
      completeness: evaluation.completeness,
      publish_status: setting.status === "draft" ? "DRAFT" : "PUBLIC",
      index_status: evaluation.indexable ? "INDEX" : "NOINDEX",
      source_type: evaluation.sourceType,
      source_url: setting.source_url || "",
      verified_at: setting.verified_at || "",
      helpful_count: setting.helpful_count || 0,
      not_helpful_count: setting.not_helpful_count || 0,
      feedback_total: (setting.helpful_count || 0) + (setting.not_helpful_count || 0),
      negative_rate: (setting.helpful_count || 0) + (setting.not_helpful_count || 0) > 0
        ? Number(((setting.not_helpful_count || 0) / ((setting.helpful_count || 0) + (setting.not_helpful_count || 0))).toFixed(4))
        : null,
      duplicate_candidate: evaluation.statuses.includes("DUPLICATE_CANDIDATE") ? "yes" : "no",
      recommended_action: evaluation.recommendedAction,
    };
  });
}

export function buildReverificationQueue(
  settings: Setting[],
  sourceHealth: ReadonlyMap<string, SourceHealth> = new Map(),
  now = Date.now(),
): ReverificationItem[] {
  return settings.map((setting) => {
    const reasons: string[] = [];
    let priority = 0;
    const verifiedAt = setting.verified_at ? Date.parse(setting.verified_at) : Number.NaN;
    const reviewDueAt = setting.review_due_at ? Date.parse(setting.review_due_at) : Number.NaN;
    if (!Number.isFinite(verifiedAt)) {
      priority += 30;
      reasons.push("検証日なし");
    } else {
      const ageDays = Math.max(0, (now - verifiedAt) / 86_400_000);
      const agePoints = Math.min(25, Math.floor(ageDays / 45) * 3);
      priority += agePoints;
      if (ageDays >= 365) reasons.push(`検証から${Math.floor(ageDays)}日`);
    }
    if (Number.isFinite(reviewDueAt) && reviewDueAt < now) {
      priority += 25;
      reasons.push("見直し期限超過");
    }
    const health = setting.source_url ? sourceHealth.get(setting.source_url) : undefined;
    if (health?.status === "broken" || health?.status === "invalid") {
      priority += 35;
      reasons.push("情報源切れ");
    } else if (health?.status === "blocked") {
      priority += 30;
      reasons.push("情報源の自動確認不可");
    } else if (health?.status === "redirect") {
      priority += 15;
      reasons.push("情報源移転");
    }
    const views = Math.max(0, Number(setting.view_count) || 0);
    if (views > 0) {
      priority += Math.min(15, Math.floor(Math.log10(views + 1) * 5));
      reasons.push(`閲覧${views}`);
    }
    const helpful = Math.max(0, Number(setting.helpful_count) || 0);
    const notHelpful = Math.max(0, Number(setting.not_helpful_count) || 0);
    const votes = helpful + notHelpful;
    const negativeRatio = votes > 0 ? notHelpful / votes : 0;
    if (votes >= 10 && negativeRatio >= 0.4) {
      priority += 30;
      reasons.push(`否定票${Math.round(negativeRatio * 100)}% (${votes}票)`);
    }
    const capped = Math.min(100, priority);
    return {
      id: setting.id,
      slug: setting.slug,
      os: setting.os,
      title: setting.title,
      priority: capped,
      status: votes >= 10 && negativeRatio >= 0.4 || capped >= 60
        ? "HIGH_PRIORITY_REVIEW" as const
        : capped >= 30 ? "REVIEW" as const : "MONITOR" as const,
      reasons,
      helpfulVotes: helpful,
      notHelpfulVotes: notHelpful,
    };
  }).sort((left, right) => right.priority - left.priority || left.title.localeCompare(right.title, "ja"));
}
