import { supabase } from "./supabase";
import { serverSupabase } from "./server-supabase";
import { Setting, OSType, SettingStep, SettingWriteInput, isOSType } from "./types";
import { allSampleSettings } from "./sample-data-export";
import { searchSettings } from "./search";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ContentRequest {
  id: string;
  query: string;
  os?: string | null;
  note?: string | null;
  status: "new" | "reviewing" | "done";
  created_at: string;
}
export interface SettingRevision { id: string; setting_id: string; snapshot: Setting; created_at: string; }
export interface ContentReport { id: string; setting_id: string; title: string; comment?: string | null; status: "new" | "reviewing" | "done"; created_at: string; }
export interface ServerZeroHitSearch { query: string; os: string | null; count: number; last_seen_at: string; }
export interface SettingPageResult { items: Setting[]; total: number; }

const PUBLIC_COLUMNS = "id,title,slug,os,version,category,aliases,path,steps,related_slugs,keywords,description,updated_at,view_count,helpful_count,difficulty,estimate_minutes,screenshot_url,status,published_at,verified_at,source_url,device_scope,impact,rollback,caution,review_due_at";
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS},editor_note`;
const FALLBACK_UPDATED_AT = "2026-08-01T00:00:00.000Z";

// 環境変数がないローカル開発ではサンプルデータを使う。接続エラー時も
// 公開ページが「0件」「404」に化けないよう、最後の内蔵スナップショットへ退避する。
const USE_SUPABASE = supabase !== null;
const PUBLIC_CACHE_TTL_MS = 60_000;
const FALLBACK_CACHE_TTL_MS = 10_000;
// Supabase/PostgRESTの既定上限（1,000件）に依存しないよう、500件ずつ取得する。
const SETTINGS_PAGE_SIZE = 500;
const SETTINGS_MAX_PAGES = 200;
let publicSettingsCache: { data: Setting[]; expiresAt: number } | null = null;
let publicSettingsRequest: Promise<Setting[]> | null = null;
const categoryPageCache = new Map<string, { data: SettingPageResult; expiresAt: number }>();

export class DataAccessError extends Error {
  constructor(message = "データベースに接続できませんでした") {
    super(message);
    this.name = "DataAccessError";
  }
}

/**
 * 過去に管理画面から保存されたデータには、JSON の手順が
 * `{ text: "..." }` 形式になっているものがある。
 * 表示側は常に文字列配列として扱えるよう、読み取り時に互換変換する。
 */
function normalizeTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string") return item.trim() ? [item] : [];
    if (item && typeof item === "object" && "text" in item) {
      const text = (item as { text?: unknown }).text;
      return typeof text === "string" && text.trim() ? [text] : [];
    }
    return [];
  });
}

function normalizeSteps(value: unknown): SettingStep[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): SettingStep[] => {
    if (typeof item === "string") return item.trim() ? [item] : [];
    if (!item || typeof item !== "object" || !("text" in item)) return [];

    const { text, image_url, image_alt } = item as {
      text?: unknown; image_url?: unknown; image_alt?: unknown;
    };
    if (typeof text !== "string" || !text.trim()) return [];
    return [{
      text,
      ...(typeof image_url === "string" && image_url ? { image_url } : {}),
      ...(typeof image_alt === "string" && image_alt ? { image_alt } : {}),
    }];
  });
}

function normalizeSetting(setting: Setting): Setting {
  return {
    ...setting,
    aliases: normalizeTextList(setting.aliases),
    path: normalizeTextList(setting.path),
    steps: normalizeSteps(setting.steps),
    related_slugs: normalizeTextList(setting.related_slugs),
    keywords: normalizeTextList(setting.keywords),
  };
}

function publishedOnly(settings: Setting[]): Setting[] {
  return settings.filter((setting) => setting.status !== "draft");
}

function withIds(items: typeof allSampleSettings): Setting[] {
  return items.map((item, i) => ({
    ...item,
    id: `sample-${i.toString().padStart(4, "0")}`,
    updated_at: item.verified_at || FALLBACK_UPDATED_AT,
  }));
}

function fallbackSettings(includeDrafts = false): Setting[] {
  const settings = withIds(allSampleSettings).map(normalizeSetting);
  return includeDrafts ? settings : publishedOnly(settings);
}

function logReadFailure(operation: string, error: unknown) {
  console.error(`[data:${operation}] Supabase read failed`, error);
}

async function fetchSettingsPages(
  client: SupabaseClient,
  columns: string,
  status?: "published",
): Promise<Setting[]> {
  const result: Setting[] = [];

  for (let page = 0; page < SETTINGS_MAX_PAGES; page += 1) {
    let query = client
      .from("settings")
      .select(columns);
    if (status) query = query.eq("status", status);

    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .order("id", { ascending: true })
      .range(page * SETTINGS_PAGE_SIZE, (page + 1) * SETTINGS_PAGE_SIZE - 1);

    if (error) throw error;

    const pageData = (data || []) as unknown as Setting[];
    result.push(...pageData.map(normalizeSetting));
    if (pageData.length < SETTINGS_PAGE_SIZE) return result;
  }

  throw new DataAccessError("記事数が想定上限を超えました。ページ分割設定を確認してください");
}

async function loadPublishedSettings(): Promise<Setting[]> {
  if (publicSettingsCache && publicSettingsCache.expiresAt > Date.now()) return publicSettingsCache.data;
  if (publicSettingsRequest) return publicSettingsRequest;

  const request = (async () => {
    if (USE_SUPABASE) {
      try {
        const result = await fetchSettingsPages(supabase!, PUBLIC_COLUMNS, "published");
        publicSettingsCache = { data: result, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS };
        return result;
      } catch (error) {
        logReadFailure("all", error);
      }
      const result = fallbackSettings();
      publicSettingsCache = { data: result, expiresAt: Date.now() + FALLBACK_CACHE_TTL_MS };
      return result;
    }

    const result = fallbackSettings();
    publicSettingsCache = { data: result, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS };
    return result;
  })();

  publicSettingsRequest = request;
  try {
    return await request;
  } finally {
    if (publicSettingsRequest === request) publicSettingsRequest = null;
  }
}

export function clearPublicSettingsCache() {
  publicSettingsCache = null;
  categoryPageCache.clear();
}

export async function getAllSettings(includeDrafts = false): Promise<Setting[]> {
  if (includeDrafts) {
    if (!serverSupabase) throw new DataAccessError("管理用データベース接続が設定されていません");
    try {
      return await fetchSettingsPages(serverSupabase, ADMIN_COLUMNS);
    } catch (error) {
      throw new DataAccessError(error instanceof Error ? error.message : "管理用データを取得できませんでした");
    }
  }
  return loadPublishedSettings();
}

export async function getSettingBySlugAndOS(slug: string, os: OSType): Promise<Setting | null> {
  if (!isOSType(os)) return null;
  const settings = await loadPublishedSettings();
  return settings.find((s) => s.slug === slug && s.os === os) || null;
}

export async function getSettingsBySlug(slug: string): Promise<Setting[]> {
  return (await loadPublishedSettings()).filter((s) => s.slug === slug);
}

export async function getSettingsByOS(os: OSType): Promise<Setting[]> {
  if (!isOSType(os)) return [];
  return (await loadPublishedSettings())
    .filter((s) => s.os === os)
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * カテゴリ一覧用のページ取得。大量のカテゴリでも初回HTMLには必要な件数だけ載せる。
 * Supabase接続時はDB側で絞り込み、ローカル/障害時は内蔵データから同じ形で返す。
 */
export async function getSettingsByCategory(
  category: string,
  options: { os?: OSType; page?: number; pageSize?: number } = {},
): Promise<SettingPageResult> {
  const safeOS = options.os && isOSType(options.os) ? options.os : undefined;
  const pageSize = Math.max(1, Math.min(100, Math.floor(options.pageSize ?? 20)));
  const page = Math.max(1, Math.min(1000, Math.floor(options.page ?? 1)));
  const cacheKey = `${category}\u0000${safeOS || ""}\u0000${page}\u0000${pageSize}`;
  const cached = categoryPageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  if (USE_SUPABASE) {
    try {
      let query = supabase!
        .from("settings")
        .select(PUBLIC_COLUMNS, { count: "exact" })
        .eq("status", "published")
        .eq("category", category);
      if (safeOS) query = query.eq("os", safeOS);

      const from = (page - 1) * pageSize;
      const { data, count, error } = await query
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw error;

      const result = { items: (data || []).map((item) => normalizeSetting(item as unknown as Setting)), total: count ?? (data || []).length };
      categoryPageCache.set(cacheKey, { data: result, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS });
      return result;
    } catch (error) {
      logReadFailure("category", error);
    }
  }

  const fallback = fallbackSettings().filter((setting) => setting.category === category && (!safeOS || setting.os === safeOS));
  const from = (page - 1) * pageSize;
  const result = { items: fallback.slice(from, from + pageSize), total: fallback.length };
  categoryPageCache.set(cacheKey, { data: result, expiresAt: Date.now() + FALLBACK_CACHE_TTL_MS });
  return result;
}

export async function searchDB(query: string, os?: OSType): Promise<Setting[]> {
  const safeOS = os && isOSType(os) ? os : undefined;
  return searchSettings(await loadPublishedSettings(), query, safeOS);
}

export async function getRelatedSettings(relatedSlugs: string[], currentId: string): Promise<Setting[]> {
  if (!relatedSlugs.length) return [];
  return (await loadPublishedSettings()).filter(
    (s) => relatedSlugs.includes(s.slug) && s.id !== currentId
  );
}

// ===== 管理画面用 CRUD =====

export async function createSetting(data: SettingWriteInput): Promise<Setting | null> {
  if (!serverSupabase) throw new DataAccessError("管理用データベース接続が設定されていません");
  const payload = {
    ...data,
    published_at: data.status === "published" ? data.published_at || new Date().toISOString() : data.published_at,
  };
  const { data: result, error } = await serverSupabase.from("settings").insert([payload]).select(ADMIN_COLUMNS).single();
  if (error) throw error;
  clearPublicSettingsCache();
  return normalizeSetting(result);
}

export async function updateSetting(id: string, data: Partial<SettingWriteInput>): Promise<Setting | null> {
  if (!serverSupabase) throw new DataAccessError("管理用データベース接続が設定されていません");
  const { data: previous } = await serverSupabase.from("settings").select(ADMIN_COLUMNS).eq("id", id).single();
  if (previous) await serverSupabase.from("setting_revisions").insert({ setting_id: id, snapshot: previous });
  const payload = {
    ...data,
    ...(data.status === "published" && !data.published_at ? { published_at: new Date().toISOString() } : {}),
  };
  const { data: result, error } = await serverSupabase.from("settings").update(payload).eq("id", id).select(ADMIN_COLUMNS).single();
  if (error) throw error;
  clearPublicSettingsCache();
  return normalizeSetting(result);
}

export async function deleteSetting(id: string): Promise<void> {
  if (!serverSupabase) throw new DataAccessError("管理用データベース接続が設定されていません");
  const { error } = await serverSupabase.from("settings").delete().eq("id", id);
  if (error) throw error;
  clearPublicSettingsCache();
}

export async function getSettingById(id: string): Promise<Setting | null> {
  if (!serverSupabase) return null;
  const { data, error } = await serverSupabase.from("settings").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error) return null;
  return normalizeSetting(data);
}

export async function getContentRequests(): Promise<ContentRequest[]> {
  if (!serverSupabase) return [];
  const { data, error } = await serverSupabase
    .from("content_requests")
    .select("id, query, os, note, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return error ? [] : (data || []) as ContentRequest[];
}

export async function getContentReports(): Promise<ContentReport[]> {
  if (!serverSupabase) return [];
  const { data, error } = await serverSupabase.from("content_reports").select("id, setting_id, title, comment, status, created_at").order("created_at", { ascending: false }).limit(100);
  return error ? [] : (data || []) as ContentReport[];
}

export async function getServerZeroHitSearches(limit = 10): Promise<ServerZeroHitSearch[]> {
  if (!serverSupabase) return [];
  const { data, error } = await serverSupabase
    .from("search_logs")
    .select("query,normalized_query,os,created_at")
    .eq("result_count", 0)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error || !data) return [];

  const grouped = new Map<string, ServerZeroHitSearch>();
  for (const row of data as Array<{ query?: unknown; normalized_query?: unknown; os?: unknown; created_at?: unknown }>) {
    if (typeof row.query !== "string" || typeof row.created_at !== "string") continue;
    const normalized = typeof row.normalized_query === "string" ? row.normalized_query : row.query.toLowerCase();
    const os = typeof row.os === "string" && isOSType(row.os) ? row.os : null;
    const key = `${normalized}\u0000${os || ""}`;
    const current = grouped.get(key);
    if (current) {
      current.count += 1;
      if (row.created_at > current.last_seen_at) current.last_seen_at = row.created_at;
    } else {
      grouped.set(key, { query: row.query, os, count: 1, last_seen_at: row.created_at });
    }
  }

  return [...grouped.values()]
    .sort((a, b) => b.count - a.count || b.last_seen_at.localeCompare(a.last_seen_at))
    .slice(0, Math.max(1, Math.min(50, limit)));
}

export async function getSettingRevisions(settingId: string): Promise<SettingRevision[]> {
  if (!serverSupabase) return [];
  const { data, error } = await serverSupabase.from("setting_revisions").select("id, setting_id, snapshot, created_at").eq("setting_id", settingId).order("created_at", { ascending: false }).limit(20);
  return error ? [] : (data || []) as SettingRevision[];
}
