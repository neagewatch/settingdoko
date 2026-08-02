import { supabase } from "./supabase";
import { serverSupabase } from "./server-supabase";
import { Setting, OSType, SettingStep } from "./types";
import { allSampleSettings } from "./sample-data-export";
import { searchSettings } from "./search";

export interface ContentRequest {
  id: string;
  query: string;
  os?: string | null;
  note?: string | null;
  status: "new" | "reviewing" | "done";
  created_at: string;
}

// supabaseがnullの場合はサンプルデータで動作
const USE_SUPABASE = supabase !== null;

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

function withIds(items: typeof allSampleSettings): Setting[] {
  return items.map((item, i) => ({
    ...item,
    id: `sample-${i.toString().padStart(4, "0")}`,
    updated_at: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

export async function getAllSettings(): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizeSetting);
  }
  return withIds(allSampleSettings);
}

export async function getSettingBySlugAndOS(slug: string, os: OSType): Promise<Setting | null> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").eq("slug", slug).eq("os", os).single();
    if (error) return null;
    return normalizeSetting(data);
  }
  return withIds(allSampleSettings).find((s) => s.slug === slug && s.os === os) || null;
}

export async function getSettingsBySlug(slug: string): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").eq("slug", slug);
    if (error) return [];
    return (data || []).map(normalizeSetting);
  }
  return withIds(allSampleSettings).filter((s) => s.slug === slug);
}

export async function getSettingsByOS(os: OSType): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").eq("os", os).order("category");
    if (error) return [];
    return (data || []).map(normalizeSetting);
  }
  return withIds(allSampleSettings).filter((s) => s.os === os);
}

export async function searchDB(query: string, os?: OSType): Promise<Setting[]> {
  if (USE_SUPABASE) {
    let q = supabase!.from("settings").select("*");
    if (os) q = q.eq("os", os);
    const { data, error } = await q;
    if (error) return [];
    return searchSettings((data || []).map(normalizeSetting), query, os);
  }
  return searchSettings(withIds(allSampleSettings), query, os);
}

export async function getRelatedSettings(relatedSlugs: string[], currentId: string): Promise<Setting[]> {
  if (!relatedSlugs.length) return [];
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").in("slug", relatedSlugs).neq("id", currentId);
    if (error) return [];
    return (data || []).map(normalizeSetting);
  }
  return withIds(allSampleSettings).filter(
    (s) => relatedSlugs.includes(s.slug) && s.id !== currentId
  );
}

// ===== 管理画面用 CRUD =====

export async function createSetting(data: Omit<Setting, "id" | "updated_at">): Promise<Setting | null> {
  if (!USE_SUPABASE) return null;
  const { data: result, error } = await supabase!.from("settings").insert([data]).select().single();
  if (error) throw error;
  return normalizeSetting(result);
}

export async function updateSetting(id: string, data: Partial<Omit<Setting, "id">>): Promise<Setting | null> {
  if (!USE_SUPABASE) return null;
  const { data: result, error } = await supabase!.from("settings").update(data).eq("id", id).select().single();
  if (error) throw error;
  return normalizeSetting(result);
}

export async function deleteSetting(id: string): Promise<void> {
  if (!USE_SUPABASE) return;
  const { error } = await supabase!.from("settings").delete().eq("id", id);
  if (error) throw error;
}

export async function getSettingById(id: string): Promise<Setting | null> {
  if (!USE_SUPABASE) return null;
  const { data, error } = await supabase!.from("settings").select("*").eq("id", id).single();
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
