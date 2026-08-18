-- Windows 11のサインイン重複を整理するSQL。
-- 基本記事 trouble6-win11-signin は残し、
-- trouble6 / trouble8 / trouble9 の同テーマ派生記事だけを削除します。
-- 基本記事が存在しない場合は、誤削除を防ぐため何も削除しません。

BEGIN;

CREATE TEMP TABLE signin_duplicates ON COMMIT DROP AS
SELECT id, slug
FROM public.settings
WHERE os = 'windows11'
  AND category = 'troubleshoot'
  AND (
    slug LIKE 'trouble6-win11-signin-%'
    OR slug LIKE 'trouble8-win11-signin-failed%'
    OR slug LIKE 'trouble9-win11-signin%'
  )
  AND slug <> 'trouble6-win11-signin'
  AND EXISTS (
    SELECT 1
    FROM public.settings AS keeper
    WHERE keeper.os = 'windows11'
      AND keeper.category = 'troubleshoot'
      AND keeper.slug = 'trouble6-win11-signin'
  );

-- 削除対象の確認結果をSQL Editorに表示します。
SELECT id, slug FROM signin_duplicates ORDER BY slug;

-- 関連リンクは基本記事へ付け替え、同じslugが二重にならないよう整理します。
UPDATE public.settings AS setting
SET related_slugs = ARRAY(
  SELECT DISTINCT CASE
    WHEN related.related_slug = ANY (SELECT slug FROM signin_duplicates)
      THEN 'trouble6-win11-signin'
    ELSE related.related_slug
  END
  FROM unnest(COALESCE(setting.related_slugs, ARRAY[]::text[])) AS related(related_slug)
)
WHERE EXISTS (
  SELECT 1
  FROM unnest(COALESCE(setting.related_slugs, ARRAY[]::text[])) AS related(related_slug)
  WHERE related.related_slug = ANY (SELECT slug FROM signin_duplicates)
);

DELETE FROM public.settings AS setting
USING signin_duplicates AS duplicate
WHERE setting.id = duplicate.id
RETURNING setting.id, setting.slug, setting.title, setting.status;

COMMIT;
