-- ==============================================
-- 設定どこ？ - Microsoft 365 / Teams / Outlook / Excel 追加データ
-- Supabase SQL Editor で実行してください（既存データは削除しません）
-- ==============================================

INSERT INTO settings
  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)
VALUES
  ('Teamsの通知を設定する','teams-notifications','windows11','Microsoft Teams','app','beginner',2,
   ARRAY['Teams通知','Teamsうるさい','Teams通知オフ','チームス通知','Teamsバナー'],
   ARRAY['Microsoft Teams','プロフィール画像','設定','通知とアクティビティ'],
   ARRAY['Teams右上のプロフィール画像の横にある「…」をクリック','「設定」を開く','「通知とアクティビティ」を選択','チャット・メンション・会議などの通知を必要に応じて変更','必要なら「すべての通知をミュート」をオンにする'],
   ARRAY['disable-notifications','allow-microphone','allow-camera'],
   ARRAY['Teams','通知','ミュート','バナー','会議','チャット','メンション'],
   'Microsoft Teamsのチャット・メンション・会議通知を調整する方法です。'),

  ('TeamsをWindows起動時に自動起動しない','disable-teams-autostart','windows11','Microsoft Teams','app','beginner',2,
   ARRAY['Teams自動起動オフ','Teams勝手に起動','Teams起動しない','Teamsスタートアップ'],
   ARRAY['Microsoft Teams','プロフィール画像','設定','一般','システム'],
   ARRAY['Teams右上のプロフィール画像の横にある「…」をクリック','「設定」→「一般」を開く','「Teamsを自動的に起動する」をオフにする','必要に応じてバックグラウンドで実行する設定もオフにする','Teamsを再起動して反映を確認する'],
   ARRAY['manage-startup-apps','teams-notifications'],
   ARRAY['Teams','自動起動','スタートアップ','勝手に起動','バックグラウンド'],
   'Windows起動時にMicrosoft Teamsが自動で開かないようにする方法です。'),

  ('Teamsのカメラとマイクを確認する','teams-camera-microphone','windows11','Microsoft Teams','app','beginner',3,
   ARRAY['Teamsカメラ映らない','Teamsマイク使えない','Teams会議音声','Teamsデバイス設定'],
   ARRAY['Microsoft Teams','プロフィール画像','設定','デバイス'],
   ARRAY['Teamsで「…」→「設定」→「デバイス」を開く','スピーカー・マイク・カメラが正しい機器になっているか確認','「テスト通話を開始」で音声を確認','カメラが映らない場合はWindowsのカメラ許可も確認','マイクが反応しない場合はWindowsのマイク許可も確認'],
   ARRAY['allow-microphone','allow-camera','adjust-microphone-volume'],
   ARRAY['Teams','カメラ','マイク','会議','デバイス','テスト通話'],
   'Teams会議で使うカメラ・マイク・スピーカーを確認する方法です。'),

  ('新しいOutlookの通知をオン・オフする','outlook-new-notifications','windows11','新しい Outlook','app','beginner',2,
   ARRAY['Outlook通知','メール通知オフ','Outlookポップアップ','新しいOutlook通知'],
   ARRAY['新しい Outlook','表示','表示の設定','全般','通知'],
   ARRAY['新しいOutlookを開く','「表示」→「表示の設定」を開く','「全般」→「通知」を選択','メール・予定表・ドキュメントの通知をオンまたはオフにする','通知が届かない場合はWindowsの「システム」→「通知」も確認する'],
   ARRAY['disable-notifications','teams-notifications'],
   ARRAY['Outlook','通知','メール','ポップアップ','新しいOutlook','予定表'],
   '新しいOutlook for Windowsでメールや予定表の通知を設定する方法です。'),

  ('クラシックOutlookのデスクトップ通知を設定する','outlook-desktop-alert','windows11','Outlook Classic','app','beginner',2,
   ARRAY['Outlookデスクトップ通知','Outlookポップアップ','メール受信通知','Outlookアラート'],
   ARRAY['Outlook','ファイル','オプション','メール','メッセージの受信'],
   ARRAY['クラシックOutlookを開く','「ファイル」→「オプション」を開く','左側の「メール」を選択','「メッセージの受信」にある「デスクトップ通知を表示する」をオンまたはオフにする','「OK」で保存する'],
   ARRAY['outlook-new-notifications','disable-notifications'],
   ARRAY['Outlook','デスクトップ通知','メール','ポップアップ','クラシックOutlook'],
   'クラシックOutlookのメール受信時デスクトップ通知を設定する方法です。'),

  ('Outlookの予定表リマインダーを変更する','outlook-calendar-reminder','windows11','Outlook','app','beginner',2,
   ARRAY['Outlookリマインダー','予定表通知','会議通知','予定通知時間'],
   ARRAY['Outlook','予定表','予定または会議を開く','リマインダー'],
   ARRAY['Outlookで予定表を開く','変更したい予定または会議を開く','「リマインダー」の時間を選ぶ','不要な場合は「なし」を選択','保存して閉じる'],
   ARRAY['outlook-new-notifications','teams-notifications'],
   ARRAY['Outlook','予定表','リマインダー','会議','通知','アラーム'],
   'Outlookの予定・会議のリマインダー通知時間を変更する方法です。'),

  ('Excelの自動保存をオンにする','excel-autosave','windows11','Excel for Microsoft 365','app','beginner',2,
   ARRAY['Excel自動保存','Excel保存忘れ','Excelオートセーブ','Excel上書き保存'],
   ARRAY['Excel','ファイル','オプション','保存'],
   ARRAY['Excelで対象のファイルを開く','OneDriveまたはSharePointにファイルを保存する','ウィンドウ左上の「自動保存」スイッチをオンにする','既定の保存間隔は「ファイル」→「オプション」→「保存」で確認する','共有ファイルでは意図しない変更も保存されるため必要に応じてバージョン履歴を確認する'],
   ARRAY['setup-onedrive'],
   ARRAY['Excel','自動保存','AutoSave','保存','OneDrive','SharePoint'],
   'Excelの自動保存を有効にして保存忘れを防ぐ方法です。'),

  ('Excelの計算方法を自動に戻す','excel-calculation-mode','windows11','Excel','app','intermediate',2,
   ARRAY['Excel計算されない','Excel数式更新されない','Excel再計算','Excel手動計算'],
   ARRAY['Excel','数式','計算方法の設定','自動'],
   ARRAY['Excelで「数式」タブを開く','「計算方法の設定」を選択','「自動」を選択する','必要に応じてF9キーで再計算する','大きなブックでは再計算に時間がかかることを確認する'],
   ARRAY[],
   ARRAY['Excel','計算','数式','再計算','F9','手動計算'],
   'Excelの数式が更新されない場合に、計算方法を自動へ戻す方法です。'),

  ('Excelの既定保存形式を変更する','excel-default-file-format','windows11','Excel','app','beginner',2,
   ARRAY['Excel保存形式','ExcelCSV保存','Excelデフォルト拡張子','Excelファイル形式'],
   ARRAY['Excel','ファイル','オプション','保存','この形式でファイルを保存'],
   ARRAY['Excelで「ファイル」→「オプション」を開く','左側の「保存」を選択','「この形式でファイルを保存」の一覧を開く','必要な形式（Excelブック、CSVなど）を選択','「OK」で保存する'],
   ARRAY['show-file-extensions'],
   ARRAY['Excel','保存形式','CSV','xlsx','拡張子','既定'],
   'Excelで新規ファイルを保存する際の既定ファイル形式を変更する方法です。'),

  ('OneDriveのファイルオンデマンドを設定する','onedrive-files-on-demand','windows11','OneDrive','file','beginner',2,
   ARRAY['OneDrive容量不足','OneDriveファイルオンデマンド','OneDriveローカル容量','OneDrive雲マーク'],
   ARRAY['タスクバー','OneDriveの雲アイコン','設定','同期とバックアップ','詳細設定'],
   ARRAY['タスクバーのOneDrive雲アイコンをクリック','「設定」を開く','「同期とバックアップ」→「詳細設定」を開く','「ファイルをオンデマンド」をオンにする','必要なファイルだけ右クリックして「このデバイス上で常に保持する」を選択する'],
   ARRAY['setup-onedrive','check-disk-storage'],
   ARRAY['OneDrive','ファイルオンデマンド','容量','クラウド','同期','空き容量'],
   'OneDriveのファイルオンデマンドを使い、PCの空き容量を節約する方法です。')
ON CONFLICT (slug,os) DO UPDATE SET
  title=EXCLUDED.title, version=EXCLUDED.version, category=EXCLUDED.category,
  difficulty=EXCLUDED.difficulty, estimate_minutes=EXCLUDED.estimate_minutes,
  aliases=EXCLUDED.aliases, path=EXCLUDED.path, steps=EXCLUDED.steps,
  related_slugs=EXCLUDED.related_slugs, keywords=EXCLUDED.keywords,
  description=EXCLUDED.description, updated_at=NOW();

SELECT os, count(*) FROM settings GROUP BY os ORDER BY os;
