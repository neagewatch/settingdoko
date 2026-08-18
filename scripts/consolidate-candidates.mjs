// 同じテーマを発生場面別に展開した候補を、1テーマ1ページへまとめる。
// 対象は自動生成パックだけに限定し、手作り記事やOS横断記事は変更しない。
const CONSOLIDATABLE_PREFIXES = [
  "trouble8-",
  "trouble9-",
  "trouble10-error-",
  "trouble10-maker-",
  "trouble10-app-",
  "trouble11-error-",
  "trouble12-high-demand-",
];

// 同じテーマの古いslugを、基本記事へ寄せるための明示的な対応表。
// 派生記事を残したまま再取り込みされないよう、候補統合と監査で共通利用する。
const CANONICAL_SLUG_ALIASES = new Map([
  ["trouble6-win11-signin-failed", "trouble6-win11-signin"],
  ["trouble8-win11-signin-failed", "trouble6-win11-signin"],
  ["trouble9-win11-signin", "trouble6-win11-signin"],
]);

function isWindowsSigninVariant(slug) {
  return slug.startsWith("trouble6-win11-signin-")
    || slug.startsWith("trouble8-win11-signin-failed-")
    || slug.startsWith("trouble9-win11-signin-");
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))];
}

function variantLabel(item) {
  if (!item || typeof item.title !== "string") return "";
  const match = item.title.match(/（([^（）]+)）$/);
  return match?.[1] || "";
}

function baseTitle(item) {
  return typeof item?.title === "string"
    ? item.title.replace(/（[^（）]+）$/, "")
    : "";
}

function getCanonicalSlug(slug) {
  return CANONICAL_SLUG_ALIASES.get(slug)
    || (isWindowsSigninVariant(slug) ? "trouble6-win11-signin" : slug);
}

function getConsolidationKey(item) {
  if (!item || typeof item.slug !== "string") return null;
  const canonicalSlug = getCanonicalSlug(item.slug);
  if (canonicalSlug !== item.slug) return canonicalSlug;
  const prefix = CONSOLIDATABLE_PREFIXES.find((value) => item.slug.startsWith(value));
  if (!prefix) return null;
  const label = variantLabel(item);
  if (!label) return item.slug;
  const separator = item.slug.lastIndexOf("-");
  return separator > prefix.length ? item.slug.slice(0, separator) : item.slug;
}

function replaceVariantInStep(step, label) {
  if (!label) return step;
  if (typeof step === "string") return step.replaceAll(label, "該当する発生場面");
  if (!step || typeof step !== "object" || typeof step.text !== "string") return step;
  return {
    ...step,
    text: step.text.replaceAll(label, "該当する発生場面"),
  };
}

function mergeGroup(group) {
  const first = group.find((item) => !variantLabel(item)) || group[0];
  const firstLabel = variantLabel(first);
  const labels = unique(group.map(variantLabel));
  const title = baseTitle(first);
  const description = typeof first.description === "string"
    ? (firstLabel ? first.description.replaceAll(firstLabel, "該当する発生場面") : first.description)
    : title + "の確認手順です。";
  const impact = typeof first.impact === "string"
    ? (firstLabel ? first.impact.replaceAll(firstLabel, "該当する発生場面") : first.impact)
    : undefined;

  return {
    ...first,
    title,
    slug: getConsolidationKey(first) || first.slug,
    aliases: unique([
      ...group.flatMap((item) => Array.isArray(item.aliases) ? item.aliases : []),
      title,
    ]),
    keywords: unique(group.flatMap((item) => Array.isArray(item.keywords) ? item.keywords : [])),
    steps: Array.isArray(first.steps)
      ? first.steps.map((step) => replaceVariantInStep(step, firstLabel))
      : first.steps,
    related_slugs: unique(group.flatMap((item) => Array.isArray(item.related_slugs) ? item.related_slugs : [])),
    description: description + " 発生場面：" + (labels.join("、") || "状況により異なります") + "。",
    ...(impact ? { impact } : {}),
    editor_note: (first.editor_note || "下書き候補です。") + " 同じテーマの発生場面別候補を1ページに統合しています。",
  };
}

function grouped(items) {
  const groups = new Map();
  for (const item of items) {
    const key = getConsolidationKey(item);
    if (!key) continue;
    const current = groups.get(key) || [];
    current.push(item);
    groups.set(key, current);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ key, items: group }));
}

function consolidateCandidates(items) {
  const groups = grouped(items);
  const groupByKey = new Map(groups.map((group) => [group.key, group.items]));
  const emitted = new Set();
  const result = [];

  for (const item of items) {
    const key = getConsolidationKey(item);
    const group = key ? groupByKey.get(key) : null;
    if (!group) {
      result.push(item);
      continue;
    }
    if (emitted.has(key)) continue;
    emitted.add(key);
    result.push(mergeGroup(group));
  }
  return result;
}

function getConsolidationReport(items) {
  const groups = grouped(items);
  return {
    groups: groups.length,
    before: items.length,
    after: items.length - groups.reduce((sum, group) => sum + group.items.length - 1, 0),
    duplicateRows: groups.reduce((sum, group) => sum + group.items.length - 1, 0),
    details: groups.map((group) => ({
      key: group.key,
      count: group.items.length,
      statuses: unique(group.items.map((item) => item.status || "candidate")),
      titles: group.items.map((item) => item.title),
    })),
  };
}

function getConsolidationGroups(items) {
  return grouped(items);
}

function mergeConsolidationGroup(items) {
  return mergeGroup(items);
}

export {
  CANONICAL_SLUG_ALIASES,
  CONSOLIDATABLE_PREFIXES,
  consolidateCandidates,
  getCanonicalSlug,
  getConsolidationGroups,
  getConsolidationKey,
  getConsolidationReport,
  isWindowsSigninVariant,
  mergeConsolidationGroup,
};
