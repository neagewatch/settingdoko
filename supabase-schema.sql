-- =============================================
-- 設定どこ？ - Supabase Schema (最新版)
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- settings テーブル
CREATE TABLE IF NOT EXISTS settings (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT        NOT NULL CHECK (char_length(btrim(title)) > 0),
  slug          TEXT        NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  os            TEXT        NOT NULL CHECK (os IN ('windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams','chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive','zoom','slack','ipados','power_automate','acrobat')),
  version       TEXT        NOT NULL DEFAULT '',
  category      TEXT        NOT NULL,
  aliases       TEXT[]      DEFAULT '{}',
  path          TEXT[]      DEFAULT '{}',
  steps         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  related_slugs TEXT[]      DEFAULT '{}',
  keywords      TEXT[]      DEFAULT '{}',
  description   TEXT        NOT NULL DEFAULT '',
  view_count    INTEGER     NOT NULL DEFAULT 0,
  helpful_count INTEGER     NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  difficulty    TEXT        CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimate_minutes INTEGER,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  status        TEXT        NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  published_at  TIMESTAMPTZ,
  verified_at   TIMESTAMPTZ,
  editor_note   TEXT,
  source_url    TEXT CHECK (source_url IS NULL OR source_url ~ '^https://'),
  screenshot_url TEXT,
  device_scope  TEXT,
  impact        TEXT,
  rollback      TEXT,
  caution       TEXT,
  if_missing    TEXT,
  review_due_at TIMESTAMPTZ,
  content_type TEXT CHECK (content_type IS NULL OR content_type IN ('setting','troubleshooting','error_code')),
  workflow_status TEXT CHECK (workflow_status IS NULL OR workflow_status IN ('discovered','candidate','draft','source_attached','verified','published','archived')),
  index_status TEXT NOT NULL DEFAULT 'auto' CHECK (index_status IN ('auto','index','noindex')),
  source_type TEXT CHECK (source_type IS NULL OR source_type IN ('OFFICIAL_SUPPORT','OFFICIAL_DOCUMENTATION','OFFICIAL_VENDOR','DEVICE_MANUFACTURER','TRUSTED_SECONDARY','UNKNOWN')),
  verified_on_version TEXT,
  verified_from TEXT,
  verified_to TEXT,
  requires_reverification BOOLEAN NOT NULL DEFAULT FALSE
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
  os TEXT CHECK (os IS NULL OR os IN ('windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams','chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive','zoom','slack','ipados','power_automate','acrobat')),
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count BETWEEN 0 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_zero_hit ON search_logs(result_count, normalized_query);
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON search_logs FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS search_query_daily (
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  normalized_query TEXT NOT NULL CHECK (char_length(normalized_query) BETWEEN 1 AND 120),
  os TEXT NOT NULL DEFAULT '',
  sample_query TEXT NOT NULL CHECK (char_length(sample_query) BETWEEN 1 AND 120),
  searches INTEGER NOT NULL DEFAULT 0 CHECK (searches >= 0),
  zero_hits INTEGER NOT NULL DEFAULT 0 CHECK (zero_hits >= 0),
  weak_results INTEGER NOT NULL DEFAULT 0 CHECK (weak_results >= 0),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (day, normalized_query, os),
  CHECK (os = '' OR os IN ('windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams','chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive','zoom','slack','ipados','power_automate','acrobat'))
);
CREATE INDEX IF NOT EXISTS idx_search_query_daily_demand ON search_query_daily(zero_hits DESC, searches DESC, day DESC);
ALTER TABLE search_query_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON search_query_daily FROM anon, authenticated;

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

CREATE TABLE IF NOT EXISTS setting_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('helpful','not_helpful')),
  client_token_hash TEXT NOT NULL CHECK (char_length(client_token_hash) = 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(setting_id, client_token_hash)
);
CREATE INDEX IF NOT EXISTS idx_setting_feedback_aggregate ON setting_feedback(setting_id, vote);
ALTER TABLE setting_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON setting_feedback FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS content_candidates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  candidate_title TEXT NOT NULL CHECK (char_length(btrim(candidate_title)) BETWEEN 5 AND 160),
  platform TEXT, category TEXT,
  intent TEXT NOT NULL CHECK (char_length(btrim(intent)) BETWEEN 1 AND 200),
  discovery_source TEXT NOT NULL,
  demand_signal INTEGER NOT NULL DEFAULT 0 CHECK (demand_signal >= 0),
  existing_similar_guides TEXT[] NOT NULL DEFAULT '{}',
  official_source_candidate TEXT,
  priority INTEGER NOT NULL DEFAULT 0 CHECK (priority BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'discovered' CHECK (status IN ('discovered','candidate','draft','source_attached','verified','rejected','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, intent, discovery_source)
);
CREATE INDEX IF NOT EXISTS idx_content_candidates_queue ON content_candidates(status, priority DESC, demand_signal DESC);
ALTER TABLE content_candidates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON content_candidates FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS source_checks (
  source_url TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok','redirect','broken','blocked','invalid')),
  http_status INTEGER, final_url TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_source_checks_status ON source_checks(status, checked_at);
ALTER TABLE source_checks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON source_checks FROM anon, authenticated;

CREATE OR REPLACE FUNCTION record_search_query(input_query TEXT, input_normalized_query TEXT, input_os TEXT, input_result_count INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF char_length(input_query) NOT BETWEEN 1 AND 120 OR char_length(input_normalized_query) NOT BETWEEN 1 AND 120 OR input_result_count NOT BETWEEN 0 AND 50 THEN
    RAISE EXCEPTION 'invalid search event';
  END IF;
  INSERT INTO search_query_daily(day, normalized_query, os, sample_query, searches, zero_hits, weak_results, last_seen_at)
  VALUES (CURRENT_DATE, input_normalized_query, COALESCE(input_os, ''), input_query, 1,
    CASE WHEN input_result_count = 0 THEN 1 ELSE 0 END,
    CASE WHEN input_result_count BETWEEN 1 AND 3 THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (day, normalized_query, os) DO UPDATE SET
    sample_query = EXCLUDED.sample_query, searches = search_query_daily.searches + 1,
    zero_hits = search_query_daily.zero_hits + EXCLUDED.zero_hits,
    weak_results = search_query_daily.weak_results + EXCLUDED.weak_results, last_seen_at = NOW();
END;
$$;
REVOKE ALL ON FUNCTION record_search_query(TEXT,TEXT,TEXT,INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_search_query(TEXT,TEXT,TEXT,INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION record_setting_feedback(input_setting_id UUID, input_vote TEXT, input_token_hash TEXT)
RETURNS TABLE(helpful_count INTEGER, not_helpful_count INTEGER, recorded BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inserted_count INTEGER;
BEGIN
  IF input_vote NOT IN ('helpful','not_helpful') OR input_token_hash !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'invalid feedback'; END IF;
  INSERT INTO setting_feedback(setting_id, vote, client_token_hash)
  SELECT input_setting_id, input_vote, input_token_hash
  WHERE EXISTS (SELECT 1 FROM settings WHERE id = input_setting_id AND status = 'published')
  ON CONFLICT (setting_id, client_token_hash) DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 1 THEN
    UPDATE settings s SET
      helpful_count = s.helpful_count + CASE WHEN input_vote = 'helpful' THEN 1 ELSE 0 END,
      not_helpful_count = s.not_helpful_count + CASE WHEN input_vote = 'not_helpful' THEN 1 ELSE 0 END
    WHERE s.id = input_setting_id;
  END IF;
  RETURN QUERY SELECT s.helpful_count, s.not_helpful_count, inserted_count = 1 FROM settings s WHERE s.id = input_setting_id;
END;
$$;
REVOKE ALL ON FUNCTION record_setting_feedback(UUID,TEXT,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_setting_feedback(UUID,TEXT,TEXT) TO service_role;

-- 公開側はsettingsを読み取り、サーバー側service_roleは運用データを管理する。
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON settings, content_requests, content_reports, setting_revisions, search_logs, search_query_daily, setting_feedback, content_candidates, source_checks TO service_role;

-- 管理画面から設定ページ・手順ごとの画像を保存する公開バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('settings-images', 'settings-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];
