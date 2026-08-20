-- ==============================================
-- 設定どこ？ 運用機能アップグレード
-- Supabase Dashboard > SQL Editor で一度だけ実行
-- 既存の記事・画像・管理画面データは削除しません
-- ==============================================

-- 記事運用: 下書き・公開・検証日・管理者メモ
-- 旧スキーマとの互換性
ALTER TABLE settings ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS estimate_minutes INTEGER;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS helpful_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
CREATE INDEX IF NOT EXISTS idx_settings_slug ON settings(slug);
CREATE INDEX IF NOT EXISTS idx_settings_os ON settings(os);
-- 旧環境のslug単独UNIQUEは、同一テーマのOS別記事を妨げるため解除する。
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_unique_slug_os ON settings(slug, os);

-- アプリ・ブラウザの記事も保存できるよう、旧OS制約を置き換える。
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_os_check;
DO $$
DECLARE constraint_name TEXT;
BEGIN
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public' AND t.relname = 'settings' AND c.contype = 'c'
    AND c.conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = t.oid AND attname = 'os')]::smallint[]
  LIMIT 1;
  IF constraint_name IS NOT NULL THEN EXECUTE format('ALTER TABLE settings DROP CONSTRAINT %I', constraint_name); END IF;
END $$;
ALTER TABLE settings ADD CONSTRAINT settings_os_check CHECK (os IN (
  'windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams',
  'chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive',
  'zoom','slack','ipados','power_automate','acrobat'
));

-- 検索ログも同じプラットフォーム一覧を受け付ける。
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 120),
  normalized_query TEXT NOT NULL CHECK (char_length(normalized_query) BETWEEN 1 AND 120),
  os TEXT,
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count BETWEEN 0 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE search_logs DROP CONSTRAINT IF EXISTS search_logs_os_check;
ALTER TABLE search_logs ADD CONSTRAINT search_logs_os_check CHECK (os IS NULL OR os IN (
  'windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams',
  'chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive',
  'zoom','slack','ipados','power_automate','acrobat'
));
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_zero_hit ON search_logs(result_count, normalized_query);
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON search_logs FROM anon, authenticated;

ALTER TABLE settings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'published'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS editor_note TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS device_scope TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS impact TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS rollback TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS caution TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS review_due_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_settings_status ON settings(status);

-- 画像付き手順を保存できる形式へ移行（既存のTEXT[]はJSON配列として保持）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'settings'
      AND column_name = 'steps' AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE settings ALTER COLUMN steps TYPE JSONB USING to_jsonb(steps);
    ALTER TABLE settings ALTER COLUMN steps SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ユーザーの「この設定を探しています」リクエスト
CREATE TABLE IF NOT EXISTS content_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 120),
  os TEXT,
  note TEXT CHECK (char_length(note) <= 500),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_requests_created_at ON content_requests(created_at DESC);
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit content requests" ON content_requests;
DROP POLICY IF EXISTS "Authenticated users can read content requests" ON content_requests;
REVOKE ALL ON content_requests FROM anon, authenticated;

-- 記事の誤り・古さの報告（公開側から受け付け、管理画面で対応状態を管理）
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  title TEXT NOT NULL, comment TEXT NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit content reports" ON content_reports;
DROP POLICY IF EXISTS "Authenticated users can manage content reports" ON content_reports;
REVOKE ALL ON content_reports FROM anon, authenticated;

-- 記事履歴。管理画面の保存処理をサービスロール経由へ移行する際に利用します。
CREATE TABLE IF NOT EXISTS setting_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  editor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_setting_revisions_setting_id ON setting_revisions(setting_id, created_at DESC);
ALTER TABLE setting_revisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage revisions" ON setting_revisions;
REVOKE ALL ON setting_revisions FROM anon, authenticated;

-- 設定は公開済みだけ匿名読取。管理者操作はservice roleのみに限定する。
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON settings;
DROP POLICY IF EXISTS "Published settings are public" ON settings;
DROP POLICY IF EXISTS "Authenticated insert" ON settings;
DROP POLICY IF EXISTS "Authenticated update" ON settings;
DROP POLICY IF EXISTS "Authenticated delete" ON settings;
CREATE POLICY "Published settings are public" ON settings FOR SELECT USING (status = 'published');
REVOKE INSERT, UPDATE, DELETE ON settings FROM anon, authenticated;

-- Supabaseのサーバー側service_roleに、管理操作用の権限を付与する。
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON settings TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.settings, public.content_requests, public.content_reports, public.setting_revisions, public.search_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 設定ページ・手順ごとの画像保存先（既存データは変更しない）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('settings-images', 'settings-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 実行後の確認
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('settings','content_requests','content_reports','setting_revisions');
