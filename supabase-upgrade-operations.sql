-- ==============================================
-- 設定どこ？ 運用機能アップグレード
-- Supabase Dashboard > SQL Editor で一度だけ実行
-- 既存の記事・画像・管理画面データは削除しません
-- ==============================================

-- 記事運用: 下書き・公開・検証日・管理者メモ
ALTER TABLE settings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'published'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS editor_note TEXT;
CREATE INDEX IF NOT EXISTS idx_settings_status ON settings(status);

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
CREATE POLICY "Anyone can submit content requests" ON content_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read content requests" ON content_requests FOR SELECT USING (auth.role() = 'authenticated');

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
CREATE POLICY "Authenticated users can manage revisions" ON setting_revisions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 実行後の確認
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('settings','content_requests','setting_revisions');
