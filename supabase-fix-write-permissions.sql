-- 管理画面の下書き保存・公開状態変更に必要な権限
-- Supabase Dashboard > SQL Editor で一度だけ実行してください。

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.settings TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 管理画面のリクエスト・報告・履歴もサービスロールで管理できるようにする
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.content_requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.content_reports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.setting_revisions TO service_role;
