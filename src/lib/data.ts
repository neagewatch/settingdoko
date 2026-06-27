import { supabase } from "./supabase";
import { Setting, OSType } from "./types";
import { allSampleSettings } from "./sample-data-export";
import { searchSettings } from "./search";

// supabaseがnullの場合はサンプルデータで動作
const USE_SUPABASE = supabase !== null;

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
    return data || [];
  }
  return withIds(allSampleSettings);
}

export async function getSettingBySlugAndOS(slug: string, os: OSType): Promise<Setting | null> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").eq("slug", slug).eq("os", os).single();
    if (error) return null;
    return data;
  }
  return withIds(allSampleSettings).find((s) => s.slug === slug && s.os === os) || null;
}

export async function getSettingsBySlug(slug: string): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").eq("slug", slug);
    if (error) return [];
    return data || [];
  }
  return withIds(allSampleSettings).filter((s) => s.slug === slug);
}

export async function getSettingsByOS(os: OSType): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").eq("os", os).order("category");
    if (error) return [];
    return data || [];
  }
  return withIds(allSampleSettings).filter((s) => s.os === os);
}

export async function searchDB(query: string, os?: OSType): Promise<Setting[]> {
  if (USE_SUPABASE) {
    let q = supabase!.from("settings").select("*");
    if (os) q = q.eq("os", os);
    const { data, error } = await q;
    if (error) return [];
    return searchSettings(data || [], query, os);
  }
  return searchSettings(withIds(allSampleSettings), query, os);
}

export async function getRelatedSettings(relatedSlugs: string[], currentId: string): Promise<Setting[]> {
  if (!relatedSlugs.length) return [];
  if (USE_SUPABASE) {
    const { data, error } = await supabase!
      .from("settings").select("*").in("slug", relatedSlugs).neq("id", currentId);
    if (error) return [];
    return data || [];
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
  return result;
}

export async function updateSetting(id: string, data: Partial<Omit<Setting, "id">>): Promise<Setting | null> {
  if (!USE_SUPABASE) return null;
  const { data: result, error } = await supabase!.from("settings").update(data).eq("id", id).select().single();
  if (error) throw error;
  return result;
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
  return data;
}
