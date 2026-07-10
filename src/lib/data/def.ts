import { Setting, Difficulty } from '../supabase';

let seq = 0;

type Def = {
  t: string; s: string; os: string;
  ot?: 'os' | 'app';
  v?: string; c: string; d: string;
  a?: string[]; p: string[]; st: string[];
  tip?: string; r?: string[]; k?: string[];
  df?: Difficulty; m?: number;
};

const DEFAULT_VERSION: Record<string, string> = {
  windows11: '24H2', windows10: '22H2', ios: 'iOS 18', ipados: 'iPadOS 18',
  macos: 'Sequoia', android: 'Android 15',
};

export function def(x: Def): Setting {
  seq++;
  const isApp = x.ot === 'app' || !DEFAULT_VERSION[x.os];
  return {
    id: String(seq),
    title: x.t,
    slug: x.s,
    os: x.os,
    os_type: isApp ? 'app' : 'os',
    version: x.v ?? (isApp ? '最新版' : DEFAULT_VERSION[x.os]),
    category: x.c,
    description: x.d,
    aliases: x.a ?? [],
    path: x.p,
    steps: x.st.map(text => ({ text })),
    tips: x.tip ?? null,
    related_slugs: x.r ?? [],
    keywords: x.k ?? [],
    difficulty: x.df ?? 'beginner',
    minutes: x.m ?? 2,
    is_published: true,
    updated_at: '2026-07-09',
  };
}
