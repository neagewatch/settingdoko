import { canonicalIntentKey } from "./duplicate-detection";
import { normalizeQuery, searchSettings } from "./search";
import { SOURCE_DISCOVERY_MAP } from "./source-quality";
import { isOSType, type OSType, type Setting } from "./types";

export type SearchLogRecord = {
  query: string;
  normalized_query?: string | null;
  os?: string | null;
  result_count: number;
  created_at: string;
  top_result_slug?: string | null;
  clicked_setting_slug?: string | null;
  searches?: number;
  zero_hits?: number;
  weak_results?: number;
};

export type DemandDisposition = "MISSING_ALIAS" | "MISSING_GUIDE" | "WEAK_RESULT" | "COVERED";

export type DemandCluster = {
  key: string;
  representativeQuery: string;
  normalizedQuery: string;
  os: OSType | null;
  count: number;
  zeroResultCount: number;
  weakResultCount: number;
  lastSeenAt: string;
  recent30Days: number;
  previous30Days: number;
  trend: "increasing" | "stable" | "new";
  variations: string[];
  disposition: DemandDisposition;
  existingMatches: Array<{ slug: string; title: string; os: OSType }>;
  suggestedAliases: string[];
  priority: number;
  discoverySource: "ZERO_RESULT_SEARCH" | "WEAK_RESULT_SEARCH";
  sourceDomains: string[];
};

const QUERY_EQUIVALENTS: Array<[RegExp, string]> = [
  [/(wi-?fi|wifi|ワイファイ)/gi, "wifi"],
  [/(bluetooth|ブルートゥース)/gi, "bluetooth"],
  [/(繋がらない|つながらない|接続できない)/g, "接続不可"],
  [/(すぐ)?切れる|切断される|途切れる/g, "切断"],
  [/(使えない|動かない|反応しない)/g, "利用不可"],
  [/(見つからない|表示されない|出てこない)/g, "未表示"],
  [/(オフにする|無効にする|切る|止める)/g, "無効"],
  [/(オンにする|有効にする)/g, "有効"],
  [/(変更する|変える|変えたい)/g, "変更"],
  [/(文字|テキスト|フォント)(の)?(大きさ|サイズ)?/g, "文字サイズ"],
  [/(でかく|大きく)(したい|する)?/g, "拡大"],
];

export function normalizeDemandQuery(value: string): string {
  let normalized = normalizeQuery(value);
  for (const [pattern, replacement] of QUERY_EQUIVALENTS) normalized = normalized.replace(pattern, replacement);
  return normalized
    .replace(/[「」『』（）()【】\[\]、。,.!！?？・:：/\\_\-]/g, "")
    .replace(/(を|が|は|に|で|の|したい|する|方法|とき|時)/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function daysAgo(timestamp: string, now: number): number | null {
  const value = Date.parse(timestamp);
  return Number.isFinite(value) ? Math.floor((now - value) / 86_400_000) : null;
}

function sourceDomainsFor(os: OSType | null): string[] {
  if (!os) return [];
  return [...((SOURCE_DISCOVERY_MAP as Partial<Record<OSType, readonly string[]>>)[os] || [])];
}

function intentMatches(setting: Setting, query: string): boolean {
  const querySetting = {
    os: setting.os,
    category: setting.category,
    title: query,
    aliases: [query],
    keywords: [query],
  };
  const queryIntent = canonicalIntentKey(querySetting);
  return Boolean(queryIntent && queryIntent === canonicalIntentKey(setting));
}

export function analyzeSearchDemand(logs: SearchLogRecord[], settings: Setting[], now = Date.now()): DemandCluster[] {
  const groups = new Map<string, SearchLogRecord[]>();
  for (const log of logs) {
    if (!log.query.trim() || !Number.isFinite(log.result_count)) continue;
    const normalized = normalizeDemandQuery(log.normalized_query || log.query);
    if (!normalized) continue;
    const os = log.os && isOSType(log.os) ? log.os : null;
    const key = `${normalized}\u0000${os || ""}`;
    groups.set(key, [...(groups.get(key) || []), log]);
  }

  const clusters: DemandCluster[] = [];
  for (const [key, rows] of groups.entries()) {
    const sorted = [...rows].sort((left, right) => right.created_at.localeCompare(left.created_at));
    const os = sorted[0].os && isOSType(sorted[0].os) ? sorted[0].os : null;
    const frequency = new Map<string, number>();
    for (const row of rows) frequency.set(row.query, (frequency.get(row.query) || 0) + Math.max(1, row.searches || 1));
    const representativeQuery = [...frequency.entries()].sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)[0][0];
    const currentMatches = searchSettings(settings, representativeQuery, os || undefined).slice(0, 5);
    const strongMatches = currentMatches.filter((setting) => intentMatches(setting, representativeQuery));
    const totalCount = rows.reduce((sum, row) => sum + Math.max(1, row.searches || 1), 0);
    const zeroResultCount = rows.reduce((sum, row) => sum + Math.max(0, row.zero_hits ?? (row.result_count === 0 ? Math.max(1, row.searches || 1) : 0)), 0);
    const weakResultCount = rows.reduce((sum, row) => sum + Math.max(0, row.weak_results ?? (row.result_count > 0 && !row.clicked_setting_slug ? Math.max(1, row.searches || 1) : 0)), 0);
    const recent30Days = rows.filter((row) => {
      const age = daysAgo(row.created_at, now);
      return age !== null && age >= 0 && age < 30;
    }).reduce((sum, row) => sum + Math.max(1, row.searches || 1), 0);
    const previous30Days = rows.filter((row) => {
      const age = daysAgo(row.created_at, now);
      return age !== null && age >= 30 && age < 60;
    }).reduce((sum, row) => sum + Math.max(1, row.searches || 1), 0);

    let disposition: DemandDisposition;
    if (zeroResultCount > 0 && strongMatches.length > 0) disposition = "MISSING_ALIAS";
    else if (zeroResultCount > 0) disposition = "MISSING_GUIDE";
    else if (weakResultCount > 0) disposition = "WEAK_RESULT";
    else disposition = "COVERED";

    const demandPoints = Math.min(50, totalCount * 5);
    const gapPoints = disposition === "MISSING_GUIDE" ? 30 : disposition === "MISSING_ALIAS" ? 18 : disposition === "WEAK_RESULT" ? 12 : 0;
    const trendPoints = recent30Days > previous30Days ? 12 : 0;
    const sourcePoints = sourceDomainsFor(os).length > 0 ? 8 : 0;
    clusters.push({
      key,
      representativeQuery,
      normalizedQuery: normalizeDemandQuery(representativeQuery),
      os,
      count: totalCount,
      zeroResultCount,
      weakResultCount,
      lastSeenAt: sorted[0].created_at,
      recent30Days,
      previous30Days,
      trend: previous30Days === 0 && recent30Days > 0 ? "new" : recent30Days > previous30Days ? "increasing" : "stable",
      variations: [...frequency.keys()].slice(0, 20),
      disposition,
      existingMatches: currentMatches.map((setting) => ({ slug: setting.slug, title: setting.title, os: setting.os })),
      suggestedAliases: disposition === "MISSING_ALIAS" ? [...frequency.keys()].slice(0, 10) : [],
      priority: Math.min(100, demandPoints + gapPoints + trendPoints + sourcePoints),
      discoverySource: zeroResultCount > 0 ? "ZERO_RESULT_SEARCH" : "WEAK_RESULT_SEARCH",
      sourceDomains: sourceDomainsFor(os),
    });
  }

  return clusters.sort((left, right) => right.priority - left.priority || right.count - left.count || right.lastSeenAt.localeCompare(left.lastSeenAt));
}

export function toAcquisitionBacklog(clusters: DemandCluster[]) {
  return clusters
    .filter((cluster) => cluster.disposition !== "COVERED")
    .map((cluster) => ({
      candidate_title: cluster.representativeQuery,
      platform: cluster.os || "unknown",
      category: "unclassified",
      intent: cluster.normalizedQuery,
      discovery_source: cluster.discoverySource,
      demand_signal: cluster.count,
      existing_similar_guides: cluster.existingMatches.map((item) => item.slug).join("|"),
      official_source_candidate: cluster.sourceDomains.join("|"),
      priority: cluster.priority,
      recommended_action: cluster.disposition === "MISSING_ALIAS" ? "ADD_ALIAS" : cluster.disposition === "WEAK_RESULT" ? "REVIEW_RANKING" : "CREATE_CANDIDATE",
      status: "DISCOVERED",
    }));
}
