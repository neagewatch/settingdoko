-- ========================================
-- 設定どこ？ DB Schema
-- ========================================

-- OS一覧マスタ
CREATE TABLE os_list (
  id TEXT PRIMARY KEY,           -- 'windows11', 'ios', 'macos', 'android' etc.
  name TEXT NOT NULL,            -- 'Windows 11', 'iPhone (iOS)', 'macOS'
  icon TEXT,                     -- emoji or icon identifier
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- カテゴリマスタ
CREATE TABLE categories (
  id TEXT PRIMARY KEY,           -- 'network', 'display', 'privacy' etc.
  name TEXT NOT NULL,            -- 'ネットワーク', 'ディスプレイ'
  icon TEXT,
  sort_order INT DEFAULT 0
);

-- 設定データ（メインテーブル）
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,                        -- 「拡張子を表示する」
  slug TEXT NOT NULL,                         -- URL用スラッグ
  os TEXT NOT NULL REFERENCES os_list(id),    -- 'windows11'
  version TEXT,                               -- '23H2' etc.
  category TEXT REFERENCES categories(id),    -- 'display'
  description TEXT,                           -- 概要説明
  aliases TEXT[] DEFAULT '{}',                -- 検索用エイリアス ['拡張子','ファイル名']
  path TEXT[] DEFAULT '{}',                   -- 設定導線 ['設定','システム','ディスプレイ']
  steps TEXT[] DEFAULT '{}',                  -- 手順 ['設定を開く','システムをクリック']
  tips TEXT,                                  -- 補足・注意点
  related_slugs TEXT[] DEFAULT '{}',          -- 関連設定のslug
  keywords TEXT[] DEFAULT '{}',               -- SEO/検索用キーワード
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, os)
);

-- 全文検索用インデックス
CREATE INDEX idx_settings_search ON settings
  USING GIN (to_tsvector('simple',
    title || ' ' ||
    COALESCE(description, '') || ' ' ||
    array_to_string(aliases, ' ') || ' ' ||
    array_to_string(keywords, ' ')
  ));

CREATE INDEX idx_settings_os ON settings(os);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_slug ON settings(slug);
CREATE INDEX idx_settings_published ON settings(is_published) WHERE is_published = TRUE;

-- 検索用RPC関数
CREATE OR REPLACE FUNCTION search_settings(search_query TEXT, os_filter TEXT DEFAULT NULL)
RETURNS SETOF settings AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM settings s
  WHERE s.is_published = TRUE
    AND (os_filter IS NULL OR s.os = os_filter)
    AND (
      s.title ILIKE '%' || search_query || '%'
      OR s.description ILIKE '%' || search_query || '%'
      OR EXISTS (SELECT 1 FROM unnest(s.aliases) a WHERE a ILIKE '%' || search_query || '%')
      OR EXISTS (SELECT 1 FROM unnest(s.keywords) k WHERE k ILIKE '%' || search_query || '%')
      OR EXISTS (SELECT 1 FROM unnest(s.path) p WHERE p ILIKE '%' || search_query || '%')
    )
  ORDER BY
    CASE WHEN s.title ILIKE '%' || search_query || '%' THEN 0 ELSE 1 END,
    s.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新トリガー
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
