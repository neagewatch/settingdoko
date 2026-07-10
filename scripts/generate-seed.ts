// TSデータからSupabaseシードSQLを生成する
import { writeFileSync } from 'fs';
import { ALL_SETTINGS } from '../src/lib/data/index';

const esc = (s: string) => s.replace(/'/g, "''");
const arr = (a: string[]) => `ARRAY[${a.map(x => `'${esc(x)}'`).join(',')}]::text[]`;

const rows = ALL_SETTINGS.map(s => {
  const steps = JSON.stringify(s.steps).replace(/'/g, "''");
  return `('${esc(s.title)}','${s.slug}','${s.os}','${s.os_type}',` +
    `${s.version ? `'${esc(s.version)}'` : 'NULL'},` +
    `${s.category ? `'${s.category}'` : 'NULL'},` +
    `${s.description ? `'${esc(s.description)}'` : 'NULL'},` +
    `${s.aliases.length ? arr(s.aliases) : `ARRAY[]::text[]`},` +
    `${arr(s.path)},'${steps}'::jsonb,` +
    `${s.tips ? `'${esc(s.tips)}'` : 'NULL'},` +
    `${s.related_slugs.length ? arr(s.related_slugs) : `ARRAY[]::text[]`},` +
    `${s.keywords.length ? arr(s.keywords) : `ARRAY[]::text[]`},` +
    `'${s.difficulty}',${s.minutes},true)`;
});

const sql = `-- 設定どこ？ v3 シードデータ（自動生成 / ${ALL_SETTINGS.length}件）
-- 既存データを全て置き換える場合は先に TRUNCATE を実行:
-- TRUNCATE public.settings;

INSERT INTO public.settings
  (title, slug, os, os_type, version, category, description, aliases, path, steps, tips, related_slugs, keywords, difficulty, minutes, is_published)
VALUES
${rows.join(',\n')}
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  os = EXCLUDED.os,
  os_type = EXCLUDED.os_type,
  version = EXCLUDED.version,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  aliases = EXCLUDED.aliases,
  path = EXCLUDED.path,
  steps = EXCLUDED.steps,
  tips = EXCLUDED.tips,
  related_slugs = EXCLUDED.related_slugs,
  keywords = EXCLUDED.keywords,
  difficulty = EXCLUDED.difficulty,
  minutes = EXCLUDED.minutes,
  updated_at = now();
`;

writeFileSync('supabase/seed_v3.sql', sql);
console.log(`Generated: ${ALL_SETTINGS.length} rows`);
