-- =============================================
-- 設定どこ？ - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  os TEXT NOT NULL CHECK (os IN ('windows11', 'ios', 'macos', 'android', 'windows10')),
  version TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  path TEXT[] DEFAULT '{}',
  steps TEXT[] DEFAULT '{}',
  related_slugs TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_settings_slug ON settings(slug);
CREATE INDEX IF NOT EXISTS idx_settings_os ON settings(os);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_slug_os ON settings(slug, os);

-- Unique constraint: same slug + OS combination should be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_unique_slug_os ON settings(slug, os);

-- Full text search index (Japanese)
-- Note: For better Japanese search, consider pg_bigm extension
CREATE INDEX IF NOT EXISTS idx_settings_fts ON settings
  USING gin(to_tsvector('simple', title || ' ' || description));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON settings
  FOR SELECT USING (true);

-- Authenticated write access (for admin)
CREATE POLICY "Authenticated insert" ON settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete" ON settings
  FOR DELETE USING (auth.role() = 'authenticated');
