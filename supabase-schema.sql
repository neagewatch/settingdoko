-- =============================================
-- 設定どこ？ - Supabase Schema (最新版)
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- settings テーブル
CREATE TABLE IF NOT EXISTS settings (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL,
  os            TEXT        NOT NULL CHECK (os IN ('windows11','ios','macos','android','windows10')),
  version       TEXT        NOT NULL DEFAULT '',
  category      TEXT        NOT NULL,
  aliases       TEXT[]      DEFAULT '{}',
  path          TEXT[]      DEFAULT '{}',
  steps         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  related_slugs TEXT[]      DEFAULT '{}',
  keywords      TEXT[]      DEFAULT '{}',
  description   TEXT        NOT NULL DEFAULT '',
  difficulty    TEXT        CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimate_minutes INTEGER,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  status        TEXT        NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  published_at  TIMESTAMPTZ,
  verified_at   TIMESTAMPTZ,
  editor_note   TEXT,
  source_url    TEXT,
  screenshot_url TEXT,
  device_scope  TEXT,
  impact        TEXT,
  rollback      TEXT,
  caution       TEXT,
  review_due_at TIMESTAMPTZ
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_settings_slug     ON settings(slug);
CREATE INDEX IF NOT EXISTS idx_settings_os       ON settings(os);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_unique_slug_os ON settings(slug, os);

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON settings;
DROP POLICY IF EXISTS "Authenticated insert"  ON settings;
DROP POLICY IF EXISTS "Authenticated update"  ON settings;
DROP POLICY IF EXISTS "Authenticated delete"  ON settings;
DROP POLICY IF EXISTS "Published settings are public" ON settings;

CREATE POLICY "Published settings are public" ON settings FOR SELECT USING (status = 'published');
REVOKE INSERT, UPDATE, DELETE ON settings FROM anon, authenticated;

-- screenshot_url カラム追加（既存テーブルへの追加）
ALTER TABLE settings ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- 公開フォーム・記事履歴（公開側はNext.jsのservice role経由で保存する）
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
REVOKE ALL ON content_requests FROM anon, authenticated;

-- ゼロヒット検索（Next.jsのservice role経由で保存）
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 120),
  normalized_query TEXT NOT NULL CHECK (char_length(normalized_query) BETWEEN 1 AND 120),
  os TEXT CHECK (os IS NULL OR os IN ('windows11','ios','macos','android','windows10')),
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count BETWEEN 0 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_zero_hit ON search_logs(result_count, normalized_query);
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON search_logs FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  comment TEXT NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON content_reports FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS setting_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  editor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_setting_revisions_setting_id ON setting_revisions(setting_id, created_at DESC);
ALTER TABLE setting_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON setting_revisions FROM anon, authenticated;

-- 公開側はsettingsを読み取り、サーバー側service_roleは運用データを管理する。
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON settings, content_requests, content_reports, setting_revisions, search_logs TO service_role;

-- 管理画面から設定ページ・手順ごとの画像を保存する公開バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('settings-images', 'settings-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];
