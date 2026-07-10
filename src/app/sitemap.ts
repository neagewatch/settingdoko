import { MetadataRoute } from 'next';
import { ALL_SETTINGS, FEATURES, CATEGORIES } from '@/lib/data/index';
import { ALL_TARGETS } from '@/lib/os';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://settingdoko.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/apps`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...ALL_TARGETS.map(t => ({
      url: `${BASE}/os/${t.id}`, lastModified: now,
      changeFrequency: 'weekly' as const, priority: 0.9,
    })),
    ...CATEGORIES.map(c => ({
      url: `${BASE}/category/${c.id}`, lastModified: now,
      changeFrequency: 'weekly' as const, priority: 0.7,
    })),
    ...FEATURES.map(f => ({
      url: `${BASE}/feature/${f.slug}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    ...ALL_SETTINGS.map(s => ({
      url: `${BASE}/setting/${s.slug}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.8,
    })),
  ];
}
