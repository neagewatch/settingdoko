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
  steps         TEXT[]      DEFAULT '{}',
  related_slugs TEXT[]      DEFAULT '{}',
  keywords      TEXT[]      DEFAULT '{}',
  description   TEXT        NOT NULL DEFAULT '',
  difficulty    TEXT        CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimate_minutes INTEGER,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
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

CREATE POLICY "Public read access"  ON settings FOR SELECT USING (true);
CREATE POLICY "Authenticated insert" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON settings FOR DELETE USING (auth.role() = 'authenticated');

-- screenshot_url カラム追加（既存テーブルへの追加）
ALTER TABLE settings ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
