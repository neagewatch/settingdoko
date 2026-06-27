import { supabase } from "./supabase";
import { Setting, OSType } from "./types";
import { allSampleSettings } from "./sample-data-export";
import { searchSettings } from "./search";

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
    const { data, error } = await supabase.from("settings").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return withIds(allSampleSettings);
}

export async function getSettingBySlugAndOS(slug: string, os: OSType): Promise<Setting | null> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from("settings").select("*").eq("slug", slug).eq("os", os).single();
    if (error) return null;
    return data;
  }
  const all = withIds(allSampleSettings);
  return all.find((s) => s.slug === slug && s.os === os) || null;
}

export async function getSettingsBySlug(slug: string): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from("settings").select("*").eq("slug", slug);
    if (error) return [];
    return data || [];
  }
  return withIds(allSampleSettings).filter((s) => s.slug === slug);
}

export async function getSettingsByOS(os: OSType): Promise<Setting[]> {
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from("settings").select("*").eq("os", os).order("category");
    if (error) return [];
    return data || [];
  }
  return withIds(allSampleSettings).filter((s) => s.os === os);
}

export async function searchDB(query: string, os?: OSType): Promise<Setting[]> {
  if (USE_SUPABASE) {
    let q = supabase.from("settings").select("*");
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
    const { data, error } = await supabase.from("settings").select("*").in("slug", relatedSlugs).neq("id", currentId);
    if (error) return [];
    return data || [];
  }
  return withIds(allSampleSettings).filter((s) => relatedSlugs.includes(s.slug) && s.id !== currentId);
}
