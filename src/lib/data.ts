import { supabase, Setting, Category } from './supabase';
import { ALL_SETTINGS, CATEGORIES } from './data/index';

// Supabase未接続時はローカルデータで動作
const useLocal = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase');

export async function fetchCategories(): Promise<Category[]> {
  return CATEGORIES;
}

function normalize(q: string): string {
  return q.toLowerCase().normalize('NFKC');
}

export function searchLocal(query: string, osFilter?: string, diffFilter?: string): Setting[] {
  const q = normalize(query);
  const scored = ALL_SETTINGS
    .filter(s => s.is_published)
    .filter(s => !osFilter || s.os === osFilter)
    .filter(s => !diffFilter || s.difficulty === diffFilter)
    .map(s => {
      let score = 0;
      const title = normalize(s.title);
      if (title === q) score += 100;
      else if (title.includes(q)) score += 50;
      if (s.aliases.some(a => normalize(a).includes(q))) score += 30;
      if (s.keywords.some(k => normalize(k).includes(q))) score += 20;
      if (normalize(s.description || '').includes(q)) score += 10;
      if (s.path.some(p => normalize(p).includes(q))) score += 5;
      return { s, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map(x => x.s);
}

export async function searchSettingsData(query: string, osFilter?: string, diffFilter?: string): Promise<Setting[]> {
  if (useLocal) return searchLocal(query, osFilter, diffFilter);
  const { data } = await supabase.rpc('search_settings', {
    search_query: query, os_filter: osFilter || null,
  });
  let results = (data as Setting[]) || [];
  if (diffFilter) results = results.filter(s => s.difficulty === diffFilter);
  return results;
}

export async function fetchSettingBySlugAndOs(slug: string, os: string): Promise<Setting | null> {
  if (useLocal) return ALL_SETTINGS.find(s => s.slug === slug && s.os === os && s.is_published) || null;
  const { data } = await supabase.from('settings').select('*')
    .eq('slug', slug).eq('os', os).eq('is_published', true).single();
  return data as Setting | null;
}

export async function fetchSettingBySlug(slug: string): Promise<Setting | null> {
  if (useLocal) return ALL_SETTINGS.find(s => s.slug === slug && s.is_published) || null;
  const { data } = await supabase.from('settings').select('*')
    .eq('slug', slug).eq('is_published', true).limit(1).single();
  return data as Setting | null;
}

export async function fetchSettingsByOs(os: string): Promise<Setting[]> {
  if (useLocal) return ALL_SETTINGS.filter(s => s.os === os && s.is_published);
  const { data } = await supabase.from('settings').select('*')
    .eq('os', os).eq('is_published', true).order('category').order('title');
  return (data as Setting[]) || [];
}

export async function fetchSettingsByCategory(cat: string): Promise<Setting[]> {
  if (useLocal) return ALL_SETTINGS.filter(s => s.category === cat && s.is_published);
  const { data } = await supabase.from('settings').select('*')
    .eq('category', cat).eq('is_published', true).order('os').order('title');
  return (data as Setting[]) || [];
}

export async function fetchRelatedSettings(setting: Setting): Promise<Setting[]> {
  if (useLocal) return ALL_SETTINGS.filter(
    s => setting.related_slugs.includes(s.slug) && s.is_published
  );
  if (!setting.related_slugs.length) return [];
  const { data } = await supabase.from('settings').select('*')
    .in('slug', setting.related_slugs).eq('is_published', true);
  return (data as Setting[]) || [];
}

export async function fetchAllSettings(): Promise<Setting[]> {
  if (useLocal) return ALL_SETTINGS;
  const { data } = await supabase.from('settings').select('*').order('os').order('title');
  return (data as Setting[]) || [];
}

// 同一OS内での前後ナビ用
export async function fetchPrevNext(setting: Setting): Promise<{ prev: Setting | null; next: Setting | null }> {
  const list = await fetchSettingsByOs(setting.os);
  const idx = list.findIndex(s => s.slug === setting.slug);
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
  };
}
