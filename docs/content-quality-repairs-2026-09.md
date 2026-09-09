# 告知前コンテンツ修正の適用手順（2026-09）

この文書のSQLは準備用であり、この作業では実行していません。本番へ適用する場合は、Supabase のバックアップまたは PITR が利用できることを確認し、対象行をエクスポートしてから、SQLエディターで内容と件数を確認してください。

## 対象

- `disable-notifications-ios`（iOS）：Apple日本語公式の個別資料、対象環境、影響、戻し方、項目がない場合を登録する。
- `change-brightness-ios`（iOS）：Apple日本語公式の個別資料と対象環境、影響、戻し方、項目がない場合を登録する。
- `iphone-text-size`（iOS）：Apple日本語公式の個別資料と対象環境、影響、戻し方、項目がない場合を登録する。
- `disable-notifications-macos`（macOS）：Apple日本語公式の個別資料と対象環境、影響、戻し方、注意、項目がない場合を登録する。
- `trouble-android-notifications`（Android）：設定経路から「おやすみ時間」を外し、通知が表示される場合だけ長押しする条件を記録する。
- `change-text-size-ios`（iOS）：`iphone-text-size` を正規記事とし、旧URLは正規URLへ恒久リダイレクトする。
- `android-wave4-notification-history`（Android）：`android-notification-history` を正規記事とし、旧URLは正規URLへ恒久リダイレクトする。

この修正は `verified_at`、`verified_on_version`、公開状態、index状態を変更しません。公式資料を参照したことと、実機で確認したことは別なので、確認日を自動追加しないでください。

## 適用前の確認

1. `npm run export:production -- --out /tmp/settingdoko-production-settings.json --health-out /tmp/settingdoko-production-source-health.json` で本番スナップショットを取得する。
2. 対象slug・OSの行数がそれぞれ1件であること、既存の `verified_at` と `updated_at` を控える。
3. `supabase-upgrade-operations.sql` が適用済みで、`source_type`、`if_missing`、`device_scope` などの列が存在することを確認する。
4. 下記の `UPDATE` は、対象slugとOSを同時に指定し、`status = 'published'` の行だけを対象にする。件数が想定と違う場合は中断する。

## 適用SQL（未実行）

```sql
BEGIN;

UPDATE settings
SET
  source_url = 'https://support.apple.com/ja-jp/120681',
  source_type = 'OFFICIAL_SUPPORT',
  device_scope = 'iPhone（iOS 26を基準。アプリやiOSの版によって表示が異なる場合があります）',
  impact = '通知バナー・通知音・バッジなどが、選んだ範囲で表示されなくなります。',
  rollback = '設定 → アプリ → 対象アプリ → 通知を開き、「通知を許可」をオンに戻します。',
  caution = '通知を止めると、重要な連絡も見逃す可能性があります。全体ではなくアプリごとの変更を優先してください。',
  if_missing = '設定アプリ内で「通知」を検索してください。アプリ側に通知設定がある場合は、アプリ内の設定も確認します。'
WHERE slug = 'disable-notifications-ios' AND os = 'ios' AND status = 'published';

UPDATE settings
SET
  source_url = 'https://support.apple.com/ja-jp/109351',
  source_type = 'OFFICIAL_SUPPORT',
  device_scope = 'iPhone（iOS 26を基準。機種やiOSの版によって表示が異なる場合があります）',
  impact = '画面の明るさが変わります。自動調整や周囲の明るさによって見え方が変わる場合があります。',
  rollback = '同じ「画面表示と明るさ」を開き、明るさスライダーを元の位置へ戻します。',
  if_missing = '設定アプリ内で「明るさ」または「画面表示と明るさ」を検索してください。'
WHERE slug = 'change-brightness-ios' AND os = 'ios' AND status = 'published';

UPDATE settings
SET
  source_url = 'https://support.apple.com/ja-jp/102453',
  source_type = 'OFFICIAL_SUPPORT',
  device_scope = 'iPhone（iOS 26を基準。機種やiOSの版によって表示が異なる場合があります）',
  impact = '対応する画面の文字サイズが変わります。アプリによって反映範囲が異なる場合があります。',
  rollback = '同じ画面のスライダーを元の位置へ戻し、「さらに大きな文字」も必要に応じてオフにします。',
  if_missing = '設定アプリ内で「文字サイズ」または「テキストサイズ」を検索してください。'
WHERE slug = 'iphone-text-size' AND os = 'ios' AND status = 'published';

UPDATE settings
SET
  source_url = 'https://support.apple.com/ja-jp/guide/mac-help/mchl39cc046c/mac',
  source_type = 'OFFICIAL_SUPPORT',
  device_scope = 'Mac（macOS Tahoe 26を基準。アプリやmacOSの版によって表示が異なる場合があります）',
  impact = '通知を止めた範囲では、通知バナーや通知音などが表示されなくなります。',
  rollback = '同じ「通知」を開き、対象アプリの通知をオンに戻します。',
  caution = '通知を止めると、重要な連絡も見逃す可能性があります。全体ではなくアプリごとの変更を優先してください。',
  if_missing = 'システム設定内で「通知」を検索してください。アプリ側に通知設定がある場合は、アプリ内の設定も確認します。'
WHERE slug = 'disable-notifications-macos' AND os = 'macos' AND status = 'published';

UPDATE settings
SET
  path = ARRAY['設定', '通知', 'アプリの通知'],
  steps = jsonb_build_array(
    '設定→通知→アプリの通知で対象アプリをオンにする',
    'アプリ内の通知設定も確認する',
    'おやすみ時間・サイレントモード・省電力設定を確認する',
    '通知が1件でも表示される場合は、その通知を長押しして重要度や表示方法を確認する。一切表示されない場合はこの手順を飛ばす',
    'アプリとAndroidを更新してから再起動する'
  )
WHERE slug = 'trouble-android-notifications' AND os = 'android' AND status = 'published'
  AND path = ARRAY['設定', '通知', 'アプリの通知', 'おやすみ時間'];

COMMIT;
```

## URL統合

上記2件の旧slugはアプリ側の `canonicalSlug` で正規記事を解決し、正規記事が存在する場合に `/setting/{正規slug}?os={os}` へ `permanentRedirect` します。検索結果と内部リンクは正規slugを優先します。DB上の旧行を非公開・noindexへ変更する場合は、対象URL、被リンク、検索流入、復元用スナップショットを確認した後に別途実施してください。

## 関連リンク修正（未実行）

ローカル候補全1,861件を再点検し、関連リンク切れ30件を、同じ目的に近い既存記事へ置き換えました。DBへ反映する場合は、下記の対応表を使って対象slug・OSの行だけを更新してください。1つの記事に複数の修正があるため、1回の更新で配列内の該当値をすべて置き換えます。

```sql
BEGIN;

WITH repairs(slug, os, old_slug, new_slug) AS (
  VALUES
    ('connect-wifi-android', 'android', 'change-dns-android', 'trouble-android-internet'),
    ('connect-wifi-android', 'android', 'toggle-airplane-android', 'trouble13-unique-android-private-dns'),
    ('macos-zoom-accessibility', 'macos', 'macos-accessibility', 'macos-reduce-motion'),
    ('macos-file-sharing', 'macos', 'connect-wifi-macos', 'trouble-mac-wifi'),
    ('windows11-extra-startup-apps', 'windows11', 'speed-up-windows', 'trouble-win11-slow'),
    ('windows11-extra-wifi-password', 'windows11', 'connect-wifi-windows11', 'connect-wifi-windows'),
    ('windows11-extra-wifi-password', 'windows11', 'change-wifi-password', 'trouble9-win11-wifi-connect'),
    ('windows11-extra-metered-wifi', 'windows11', 'connect-wifi-windows11', 'connect-wifi-windows'),
    ('windows11-extra-public-private-network', 'windows11', 'setup-file-sharing', 'trouble-win11-network-share'),
    ('windows11-extra-mobile-hotspot', 'windows11', 'connect-wifi-windows11', 'connect-wifi-windows'),
    ('windows11-extra-screen-sleep', 'windows11', 'prevent-sleep-windows', 'change-sleep-time'),
    ('windows11-extra-defender-quick-scan', 'windows11', 'windows-protection-history', 'win11-protection-history'),
    ('windows11-extra-ransomware-protection', 'windows11', 'windows-file-history', 'win11-file-history'),
    ('windows11-extra-firewall-profile', 'windows11', 'windows-protection-history', 'win11-protection-history'),
    ('trouble-iphone-black-screen', 'ios', 'iphone-restart', 'trouble-iphone-not-charging'),
    ('trouble-iphone-face-id', 'ios', 'iphone-face-id', 'setup-faceid'),
    ('trouble-iphone-camera', 'ios', 'allow-camera-ios', 'trouble10-cross-camera-ios'),
    ('trouble-iphone-app', 'ios', 'iphone-storage', 'trouble-iphone-storage'),
    ('trouble-android-internet', 'android', 'android-connect-wifi', 'connect-wifi-android'),
    ('trouble-android-bluetooth', 'android', 'android-connect-bluetooth', 'connect-bluetooth-android'),
    ('trouble-android-power', 'android', 'android-battery-saver', 'battery-saver-android'),
    ('trouble-mac-wifi', 'macos', 'macos-connect-wifi', 'trouble-mac-wifi-reset'),
    ('trouble-mac-wont-start', 'macos', 'macos-safe-mode', 'trouble2-mac-startup'),
    ('trouble-mac-bluetooth-audio', 'macos', 'macos-connect-bluetooth', 'connect-bluetooth-macos'),
    ('trouble-iphone-notifications', 'ios', 'iphone-notifications', 'iphone-notification-summary'),
    ('trouble-iphone-battery-drain', 'ios', 'iphone-low-power', 'battery-save-ios'),
    ('trouble5-win11-app-install-remove', 'windows11', 'trouble2-win11-storage-full', 'trouble-win11-storage-full'),
    ('trouble5-iphone-no-sound', 'ios', 'trouble-iphone-no-sound', 'iphone-notification-sounds'),
    ('trouble5-android-usb-file-transfer', 'android', 'trouble-win11-usb', 'trouble-win11-usb-not-recognized'),
    ('trouble5-mac-camera', 'macos', 'trouble2-mac-external-display', 'macos-camera-permission')
)
UPDATE settings AS s
SET related_slugs = (
  SELECT ARRAY_AGG(
    COALESCE((
      SELECT r.new_slug
      FROM repairs AS r
      WHERE r.slug = s.slug AND r.os = s.os AND r.old_slug = link.value
      LIMIT 1
    ), link.value)
    ORDER BY link.ordinality
  )
  FROM unnest(s.related_slugs) WITH ORDINALITY AS link(value, ordinality)
)
WHERE s.status = 'published'
  AND EXISTS (
    SELECT 1
    FROM repairs AS r
    WHERE r.slug = s.slug AND r.os = s.os AND r.old_slug = ANY(s.related_slugs)
  );

COMMIT;
```

適用前に対象件数と置換後のslugが全て存在することを確認し、適用後は `related_slugs` を再取得して関連リンク切れが0件になったことを確認します。

## 適用後とロールバック

適用後に対象5行を再取得し、URL、対象環境、本文、経路、確認日が意図せず変わっていないことを確認します。続けて `npm run audit:content -- --input /path/to/settings.json --strict` と、対象URLのリンク確認を行います。

戻す場合は、適用前に取得した対象行のスナップショットから、対象slugとOSを指定して元の値を復元します。スナップショットがない状態で推測した値へ戻す更新や、対象を広げた一括更新は行いません。
