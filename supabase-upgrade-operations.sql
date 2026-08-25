-- ==============================================
-- 設定どこ？ 運用機能アップグレード
-- Supabase Dashboard > SQL Editor で一度だけ実行
-- 既存の記事・画像・管理画面データは削除しません
-- ==============================================

BEGIN;

-- 記事運用: 下書き・公開・検証日・管理者メモ
-- 旧スキーマとの互換性
ALTER TABLE settings ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS estimate_minutes INTEGER;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS helpful_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
CREATE INDEX IF NOT EXISTS idx_settings_slug ON settings(slug);
CREATE INDEX IF NOT EXISTS idx_settings_os ON settings(os);
-- 既存の下書きを含めて重複がない場合だけ、slug×OS制約へ安全に移行する。
-- 重複があれば移行全体を止めず、旧slug制約を残して監査・整理を先に行う。
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM settings GROUP BY slug, os HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'slug/os duplicates exist; keeping the previous slug constraint and skipping idx_settings_unique_slug_os';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_unique_slug_os ON settings(slug, os);
    ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_slug_key;
  END IF;
END $$;

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
)) NOT VALID;

-- 検索ログも同じプラットフォーム一覧を受け付ける。
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 120),
  normalized_query TEXT NOT NULL CHECK (char_length(normalized_query) BETWEEN 1 AND 120),
  os TEXT,
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count BETWEEN 0 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 旧版のsearch_logsが先に作られていた環境でも、検索ログAPIが
-- normalized_query/osを参照できるよう列を補完する。既存行は削除しない。
ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS normalized_query TEXT;
ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS result_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE search_logs SET normalized_query = LOWER(BTRIM(query)) WHERE normalized_query IS NULL OR BTRIM(normalized_query) = '';
ALTER TABLE search_logs ALTER COLUMN normalized_query SET DEFAULT '';
ALTER TABLE search_logs DROP CONSTRAINT IF EXISTS search_logs_os_check;
ALTER TABLE search_logs ADD CONSTRAINT search_logs_os_check CHECK (os IS NULL OR os IN (
  'windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams',
  'chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive',
  'zoom','slack','ipados','power_automate','acrobat'
)) NOT VALID;
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
ALTER TABLE settings ADD COLUMN IF NOT EXISTS if_missing TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS review_due_at TIMESTAMPTZ;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS content_type TEXT
  CHECK (content_type IS NULL OR content_type IN ('setting','troubleshooting','error_code'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS workflow_status TEXT
  CHECK (workflow_status IS NULL OR workflow_status IN ('discovered','candidate','draft','source_attached','verified','published','archived'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS index_status TEXT NOT NULL DEFAULT 'auto'
  CHECK (index_status IN ('auto','index','noindex'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS source_type TEXT
  CHECK (source_type IS NULL OR source_type IN (
    'OFFICIAL_SUPPORT','OFFICIAL_DOCUMENTATION','OFFICIAL_VENDOR','DEVICE_MANUFACTURER','TRUSTED_SECONDARY','UNKNOWN'
  ));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS verified_on_version TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS verified_from TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS verified_to TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS requires_reverification BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_settings_status ON settings(status);
CREATE INDEX IF NOT EXISTS idx_settings_workflow_status ON settings(workflow_status);
CREATE INDEX IF NOT EXISTS idx_settings_index_status ON settings(index_status);
CREATE INDEX IF NOT EXISTS idx_settings_review_queue ON settings(requires_reverification, review_due_at, verified_at);

-- 既存データに不備があっても移行自体は止めず、以後の書き込みだけを保護する。
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_title_not_blank') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_title_not_blank CHECK (char_length(btrim(title)) > 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_slug_format') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$') NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_source_url_format') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_source_url_format CHECK (source_url IS NULL OR source_url ~ '^https://') NOT VALID;
  END IF;
END $$;

-- 部分適用済みの環境でも、運用状態の値域を同じ制約で保護する。
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_content_type_check') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_content_type_check CHECK (content_type IS NULL OR content_type IN ('setting','troubleshooting','error_code')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_workflow_status_check') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_workflow_status_check CHECK (workflow_status IS NULL OR workflow_status IN ('discovered','candidate','draft','source_attached','verified','published','archived')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_index_status_check') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_index_status_check CHECK (index_status IN ('auto','index','noindex')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_source_type_check') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_source_type_check CHECK (source_type IS NULL OR source_type IN ('OFFICIAL_SUPPORT','OFFICIAL_DOCUMENTATION','OFFICIAL_VENDOR','DEVICE_MANUFACTURER','TRUSTED_SECONDARY','UNKNOWN')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'settings_feedback_counts_nonnegative') THEN
    ALTER TABLE settings ADD CONSTRAINT settings_feedback_counts_nonnegative CHECK (helpful_count >= 0 AND not_helpful_count >= 0) NOT VALID;
  END IF;
END $$;

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

-- 検索イベントは日次集計し、同一クエリの行を無期限に増やさない。
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
  CHECK (os = '' OR os IN (
    'windows11','ios','macos','android','windows10','word','excel','powerpoint','outlook','teams',
    'chrome','edge','firefox','safari','line','gmail','youtube','google_calendar','google_drive',
    'zoom','slack','ipados','power_automate','acrobat'
  ))
);
-- 部分適用済みの日次集計表にも不足列を追加する（既存の集計値は保持）。
ALTER TABLE search_query_daily ADD COLUMN IF NOT EXISTS sample_query TEXT;
ALTER TABLE search_query_daily ADD COLUMN IF NOT EXISTS searches INTEGER NOT NULL DEFAULT 0;
ALTER TABLE search_query_daily ADD COLUMN IF NOT EXISTS zero_hits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE search_query_daily ADD COLUMN IF NOT EXISTS weak_results INTEGER NOT NULL DEFAULT 0;
ALTER TABLE search_query_daily ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE search_query_daily SET sample_query = normalized_query WHERE sample_query IS NULL OR BTRIM(sample_query) = '';
ALTER TABLE search_query_daily ALTER COLUMN sample_query SET DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_search_query_daily_demand ON search_query_daily(zero_hits DESC, searches DESC, day DESC);
ALTER TABLE search_query_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON search_query_daily FROM anon, authenticated;

CREATE OR REPLACE FUNCTION record_search_query(
  input_query TEXT,
  input_normalized_query TEXT,
  input_os TEXT,
  input_result_count INTEGER
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF char_length(input_query) NOT BETWEEN 1 AND 120
    OR char_length(input_normalized_query) NOT BETWEEN 1 AND 120
    OR input_result_count NOT BETWEEN 0 AND 50 THEN
    RAISE EXCEPTION 'invalid search event';
  END IF;
  INSERT INTO search_query_daily(day, normalized_query, os, sample_query, searches, zero_hits, weak_results, last_seen_at)
  VALUES (CURRENT_DATE, input_normalized_query, COALESCE(input_os, ''), input_query, 1,
    CASE WHEN input_result_count = 0 THEN 1 ELSE 0 END,
    CASE WHEN input_result_count BETWEEN 1 AND 3 THEN 1 ELSE 0 END,
    NOW())
  ON CONFLICT (day, normalized_query, os) DO UPDATE SET
    sample_query = EXCLUDED.sample_query,
    searches = search_query_daily.searches + 1,
    zero_hits = search_query_daily.zero_hits + EXCLUDED.zero_hits,
    weak_results = search_query_daily.weak_results + EXCLUDED.weak_results,
    last_seen_at = NOW();
END;
$$;
REVOKE ALL ON FUNCTION record_search_query(TEXT,TEXT,TEXT,INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_search_query(TEXT,TEXT,TEXT,INTEGER) TO service_role;

-- 個人情報を持たない匿名トークンハッシュで、同一端末・記事の多重票を抑える。
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

CREATE OR REPLACE FUNCTION record_setting_feedback(
  input_setting_id UUID,
  input_vote TEXT,
  input_token_hash TEXT
) RETURNS TABLE(helpful_count INTEGER, not_helpful_count INTEGER, recorded BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inserted_count INTEGER;
BEGIN
  IF input_vote NOT IN ('helpful','not_helpful') OR input_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid feedback';
  END IF;
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
  RETURN QUERY SELECT s.helpful_count, s.not_helpful_count, inserted_count = 1
  FROM settings s WHERE s.id = input_setting_id;
END;
$$;
REVOKE ALL ON FUNCTION record_setting_feedback(UUID,TEXT,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_setting_feedback(UUID,TEXT,TEXT) TO service_role;

-- 発見と公開を分離する取得バックログ。候補からsettingsへは自動昇格させない。
CREATE TABLE IF NOT EXISTS content_candidates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  candidate_title TEXT NOT NULL CHECK (char_length(btrim(candidate_title)) BETWEEN 5 AND 160),
  platform TEXT,
  category TEXT,
  intent TEXT NOT NULL CHECK (char_length(btrim(intent)) BETWEEN 1 AND 200),
  discovery_source TEXT NOT NULL,
  demand_signal INTEGER NOT NULL DEFAULT 0 CHECK (demand_signal >= 0),
  existing_similar_guides TEXT[] NOT NULL DEFAULT '{}',
  official_source_candidate TEXT,
  priority INTEGER NOT NULL DEFAULT 0 CHECK (priority BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'discovered'
    CHECK (status IN ('discovered','candidate','draft','source_attached','verified','rejected','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, intent, discovery_source)
);
CREATE INDEX IF NOT EXISTS idx_content_candidates_queue ON content_candidates(status, priority DESC, demand_signal DESC);
ALTER TABLE content_candidates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON content_candidates FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS source_checks (
  source_url TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok','redirect','broken','blocked','invalid')),
  http_status INTEGER,
  final_url TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'source_checks_source_type_check') THEN
    ALTER TABLE source_checks ADD CONSTRAINT source_checks_source_type_check CHECK (source_type IN ('OFFICIAL_SUPPORT','OFFICIAL_DOCUMENTATION','OFFICIAL_VENDOR','DEVICE_MANUFACTURER','TRUSTED_SECONDARY','UNKNOWN','INVALID')) NOT VALID;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_source_checks_status ON source_checks(status, checked_at);
ALTER TABLE source_checks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON source_checks FROM anon, authenticated;

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
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.settings, public.content_requests, public.content_reports, public.setting_revisions, public.search_logs, public.search_query_daily, public.setting_feedback, public.content_candidates, public.source_checks TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 設定ページ・手順ごとの画像保存先（既存データは変更しない）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('settings-images', 'settings-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

COMMIT;

-- 実行後の確認
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
  'settings','content_requests','content_reports','setting_revisions','search_logs','search_query_daily',
  'setting_feedback','content_candidates','source_checks'
) ORDER BY table_name;
