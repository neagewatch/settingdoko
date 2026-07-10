-- ============================================
-- 設定どこ？ v3 マイグレーション
-- 既存のsettingsテーブルをv3スキーマに更新します
-- Supabase SQL Editor でこのファイル → seed_v3.sql の順に実行
-- ============================================

-- 1) テーブルが無い場合は新規作成
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  os text NOT NULL,
  version text,
  category text,
  description text,
  aliases text[] DEFAULT ARRAY[]::text[],
  path text[] DEFAULT ARRAY[]::text[],
  steps jsonb DEFAULT '[]'::jsonb,
  tips text,
  related_slugs text[] DEFAULT ARRAY[]::text[],
  keywords text[] DEFAULT ARRAY[]::text[],
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) v3で追加するカラム
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS os_type text DEFAULT 'os';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS minutes integer DEFAULT 2;

-- 3) steps が text[] の場合は jsonb（{text, image_url}の配列）へ変換
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='settings'
      AND column_name='steps' AND data_type='ARRAY'
  ) THEN
    ALTER TABLE public.settings
      ALTER COLUMN steps TYPE jsonb
      USING (
        SELECT COALESCE(
          jsonb_agg(jsonb_build_object('text', s)),
          '[]'::jsonb
        ) FROM unnest(steps) AS s
      );
  END IF;
END $$;

-- 4) slugはOS横断でユニーク（v3のURL設計 /setting/[slug] の前提）
--    重複がある場合は先に解消してから実行してください
--    重複確認: SELECT slug, count(*) FROM settings GROUP BY slug HAVING count(*) > 1;
DROP INDEX IF EXISTS settings_slug_os_key;
CREATE UNIQUE INDEX IF NOT EXISTS settings_slug_key ON public.settings (slug);

-- 5) 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_settings_os ON public.settings (os);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings (category);
CREATE INDEX IF NOT EXISTS idx_settings_published ON public.settings (is_published);

-- 6) 検索RPC（title/aliases/keywords/description/pathを対象にスコアリング）
CREATE OR REPLACE FUNCTION public.search_settings(search_query text, os_filter text DEFAULT NULL)
RETURNS SETOF public.settings
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.settings s
  WHERE s.is_published = true
    AND (os_filter IS NULL OR s.os = os_filter)
    AND (
      s.title ILIKE '%' || search_query || '%'
      OR s.description ILIKE '%' || search_query || '%'
      OR EXISTS (SELECT 1 FROM unnest(s.aliases) a WHERE a ILIKE '%' || search_query || '%')
      OR EXISTS (SELECT 1 FROM unnest(s.keywords) k WHERE k ILIKE '%' || search_query || '%')
      OR EXISTS (SELECT 1 FROM unnest(s.path) p WHERE p ILIKE '%' || search_query || '%')
    )
  ORDER BY
    CASE
      WHEN s.title ILIKE search_query THEN 0
      WHEN s.title ILIKE search_query || '%' THEN 1
      WHEN s.title ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    s.title;
$$;

-- 7) 権限（匿名読み取り）
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings
  FOR SELECT USING (is_published = true);
GRANT SELECT ON public.settings TO anon;
GRANT EXECUTE ON FUNCTION public.search_settings TO anon;
