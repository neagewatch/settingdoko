"use client";

const SEARCH_LOG_KEY = "sdoko_search_log";
const VIEW_LOG_KEY = "sdoko_view_log";
const HELPFUL_KEY = "sdoko_helpful";
const BOOKMARK_KEY = "sdoko_bookmarks";
const STEP_PROGRESS_KEY = "sdoko_progress";
const MAX_LOG = 200;

export interface SearchLogEntry { query: string; timestamp: number; results: number; }
export interface ViewLogEntry { slug: string; os: string; title: string; timestamp: number; }
export interface Bookmark { slug: string; os: string; title: string; category: string; savedAt: number; }
export interface StepProgress { completedSteps: number[]; }

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// 検索ログ
export function logSearch(query: string, resultCount: number) {
  const log: SearchLogEntry[] = safeGet(SEARCH_LOG_KEY, []);
  log.unshift({ query: query.trim(), timestamp: Date.now(), results: resultCount });
  safeSet(SEARCH_LOG_KEY, log.slice(0, MAX_LOG));
}

// 最近の検索（履歴表示用）
export function getRecentSearches(limit = 5): string[] {
  const log: SearchLogEntry[] = safeGet(SEARCH_LOG_KEY, []);
  const seen = new Set<string>();
  return log.filter(e => e.query && !seen.has(e.query) && seen.add(e.query)).map(e => e.query).slice(0, limit);
}

// PV記録
export function logView(slug: string, os: string, title: string) {
  const log: ViewLogEntry[] = safeGet(VIEW_LOG_KEY, []);
  log.unshift({ slug, os, title, timestamp: Date.now() });
  safeSet(VIEW_LOG_KEY, log.slice(0, MAX_LOG));
}

// 最近見た設定
export function getRecentViews(limit = 5): ViewLogEntry[] {
  const log: ViewLogEntry[] = safeGet(VIEW_LOG_KEY, []);
  const seen = new Set<string>();
  return log.filter(e => { const k = `${e.slug}-${e.os}`; return !seen.has(k) && !!seen.add(k); }).slice(0, limit);
}

// 人気検索
export function getPopularSearches(limit = 6): { query: string; count: number }[] {
  const log: SearchLogEntry[] = safeGet(SEARCH_LOG_KEY, []);
  const counts: Record<string, number> = {};
  for (const e of log) { if (e.query) counts[e.query] = (counts[e.query] || 0) + 1; }
  return Object.entries(counts).map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

// 人気設定
export function getPopularSettings(limit = 5): { slug: string; os: string; title: string; count: number }[] {
  const log: ViewLogEntry[] = safeGet(VIEW_LOG_KEY, []);
  const counts: Record<string, { slug: string; os: string; title: string; count: number }> = {};
  for (const e of log) {
    const key = `${e.slug}-${e.os}`;
    if (!counts[key]) counts[key] = { slug: e.slug, os: e.os, title: e.title, count: 0 };
    counts[key].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit);
}

// ゼロヒット
export function getZeroHitSearches(limit = 10): string[] {
  const log: SearchLogEntry[] = safeGet(SEARCH_LOG_KEY, []);
  const seen = new Set<string>();
  return log.filter(e => e.results === 0 && e.query && !seen.has(e.query) && !!seen.add(e.query)).map(e => e.query).slice(0, limit);
}

// 解決済みフィードバック
export function markHelpful(settingId: string) {
  const map: Record<string, boolean> = safeGet(HELPFUL_KEY, {});
  map[settingId] = true;
  safeSet(HELPFUL_KEY, map);
}
export function isHelpful(settingId: string): boolean {
  return !!(safeGet(HELPFUL_KEY, {}) as Record<string,boolean>)[settingId];
}

// ブックマーク
export function getBookmarks(): Bookmark[] { return safeGet(BOOKMARK_KEY, []); }
export function isBookmarked(slug: string, os: string): boolean {
  return getBookmarks().some(b => b.slug === slug && b.os === os);
}
export function addBookmark(b: Omit<Bookmark, "savedAt">) {
  const list = getBookmarks().filter(x => !(x.slug === b.slug && x.os === b.os));
  list.unshift({ ...b, savedAt: Date.now() });
  safeSet(BOOKMARK_KEY, list.slice(0, 50));
}
export function removeBookmark(slug: string, os: string) {
  safeSet(BOOKMARK_KEY, getBookmarks().filter(b => !(b.slug === slug && b.os === os)));
}

// 手順進捗
export function getProgress(key: string): number[] {
  const all: Record<string, StepProgress> = safeGet(STEP_PROGRESS_KEY, {});
  return all[key]?.completedSteps || [];
}
export function toggleStep(key: string, step: number) {
  const all: Record<string, StepProgress> = safeGet(STEP_PROGRESS_KEY, {});
  const current = all[key]?.completedSteps || [];
  const next = current.includes(step) ? current.filter(s => s !== step) : [...current, step];
  all[key] = { completedSteps: next };
  safeSet(STEP_PROGRESS_KEY, all);
}
export function clearProgress(key: string) {
  const all: Record<string, StepProgress> = safeGet(STEP_PROGRESS_KEY, {});
  delete all[key];
  safeSet(STEP_PROGRESS_KEY, all);
}

// ダークモード
export function getDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("sdoko_dark");
  if (stored !== null) return stored === "1";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
export function setDarkMode(dark: boolean) { localStorage.setItem("sdoko_dark", dark ? "1" : "0"); }
