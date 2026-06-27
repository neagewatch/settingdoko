-- ==============================================
-- 設定どこ？ - macOS & iOS 追加データ
-- 28件
-- ==============================================

INSERT INTO settings
  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)
VALUES
  -- 1. AirDropで写真やファイルを共有する (macos)
  ('AirDropで写真やファイルを共有する','airdrop-macos','macos','Sonoma','network','beginner',2,ARRAY['AirDrop','エアドロ','ファイル共有','写真送る','近くの人に送る'],ARRAY['Finder','AirDrop'],ARRAY['Finderを開き左サイドバーの「AirDrop」をクリック','「検出可能な相手」で「全員」または「連絡先のみ」を選択','共有したいファイルを右クリック→「共有」→「AirDrop」','送り先のデバイスを選択して送信'],ARRAY['connect-bluetooth-macos'],ARRAY['AirDrop','共有','ファイル','写真','ワイヤレス','送信'],'AirDropを使ってMacから近くのiPhoneやMacへファイルを送る方法です。'),
  -- 2. Time Machineでバックアップを取る (macos)
  ('Time Machineでバックアップを取る','time-machine-macos','macos','Sonoma','storage','beginner',5,ARRAY['Time Machine','バックアップ','自動バックアップ','外付けHDDバックアップ','タイムマシン'],ARRAY['システム設定','一般','Time Machine'],ARRAY['外付けディスクをMacに接続する','システム設定 → 「一般」→「Time Machine」をクリック','「バックアップディスクを追加…」をクリック','接続した外付けディスクを選択','バックアップが自動で開始される'],ARRAY['check-storage-macos'],ARRAY['Time Machine','バックアップ','外付け','復元','保存','自動'],'Time Machineを使って自動的にMacのバックアップを取る方法です。'),
  -- 3. FileVaultでディスクを暗号化する (macos)
  ('FileVaultでディスクを暗号化する','filevault-macos','macos','Sonoma','security','intermediate',5,ARRAY['FileVault','ディスク暗号化','データ保護','FullDisk暗号化','セキュリティ強化'],ARRAY['システム設定','プライバシーとセキュリティ','FileVault'],ARRAY['システム設定を開く（Apple → システム設定）','「プライバシーとセキュリティ」をクリック','「FileVault」の「オンにする…」をクリック','リカバリーキーを安全な場所にメモする','Macが再起動して暗号化が開始される（数時間かかる場合あり）'],ARRAY['open-windows-security'],ARRAY['FileVault','暗号化','セキュリティ','データ保護','ディスク'],'FileVaultを有効にしてMacのディスクを暗号化し、データを守る方法です。'),
  -- 4. Handoffで作業を引き継ぐ (macos)
  ('Handoffで作業を引き継ぐ','handoff-macos','macos','Sonoma','system','beginner',3,ARRAY['Handoff','ハンドオフ','iPhoneと連携','作業引き継ぎ','Continuity'],ARRAY['システム設定','一般','AirPlayとHandoff'],ARRAY['システム設定 → 「一般」→「AirPlayとHandoff」をクリック','「Handoff」をオンにする','iPhone側でも設定 → 一般 → AirPlayとHandoffをオンにする','同じApple IDでiCloudにサインインしていることを確認','iPhoneで開いているページがMacのDockに表示される'],ARRAY['airdrop-macos'],ARRAY['Handoff','ハンドオフ','連携','iPhone','継続','Continuity'],'iPhoneとMacで作業を途切れなく引き継ぐHandoff機能の設定方法です。'),
  -- 5. スクリーンタイムを設定する (macos)
  ('スクリーンタイムを設定する','screen-time-macos','macos','Sonoma','system','beginner',3,ARRAY['スクリーンタイム','使用時間','アプリ制限','子供制限','使いすぎ防止'],ARRAY['システム設定','スクリーンタイム'],ARRAY['システム設定 → 「スクリーンタイム」をクリック','「オンにする」をクリック','「アプリの使用状況」でどのアプリをどれだけ使ったか確認','「App使用時間の制限」でアプリカテゴリごとに時間制限を設定'],ARRAY['screen-time-ios'],ARRAY['スクリーンタイム','使用時間','制限','アプリ','子供','管理'],'Macでスクリーンタイムを設定してアプリ使用時間を管理する方法です。'),
  -- 6. デフォルトブラウザを変更する (macos)
  ('デフォルトブラウザを変更する','change-default-browser-macos','macos','Sonoma','app','beginner',1,ARRAY['デフォルトブラウザ','Safari以外','Chrome設定','Firefox設定','ブラウザ変更'],ARRAY['システム設定','デスクトップとDock','デフォルトのWebブラウザ'],ARRAY['システム設定を開く','「デスクトップとDock」をクリック','下にスクロールして「デフォルトのWebブラウザ」を見つける','ドロップダウンから使いたいブラウザを選択'],ARRAY['change-default-app'],ARRAY['ブラウザ','デフォルト','Safari','Chrome','Firefox','変更'],'Safariから別のブラウザをデフォルトに変更する方法です。'),
  -- 7. 通知センターをカスタマイズする (macos)
  ('通知センターをカスタマイズする','notification-center-macos','macos','Sonoma','notification','beginner',3,ARRAY['通知センター','通知カスタマイズ','アプリ通知設定','バナー通知','通知スタイル'],ARRAY['システム設定','通知'],ARRAY['システム設定 → 「通知」をクリック','通知を変更したいアプリをクリック','「通知を許可」のオン/オフを切り替え','スタイル（バナー・ダイアログ）を選択','バッジ・サウンドのオン/オフも設定可能'],ARRAY['disable-notifications-macos'],ARRAY['通知','センター','バナー','バッジ','サウンド','カスタマイズ'],'アプリごとに通知の表示スタイルや音を細かく設定する方法です。'),
  -- 8. ファインダーの表示を変更する (macos)
  ('ファインダーの表示を変更する','finder-view-macos','macos','Sonoma','file','beginner',1,ARRAY['Finder表示','ファインダー','アイコン表示','リスト表示','カラム表示','ギャラリー'],ARRAY['Finder','表示メニュー'],ARRAY['Finderを開く（DockのFinderアイコンをクリック）','メニューバーの「表示」をクリック','「アイコン」「リスト」「カラム」「ギャラリー」から選択','またはツールバーのアイコンで切り替え可能','⌘+1〜4のショートカットも使える'],ARRAY['screenshot-macos'],ARRAY['Finder','ファインダー','表示','アイコン','リスト','カラム'],'Finderのファイル表示方法（アイコン/リスト/カラム/ギャラリー）を切り替える方法です。'),
  -- 9. Macをスリープしないようにする (macos)
  ('Macをスリープしないようにする','prevent-sleep-macos','macos','Sonoma','system','beginner',2,ARRAY['スリープしない','スリープ防止','スリープ設定','ディスプレイオフ','省電力'],ARRAY['システム設定','ロック画面'],ARRAY['システム設定を開く','「ロック画面」をクリック','「スクリーンセーバーを開始」の時間を変更','「ディスプレイをオフにする」の時間を「しない」に設定','バッテリー設定からも変更可能（MacBook の場合）'],ARRAY['change-brightness-macos'],ARRAY['スリープ','ディスプレイ','オフ','省電力','スクリーンセーバー','設定'],'Macが自動でスリープに入らないよう設定する方法です。'),
  -- 10. キーボードのショートカットをカスタマイズする (macos)
  ('キーボードのショートカットをカスタマイズする','custom-shortcuts-macos','macos','Sonoma','input','intermediate',5,ARRAY['ショートカットカスタマイズ','キーボード設定','ショートカット変更','ホットキー','キーバインド'],ARRAY['システム設定','キーボード','キーボードショートカット'],ARRAY['システム設定 → 「キーボード」をクリック','「キーボードショートカット…」をクリック','左メニューからカテゴリを選択','変更したいショートカットをダブルクリック','新しいキーの組み合わせを入力'],ARRAY['trackpad-gestures'],ARRAY['ショートカット','キーボード','カスタマイズ','ホットキー','キーバインド','設定'],'Macのキーボードショートカットを自分好みにカスタマイズする方法です。'),
  -- 11. iCloud Driveを設定する (macos)
  ('iCloud Driveを設定する','icloud-drive-macos','macos','Sonoma','storage','beginner',3,ARRAY['iCloud','クラウド同期','iCloud Drive','ファイル同期','バックアップ'],ARRAY['システム設定','Apple ID','iCloud','iCloud Drive'],ARRAY['システム設定 → 上部の Apple ID をクリック','「iCloud」をクリック','「iCloud Drive」をオンにする','「デスクトップと書類フォルダ」をオンにするとこれらも同期される'],ARRAY['time-machine-macos','check-storage-macos'],ARRAY['iCloud','Drive','同期','クラウド','Apple','ストレージ'],'iCloud Driveを有効にしてMacのファイルをクラウドに同期する方法です。'),
  -- 12. Macのパスワードを変更する (macos)
  ('Macのパスワードを変更する','change-password-macos','macos','Sonoma','security','beginner',3,ARRAY['パスワード変更','ログインパスワード','Macパスワード','ユーザーパスワード'],ARRAY['システム設定','ユーザーとグループ'],ARRAY['システム設定を開く','「ユーザーとグループ」をクリック','自分のアカウントをクリック','「パスワードを変更…」をクリック','現在のパスワードと新しいパスワードを入力'],ARRAY['filevault-macos'],ARRAY['パスワード','変更','ログイン','セキュリティ','アカウント'],'Macのログインパスワードを変更する方法です。'),
  -- 13. Wi-Fiのパスワードを確認する (macos)
  ('Wi-Fiのパスワードを確認する','check-wifi-password-macos','macos','Sonoma','network','beginner',2,ARRAY['Wi-Fiパスワード確認','WiFiパスワード忘れた','ネットワークパスワード','キーチェーン'],ARRAY['システム設定','Wi-Fi','詳細'],ARRAY['システム設定 → 「Wi-Fi」をクリック','接続中のネットワーク名の右の「詳細…」をクリック','「パスワード」フィールドの目のアイコンをクリック','Touch IDまたはパスワードで認証するとパスワードが表示される'],ARRAY['connect-wifi-windows'],ARRAY['Wi-Fi','パスワード','確認','キーチェーン','ネットワーク','忘れた'],'接続中のWi-Fiのパスワードを確認する方法です。'),
  -- 14. Macのストレージを最適化する (macos)
  ('Macのストレージを最適化する','optimize-storage-macos','macos','Sonoma','storage','beginner',3,ARRAY['ストレージ最適化','容量節約','自動削除','最適化','容量不足'],ARRAY['システム設定','一般','ストレージ'],ARRAY['システム設定 → 「一般」→「ストレージ」をクリック','「最適化…」をクリック','「最適化されたストレージ」をオンにする','「ゴミ箱を自動的に空にする」もオンにすると便利','大きなファイルは一覧で確認して削除可能'],ARRAY['check-storage-macos','icloud-drive-macos'],ARRAY['ストレージ','最適化','容量','節約','自動削除','整理'],'Macのストレージを最適化して空き容量を増やす方法です。'),
  -- 15. AirDropで写真やファイルを共有する (ios)
  ('AirDropで写真やファイルを共有する','airdrop-ios','ios','17','network','beginner',2,ARRAY['AirDrop','エアドロ','写真送る','ファイル共有','近くに送る'],ARRAY['設定','一般','AirDropと集中モード'],ARRAY['共有したいファイル・写真を開く','共有ボタン（四角に上矢印）をタップ','「AirDrop」をタップ','受け取り相手のデバイス名をタップ','相手が「受け入れる」をタップすると送信完了'],ARRAY['connect-bluetooth-ios','airdrop-macos'],ARRAY['AirDrop','共有','写真','ファイル','ワイヤレス','送信'],'AirDropを使ってiPhoneから近くのデバイスへ写真やファイルを送る方法です。'),
  -- 16. バッテリー残量を％で表示する (ios)
  ('バッテリー残量を％で表示する','battery-percentage-ios','ios','17','display','beginner',1,ARRAY['バッテリー%表示','充電残量','電池残量','パーセント表示','バッテリー数値'],ARRAY['設定','バッテリー','バッテリー残量（%）'],ARRAY['「設定」アプリを開く','「バッテリー」をタップ','「バッテリー残量（%）」のスイッチをオンにする'],ARRAY['battery-save-ios'],ARRAY['バッテリー','パーセント','残量','電池','表示','%'],'iPhoneのステータスバーにバッテリー残量を数値で表示する方法です。'),
  -- 17. 低電力モードをオンにする (ios)
  ('低電力モードをオンにする','battery-save-ios','ios','17','system','beginner',1,ARRAY['低電力モード','省電力','バッテリー節約','充電持ち','電池長持ち'],ARRAY['設定','バッテリー','低電力モード'],ARRAY['「設定」アプリを開く','「バッテリー」をタップ','「低電力モード」をオンにする','またはコントロールセンターから素早くオン/オフ可能'],ARRAY['battery-percentage-ios'],ARRAY['低電力','省電力','バッテリー','節約','長持ち','充電'],'低電力モードをオンにしてiPhoneのバッテリーを長持ちさせる方法です。'),
  -- 18. iCloudのバックアップを設定する (ios)
  ('iCloudのバックアップを設定する','icloud-backup-ios','ios','17','storage','beginner',3,ARRAY['iCloudバックアップ','自動バックアップ','データ保存','機種変対策','バックアップ設定'],ARRAY['設定','Apple ID（名前）','iCloud','iCloudバックアップ'],ARRAY['「設定」アプリを開く','一番上のApple ID（名前）をタップ','「iCloud」をタップ','「iCloudバックアップ」をタップ','「iCloudバックアップ」をオンにする','「今すぐバックアップを作成」で即時バックアップも可能'],ARRAY['check-storage-ios','icloud-drive-macos'],ARRAY['iCloud','バックアップ','自動','保存','機種変','データ'],'iCloudへの自動バックアップを設定してデータを安全に保存する方法です。'),
  -- 19. Siriを設定する (ios)
  ('Siriを設定する','setup-siri-ios','ios','17','system','beginner',2,ARRAY['Siri設定','ヘイSiri','音声アシスタント','Siriオン','Siri有効'],ARRAY['設定','Siriと検索'],ARRAY['「設定」アプリを開く','「Siriと検索」をタップ','「『ねえ、Siri』を聞き取る」をオンにする','「Siriの言語」と「Siriの声」を設定','サイドボタンでSiriをオンにする設定も可能'],ARRAY['screen-time-ios'],ARRAY['Siri','音声','アシスタント','ヘイSiri','設定','有効'],'SiriをオンにしてiPhoneの音声アシスタントを使えるようにする方法です。'),
  -- 20. 集中モード（フォーカス）を設定する (ios)
  ('集中モード（フォーカス）を設定する','focus-mode-ios','ios','17','notification','intermediate',5,ARRAY['集中モード','フォーカス','おやすみモード','仕事モード','通知ブロック'],ARRAY['設定','集中モード'],ARRAY['「設定」アプリを開く','「集中モード」をタップ','使いたいモード（仕事・個人・睡眠など）をタップ','「許可された通知」で通知する人・アプリを選択','スケジュールを設定して自動的に有効化することも可能'],ARRAY['disable-notifications-ios','focus-assist'],ARRAY['集中モード','フォーカス','おやすみ','通知','ブロック','仕事'],'集中モードで特定の時間帯に通知をブロックして集中できる環境を作る方法です。'),
  -- 21. コントロールセンターをカスタマイズする (ios)
  ('コントロールセンターをカスタマイズする','control-center-ios','ios','17','system','beginner',3,ARRAY['コントロールセンター','コンパネ','コントロール追加','クイック設定','上スワイプ'],ARRAY['設定','コントロールセンター'],ARRAY['「設定」アプリを開く','「コントロールセンター」をタップ','「コントロールを追加」から使いたい機能をタップして追加','「含まれているコントロール」の左の「−」で削除','三本線をドラッグして順番を変更'],ARRAY['battery-save-ios'],ARRAY['コントロールセンター','カスタマイズ','追加','削除','クイック','設定'],'コントロールセンターに表示するボタンを追加・削除・並べ替えする方法です。'),
  -- 22. アプリのアクセス権限をまとめて確認する (ios)
  ('アプリのアクセス権限をまとめて確認する','check-app-permissions-ios','ios','17','privacy','beginner',3,ARRAY['アプリ権限','プライバシー確認','アクセス許可','カメラ許可','マイク許可一覧'],ARRAY['設定','プライバシーとセキュリティ'],ARRAY['「設定」アプリを開く','「プライバシーとセキュリティ」をタップ','カメラ・マイク・写真・位置情報などをタップ','各機能にアクセスしているアプリの一覧が表示される','不要なアプリはオフに切り替え'],ARRAY['location-services-ios','allow-microphone-ios'],ARRAY['プライバシー','権限','アクセス','カメラ','マイク','位置情報','確認'],'アプリごとのプライバシー設定（カメラ・マイク・位置情報等）をまとめて確認・変更する方法です。'),
  -- 23. Wi-Fiのパスワードを確認する (ios)
  ('Wi-Fiのパスワードを確認する','check-wifi-password-ios','ios','17','network','beginner',2,ARRAY['Wi-Fiパスワード','WiFiパスワード確認','ネットワークパスワード','パスワード忘れた'],ARRAY['設定','Wi-Fi','ネットワーク名','パスワード'],ARRAY['「設定」アプリを開く','「Wi-Fi」をタップ','接続中のネットワーク名右の「ⓘ」をタップ','「パスワード」の行をタップ','Face IDまたはTouch IDで認証するとパスワードが表示される'],ARRAY['connect-wifi-ios'],ARRAY['Wi-Fi','パスワード','確認','ネットワーク','WiFi','忘れた'],'接続中のWi-Fiのパスワードを確認する方法です。'),
  -- 24. 写真のアルバムを整理する (ios)
  ('写真のアルバムを整理する','organize-photos-ios','ios','17','app','beginner',3,ARRAY['アルバム作成','写真整理','フォト','写真アプリ','アルバム追加'],ARRAY['写真アプリ','アルバム','新規アルバム'],ARRAY['「写真」アプリを開く','下の「アルバム」をタップ','右上の「＋」をタップ','「新規アルバム」をタップしてアルバム名を入力','追加する写真を選択して「完了」'],ARRAY['airdrop-ios','icloud-backup-ios'],ARRAY['写真','アルバム','整理','フォト','作成','追加'],'iPhoneの写真アプリでアルバムを作成して写真を整理する方法です。'),
  -- 25. 着信音・通知音を変更する (ios)
  ('着信音・通知音を変更する','change-ringtone-ios','ios','17','sound','beginner',2,ARRAY['着信音変更','着信音設定','通知音','サウンド','アラーム音','リングトーン'],ARRAY['設定','サウンドと触覚'],ARRAY['「設定」アプリを開く','「サウンドと触覚」をタップ','「着信音」をタップして好みの音を選択','「テキストトーン」では通知音を変更','「ボタンで変更」をオンにするとサイドボタンで音量調整できる'],ARRAY['disable-notifications-ios'],ARRAY['着信音','通知音','サウンド','変更','リングトーン','音'],'iPhoneの着信音や通知音を変更する方法です。'),
  -- 26. Appライブラリを使う (ios)
  ('Appライブラリを使う','app-library-ios','ios','17','app','beginner',2,ARRAY['Appライブラリ','アプリ整理','ホーム画面整理','アプリ一覧','自動整理'],ARRAY['ホーム画面','右端までスワイプ'],ARRAY['ホーム画面を一番右までスワイプ','すべてのアプリが自動的にカテゴリ別に整理されて表示される','上の検索ボックスでアプリ名を検索できる','アプリをホーム画面から削除してもここから使える'],ARRAY['control-center-ios'],ARRAY['Appライブラリ','アプリ','整理','ホーム画面','カテゴリ','一覧'],'Appライブラリで全アプリをカテゴリ別に整理して探す方法です。'),
  -- 27. 緊急SOSを設定する (ios)
  ('緊急SOSを設定する','emergency-sos-ios','ios','17','security','beginner',2,ARRAY['緊急SOS','緊急電話','SOS設定','緊急連絡先','安全機能'],ARRAY['設定','緊急SOS'],ARRAY['「設定」アプリを開く','「緊急SOS」をタップ','「サイドボタンを押し続けてSOSを発信」をオンにする','緊急連絡先は「ヘルスケア」アプリのメディカルIDで設定','使い方：サイドボタンと音量ボタンを同時に長押し'],ARRAY['setup-faceid'],ARRAY['緊急SOS','緊急','安全','SOS','救助','連絡先'],'緊急時にすばやく連絡できる緊急SOSの設定方法です。'),
  -- 28. ホーム画面をカスタマイズする (ios)
  ('ホーム画面をカスタマイズする','customize-homescreen-ios','ios','17','display','beginner',5,ARRAY['ホーム画面カスタマイズ','ウィジェット追加','アイコン並べ替え','壁紙変更','ホーム画面整理'],ARRAY['ホーム画面','長押し','ウィジェットを追加'],ARRAY['ホーム画面の何もない場所を長押しする','アプリが揺れた状態になる','「＋」ボタンでウィジェットを追加','アプリアイコンをドラッグして並べ替え','壁紙変更は「写真」アプリから写真を選んで「壁紙として使用」'],ARRAY['app-library-ios','control-center-ios'],ARRAY['ホーム画面','カスタマイズ','ウィジェット','壁紙','アイコン','整理'],'iPhoneのホーム画面にウィジェットを追加・アイコンを整理する方法です。')
ON CONFLICT (slug,os) DO UPDATE SET
  title=EXCLUDED.title,version=EXCLUDED.version,category=EXCLUDED.category,
  difficulty=EXCLUDED.difficulty,estimate_minutes=EXCLUDED.estimate_minutes,
  aliases=EXCLUDED.aliases,path=EXCLUDED.path,steps=EXCLUDED.steps,
  related_slugs=EXCLUDED.related_slugs,keywords=EXCLUDED.keywords,
  description=EXCLUDED.description,updated_at=NOW();

SELECT os, count(*) FROM settings GROUP BY os ORDER BY os;
