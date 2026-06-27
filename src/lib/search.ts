import { Setting, OSType, ALIAS_MAP } from "./types";

/** 表記ゆれ・タイポ補正 */
export function normalizeQuery(query: string): string {
  let q = query.toLowerCase().trim();
  for (const [from, to] of Object.entries(ALIAS_MAP)) {
    q = q.replace(new RegExp(from, "gi"), to);
  }
  return q;
}

/** Simple full-text search scoring */
export function searchSettings(
  settings: Setting[],
  query: string,
  osFilter?: OSType
): Setting[] {
  const normalized = normalizeQuery(query);
  const q = normalized.toLowerCase().trim();
  if (!q) return osFilter ? settings.filter((s) => s.os === osFilter) : settings;

  const tokens = q.split(/\s+/);
  const scored = settings
    .filter((s) => !osFilter || s.os === osFilter)
    .map((s) => {
      let score = 0;
      for (const t of tokens) {
        if (s.title.toLowerCase().includes(t)) score += 10;
        if (s.aliases.some((a) => a.toLowerCase().includes(t))) score += 8;
        if (s.keywords.some((k) => k.toLowerCase().includes(t))) score += 6;
        if (s.description.toLowerCase().includes(t)) score += 4;
        const allFields = [...s.aliases, ...s.keywords, ...s.path, s.category].join(" ").toLowerCase();
        if (allFields.includes(t)) score += 2;
      }
      return { setting: s, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.setting);
}

/** サジェスト用：前方一致でタイトル・エイリアスを検索 */
export function getSuggestions(
  settings: Setting[],
  query: string,
  limit = 6
): Setting[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 1) return [];

  const seen = new Set<string>();
  const results: Setting[] = [];

  for (const s of settings) {
    if (results.length >= limit) break;
    const key = `${s.slug}-${s.os}`;
    if (seen.has(key)) continue;

    const titleMatch = s.title.toLowerCase().includes(q);
    const aliasMatch = s.aliases.some((a) => a.toLowerCase().includes(q));
    const keywordMatch = s.keywords.some((k) => k.toLowerCase().includes(q));

    if (titleMatch || aliasMatch || keywordMatch) {
      seen.add(key);
      results.push(s);
    }
  }
  return results;
}
