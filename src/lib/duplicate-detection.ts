import { getStepText, Setting } from "./types";

export type DuplicateReason = "same-slug" | "derived-slug" | "same-title" | "same-content" | "variant-title" | "similar-title";

export interface DuplicateItem {
  id: string;
  title: string;
  slug: string;
  os: Setting["os"];
  status: "draft" | "published";
  category: string;
  updated_at: string;
}

export interface DuplicateGroup {
  id: string;
  confidence: "high" | "medium";
  reasons: DuplicateReason[];
  reason: string;
  items: DuplicateItem[];
}

const STRONG_DUPLICATE_REASONS: DuplicateReason[] = ["same-slug", "derived-slug", "same-title", "same-content", "variant-title"];

/**
 * 自動整理してもよい重複グループかを判定する。
 * タイトルが似ているだけの候補は、別の解決方法である可能性があるため手動確認に残す。
 */
export function isStrongDuplicateGroup(group: Pick<DuplicateGroup, "reasons">): boolean {
  return group.reasons.length > 0 && group.reasons.every((reason) => STRONG_DUPLICATE_REASONS.includes(reason));
}

const REASON_LABELS: Record<DuplicateReason, string> = {
  "same-slug": "slugが一致しています",
  "derived-slug": "基本slugの派生記事です",
  "same-title": "同じOSでタイトルが一致しています",
  "same-content": "設定経路・手順の内容が一致しています",
  "variant-title": "発生条件だけ違う派生記事です",
  "similar-title": "同じOS・カテゴリでタイトルがよく似ています",
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s\u3000]+/g, "")
    .replace(/[、。・,./\\:：;；!?！？「」『』（）()［］[\]【】〈〉<>…~〜\-‐‑–—_]/g, "");
}

export const LEGACY_TROUBLESHOOTING_PREFIXES = ["trouble7-", "trouble8-"] as const;

// 発生場面だけをタイトル末尾に付けた自動生成記事は、基本記事へまとめる。
// 「Windows版」「Web版」など、読者が選ぶ意味のある派生記事は対象にしない。
const UNWANTED_CONDITION_LABELS = new Set([
  "OS更新後",
  "新しい端末",
  "新しい端末を追加した場合",
  "新しい機器を追加した場合",
  "接続済みなのに音が出ない場合",
  "接続済みなのに音が出ないとき",
  "ブラウザ更新後",
].map(normalize));

function titleKey(title: string): string {
  return normalize(title);
}

const VARIANT_TITLE_PATTERN = /^(.*?)[（(]([^（）()]+)[）)]$/;

export function getVariantTitleLabel(title: string): string | null {
  const trimmed = title.trim();
  return trimmed.match(VARIANT_TITLE_PATTERN)?.[2]?.trim() || null;
}

export function getBaseTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.match(VARIANT_TITLE_PATTERN)?.[1]?.trim() || trimmed;
}

export function isVariantTitle(title: string): boolean {
  return getBaseTitle(title) !== title.trim();
}

export function isLegacyTroubleshootingSlug(slug: string): boolean {
  return LEGACY_TROUBLESHOOTING_PREFIXES.some((prefix) => slug.startsWith(prefix));
}

export function isUnwantedConditionTitle(title: string): boolean {
  const label = getVariantTitleLabel(title);
  return Boolean(label && UNWANTED_CONDITION_LABELS.has(normalize(label)));
}

const CANONICAL_SLUG_ALIASES: Record<string, string> = {
  // normalize()でslugの区切り記号を除去するため、キーも正規化済みにする。
  trouble6win11signinfailed: "trouble6-win11-signin",
  trouble8win11signinfailed: "trouble6-win11-signin",
  trouble9win11signin: "trouble6-win11-signin",
};

export function canonicalSlug(slug: string): string {
  const normalized = normalize(slug);
  return CANONICAL_SLUG_ALIASES[normalized]
    || (normalized.startsWith("trouble6win11signin")
      || normalized.startsWith("trouble8win11signinfailed")
      || normalized.startsWith("trouble9win11signin")
      ? "trouble6-win11-signin"
      : normalized);
}

function contentKey(setting: Setting): string {
  return [
    setting.description,
    setting.path.join("|"),
    setting.steps.map(getStepText).join("|"),
    setting.caution || "",
    setting.rollback || "",
  ].map(normalize).join("|");
}

function bigrams(value: string): Set<string> {
  const result = new Set<string>();
  if (value.length < 2) return result;
  for (let index = 0; index < value.length - 1; index += 1) {
    result.add(value.slice(index, index + 2));
  }
  return result;
}

function titleSimilarity(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const gram of left) if (right.has(gram)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

class UnionFind {
  private readonly parents: number[];

  constructor(size: number) {
    this.parents = Array.from({ length: size }, (_, index) => index);
  }

  find(value: number): number {
    let current = value;
    while (this.parents[current] !== current) current = this.parents[current];
    while (this.parents[value] !== value) {
      const next = this.parents[value];
      this.parents[value] = current;
      value = next;
    }
    return current;
  }

  union(left: number, right: number) {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot !== rightRoot) this.parents[rightRoot] = leftRoot;
  }
}

function pairKey(left: number, right: number): string {
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

function addBucket(
  indexes: number[],
  reason: DuplicateReason,
  unionFind: UnionFind,
  pairReasons: Map<string, Set<DuplicateReason>>,
) {
  if (indexes.length < 2) return;
  // 同一キーが大量にある場合も、先頭を代表として連結することで
  // 監査結果を一つのグループにまとめ、管理画面を不必要に膨らませない。
  const first = indexes[0];
  for (const index of indexes.slice(1)) {
    unionFind.union(first, index);
    const key = pairKey(first, index);
    const reasons = pairReasons.get(key) || new Set<DuplicateReason>();
    reasons.add(reason);
    pairReasons.set(key, reasons);
  }
}

function toDuplicateItem(setting: Setting): DuplicateItem {
  return {
    id: setting.id,
    title: setting.title,
    slug: setting.slug,
    os: setting.os,
    status: setting.status === "draft" ? "draft" : "published",
    category: setting.category,
    updated_at: setting.updated_at,
  };
}

export function detectDuplicateGroups(settings: Setting[]): DuplicateGroup[] {
  if (settings.length < 2) return [];

  const unionFind = new UnionFind(settings.length);
  const pairReasons = new Map<string, Set<DuplicateReason>>();
  const bySlug = new Map<string, number[]>();
  const byCanonicalSlug = new Map<string, number[]>();
  const byTitle = new Map<string, number[]>();
  const byVariantBaseTitle = new Map<string, number[]>();
  const byContent = new Map<string, number[]>();

  settings.forEach((setting, index) => {
    const slug = normalize(setting.slug);
    if (slug) {
      const slugGroup = `${setting.os}\u0000${slug}`;
      bySlug.set(slugGroup, [...(bySlug.get(slugGroup) || []), index]);
    }

    const canonical = normalize(canonicalSlug(setting.slug));
    if (canonical) {
      const canonicalGroup = `${setting.os}\u0000${canonical}`;
      byCanonicalSlug.set(canonicalGroup, [...(byCanonicalSlug.get(canonicalGroup) || []), index]);
    }

    const title = titleKey(setting.title);
    if (title) {
      const titleGroup = `${setting.os}\u0000${title}`;
      byTitle.set(titleGroup, [...(byTitle.get(titleGroup) || []), index]);
    }

    const baseTitle = getBaseTitle(setting.title);
    if (baseTitle !== setting.title.trim()) {
      const variantGroup = `${setting.os}\u0000${setting.category}\u0000${titleKey(baseTitle)}`;
      byVariantBaseTitle.set(variantGroup, [...(byVariantBaseTitle.get(variantGroup) || []), index]);
    }

    const content = contentKey(setting);
    if (content.length >= 24) {
      const contentGroup = `${setting.os}\u0000${content}`;
      byContent.set(contentGroup, [...(byContent.get(contentGroup) || []), index]);
    }
  });

  for (const indexes of bySlug.values()) addBucket(indexes, "same-slug", unionFind, pairReasons);
  for (const indexes of byCanonicalSlug.values()) {
    const distinctSlugs = new Set(indexes.map((index) => normalize(settings[index].slug)));
    if (distinctSlugs.size > 1) addBucket(indexes, "derived-slug", unionFind, pairReasons);
  }
  for (const indexes of byTitle.values()) addBucket(indexes, "same-title", unionFind, pairReasons);
  for (const [groupKey, variantIndexes] of byVariantBaseTitle.entries()) {
    const [os, category, baseTitle] = groupKey.split("\u0000");
    const baseIndexes = (byTitle.get(`${os}\u0000${baseTitle}`) || [])
      .filter((index) => settings[index].category === category);
    if (baseIndexes.length > 0) addBucket([...baseIndexes, ...variantIndexes], "variant-title", unionFind, pairReasons);
  }
  for (const indexes of byContent.values()) addBucket(indexes, "same-content", unionFind, pairReasons);

  // 完全一致だけでなく、語尾だけが違う記事なども「要確認」として拾う。
  // OS・カテゴリ単位に絞るため、全記事の総当たりにはしない。
  const fuzzyBuckets = new Map<string, Array<{ index: number; key: string; grams: Set<string> }>>();
  settings.forEach((setting, index) => {
    const key = titleKey(setting.title);
    if (key.length < 6) return;
    const bucketKey = `${setting.os}\u0000${setting.category}`;
    const bucket = fuzzyBuckets.get(bucketKey) || [];
    bucket.push({ index, key, grams: bigrams(key) });
    fuzzyBuckets.set(bucketKey, bucket);
  });

  for (const bucket of fuzzyBuckets.values()) {
    for (let leftIndex = 0; leftIndex < bucket.length; leftIndex += 1) {
      const left = bucket[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < bucket.length; rightIndex += 1) {
        const right = bucket[rightIndex];
        if (left.key === right.key) continue;
        if (Math.abs(left.key.length - right.key.length) > Math.max(8, Math.floor(Math.max(left.key.length, right.key.length) * 0.35))) continue;
        const shorter = left.key.length <= right.key.length ? left.key : right.key;
        const longer = left.key.length <= right.key.length ? right.key : left.key;
        const contained = shorter.length >= 6 && longer.includes(shorter) && shorter.length / longer.length >= 0.62;
        const similar = titleSimilarity(left.grams, right.grams) >= 0.84;
        if (!contained && !similar) continue;

        const key = pairKey(left.index, right.index);
        const reasons = pairReasons.get(key) || new Set<DuplicateReason>();
        // 末尾の発生条件だけが違うペアは、派生記事として既に確定しているため
        // fuzzy判定の「似ているだけ」を重ねない。
        if (reasons.has("variant-title")) continue;
        reasons.add("similar-title");
        pairReasons.set(key, reasons);
        unionFind.union(left.index, right.index);
      }
    }
  }

  const membersByRoot = new Map<number, number[]>();
  for (let index = 0; index < settings.length; index += 1) {
    const root = unionFind.find(index);
    const members = membersByRoot.get(root) || [];
    members.push(index);
    membersByRoot.set(root, members);
  }

  const reasonsByRoot = new Map<number, Set<DuplicateReason>>();
  for (const [key, reasons] of pairReasons.entries()) {
    const [left, right] = key.split(":").map(Number);
    const root = unionFind.find(left);
    const groupReasons = reasonsByRoot.get(root) || new Set<DuplicateReason>();
    for (const reason of reasons) groupReasons.add(reason);
    // union後のrootが変わっても、同じグループへ移せるよう右側も確認する。
    const rightRoot = unionFind.find(right);
    if (rightRoot !== root) {
      const rightReasons = reasonsByRoot.get(rightRoot) || new Set<DuplicateReason>();
      for (const reason of reasons) rightReasons.add(reason);
      reasonsByRoot.set(rightRoot, rightReasons);
    }
    reasonsByRoot.set(root, groupReasons);
  }

  const groups: DuplicateGroup[] = [];
  for (const [root, memberIndexes] of membersByRoot.entries()) {
    const reasons = [...(reasonsByRoot.get(root) || [])];
    if (reasons.length === 0) continue;
    reasons.sort((left, right) => (left === "similar-title" ? 1 : right === "similar-title" ? -1 : left.localeCompare(right)));
    const items = memberIndexes
      .map((index) => toDuplicateItem(settings[index]))
      .sort((left, right) => {
        if (left.status !== right.status) return left.status === "draft" ? -1 : 1;
        return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
      });
    groups.push({
      id: `duplicate-${groups.length + 1}`,
      confidence: isStrongDuplicateGroup({ reasons }) ? "high" : "medium",
      reasons: reasons as DuplicateReason[],
      reason: reasons.map((reason) => REASON_LABELS[reason]).join(" / "),
      items,
    });
  }

  return groups.sort((left, right) => {
    if (left.confidence !== right.confidence) return left.confidence === "high" ? -1 : 1;
    if (left.items.length !== right.items.length) return right.items.length - left.items.length;
    return left.items[0]?.title.localeCompare(right.items[0]?.title || "", "ja") || 0;
  });
}
