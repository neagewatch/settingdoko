-- ゼロヒット検索の集計用。Supabase SQL Editorで一度だけ実行してください。
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 120),
  normalized_query TEXT NOT NULL CHECK (char_length(normalized_query) BETWEEN 1 AND 120),
  os TEXT CHECK (os IS NULL OR os IN ('windows11','ios','macos','android','windows10')),
  result_count INTEGER NOT NULL DEFAULT 0 CHECK (result_count BETWEEN 0 AND 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_zero_hit ON public.search_logs(result_count, normalized_query);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.search_logs FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT ON public.search_logs TO service_role;
