// scripts/generate-apple-sql.mjs
// node scripts/generate-apple-sql.mjs > supabase-seed-apple.sql

const appleSettings = [
  // ===== macOS =====
  { title:"AirDropで写真やファイルを共有する", slug:"airdrop-macos", os:"macos", version:"Sonoma", category:"network", difficulty:"beginner", estimate_minutes:2,
    aliases:["AirDrop","エアドロ","ファイル共有","写真送る","近くの人に送る"],
    path:["Finder","AirDrop"],
    steps:["Finderを開き左サイドバーの「AirDrop」をクリック","「検出可能な相手」で「全員」または「連絡先のみ」を選択","共有したいファイルを右クリック→「共有」→「AirDrop」","送り先のデバイスを選択して送信"],
    related_slugs:["connect-bluetooth-macos"],
    keywords:["AirDrop","共有","ファイル","写真","ワイヤレス","送信"],
    description:"AirDropを使ってMacから近くのiPhoneやMacへファイルを送る方法です。"},

  { title:"Time Machineでバックアップを取る", slug:"time-machine-macos", os:"macos", version:"Sonoma", category:"storage", difficulty:"beginner", estimate_minutes:5,
    aliases:["Time Machine","バックアップ","自動バックアップ","外付けHDDバックアップ","タイムマシン"],
    path:["システム設定","一般","Time Machine"],
    steps:["外付けディスクをMacに接続する","システム設定 → 「一般」→「Time Machine」をクリック","「バックアップディスクを追加…」をクリック","接続した外付けディスクを選択","バックアップが自動で開始される"],
    related_slugs:["check-storage-macos"],
    keywords:["Time Machine","バックアップ","外付け","復元","保存","自動"],
    description:"Time Machineを使って自動的にMacのバックアップを取る方法です。"},

  { title:"FileVaultでディスクを暗号化する", slug:"filevault-macos", os:"macos", version:"Sonoma", category:"security", difficulty:"intermediate", estimate_minutes:5,
    aliases:["FileVault","ディスク暗号化","データ保護","FullDisk暗号化","セキュリティ強化"],
    path:["システム設定","プライバシーとセキュリティ","FileVault"],
    steps:["システム設定を開く（Apple → システム設定）","「プライバシーとセキュリティ」をクリック","「FileVault」の「オンにする…」をクリック","リカバリーキーを安全な場所にメモする","Macが再起動して暗号化が開始される（数時間かかる場合あり）"],
    related_slugs:["open-windows-security"],
    keywords:["FileVault","暗号化","セキュリティ","データ保護","ディスク"],
    description:"FileVaultを有効にしてMacのディスクを暗号化し、データを守る方法です。"},

  { title:"Handoffで作業を引き継ぐ", slug:"handoff-macos", os:"macos", version:"Sonoma", category:"system", difficulty:"beginner", estimate_minutes:3,
    aliases:["Handoff","ハンドオフ","iPhoneと連携","作業引き継ぎ","Continuity"],
    path:["システム設定","一般","AirPlayとHandoff"],
    steps:["システム設定 → 「一般」→「AirPlayとHandoff」をクリック","「Handoff」をオンにする","iPhone側でも設定 → 一般 → AirPlayとHandoffをオンにする","同じApple IDでiCloudにサインインしていることを確認","iPhoneで開いているページがMacのDockに表示される"],
    related_slugs:["airdrop-macos"],
    keywords:["Handoff","ハンドオフ","連携","iPhone","継続","Continuity"],
    description:"iPhoneとMacで作業を途切れなく引き継ぐHandoff機能の設定方法です。"},

  { title:"スクリーンタイムを設定する", slug:"screen-time-macos", os:"macos", version:"Sonoma", category:"system", difficulty:"beginner", estimate_minutes:3,
    aliases:["スクリーンタイム","使用時間","アプリ制限","子供制限","使いすぎ防止"],
    path:["システム設定","スクリーンタイム"],
    steps:["システム設定 → 「スクリーンタイム」をクリック","「オンにする」をクリック","「アプリの使用状況」でどのアプリをどれだけ使ったか確認","「App使用時間の制限」でアプリカテゴリごとに時間制限を設定"],
    related_slugs:["screen-time-ios"],
    keywords:["スクリーンタイム","使用時間","制限","アプリ","子供","管理"],
    description:"Macでスクリーンタイムを設定してアプリ使用時間を管理する方法です。"},

  { title:"デフォルトブラウザを変更する", slug:"change-default-browser-macos", os:"macos", version:"Sonoma", category:"app", difficulty:"beginner", estimate_minutes:1,
    aliases:["デフォルトブラウザ","Safari以外","Chrome設定","Firefox設定","ブラウザ変更"],
    path:["システム設定","デスクトップとDock","デフォルトのWebブラウザ"],
    steps:["システム設定を開く","「デスクトップとDock」をクリック","下にスクロールして「デフォルトのWebブラウザ」を見つける","ドロップダウンから使いたいブラウザを選択"],
    related_slugs:["change-default-app"],
    keywords:["ブラウザ","デフォルト","Safari","Chrome","Firefox","変更"],
    description:"Safariから別のブラウザをデフォルトに変更する方法です。"},

  { title:"通知センターをカスタマイズする", slug:"notification-center-macos", os:"macos", version:"Sonoma", category:"notification", difficulty:"beginner", estimate_minutes:3,
    aliases:["通知センター","通知カスタマイズ","アプリ通知設定","バナー通知","通知スタイル"],
    path:["システム設定","通知"],
    steps:["システム設定 → 「通知」をクリック","通知を変更したいアプリをクリック","「通知を許可」のオン/オフを切り替え","スタイル（バナー・ダイアログ）を選択","バッジ・サウンドのオン/オフも設定可能"],
    related_slugs:["disable-notifications-macos"],
    keywords:["通知","センター","バナー","バッジ","サウンド","カスタマイズ"],
    description:"アプリごとに通知の表示スタイルや音を細かく設定する方法です。"},

  { title:"ファインダーの表示を変更する", slug:"finder-view-macos", os:"macos", version:"Sonoma", category:"file", difficulty:"beginner", estimate_minutes:1,
    aliases:["Finder表示","ファインダー","アイコン表示","リスト表示","カラム表示","ギャラリー"],
    path:["Finder","表示メニュー"],
    steps:["Finderを開く（DockのFinderアイコンをクリック）","メニューバーの「表示」をクリック","「アイコン」「リスト」「カラム」「ギャラリー」から選択","またはツールバーのアイコンで切り替え可能","⌘+1〜4のショートカットも使える"],
    related_slugs:["screenshot-macos"],
    keywords:["Finder","ファインダー","表示","アイコン","リスト","カラム"],
    description:"Finderのファイル表示方法（アイコン/リスト/カラム/ギャラリー）を切り替える方法です。"},

  { title:"Macをスリープしないようにする", slug:"prevent-sleep-macos", os:"macos", version:"Sonoma", category:"system", difficulty:"beginner", estimate_minutes:2,
    aliases:["スリープしない","スリープ防止","スリープ設定","ディスプレイオフ","省電力"],
    path:["システム設定","ロック画面"],
    steps:["システム設定を開く","「ロック画面」をクリック","「スクリーンセーバーを開始」の時間を変更","「ディスプレイをオフにする」の時間を「しない」に設定","バッテリー設定からも変更可能（MacBook の場合）"],
    related_slugs:["change-brightness-macos"],
    keywords:["スリープ","ディスプレイ","オフ","省電力","スクリーンセーバー","設定"],
    description:"Macが自動でスリープに入らないよう設定する方法です。"},

  { title:"キーボードのショートカットをカスタマイズする", slug:"custom-shortcuts-macos", os:"macos", version:"Sonoma", category:"input", difficulty:"intermediate", estimate_minutes:5,
    aliases:["ショートカットカスタマイズ","キーボード設定","ショートカット変更","ホットキー","キーバインド"],
    path:["システム設定","キーボード","キーボードショートカット"],
    steps:["システム設定 → 「キーボード」をクリック","「キーボードショートカット…」をクリック","左メニューからカテゴリを選択","変更したいショートカットをダブルクリック","新しいキーの組み合わせを入力"],
    related_slugs:["trackpad-gestures"],
    keywords:["ショートカット","キーボード","カスタマイズ","ホットキー","キーバインド","設定"],
    description:"Macのキーボードショートカットを自分好みにカスタマイズする方法です。"},

  { title:"iCloud Driveを設定する", slug:"icloud-drive-macos", os:"macos", version:"Sonoma", category:"storage", difficulty:"beginner", estimate_minutes:3,
    aliases:["iCloud","クラウド同期","iCloud Drive","ファイル同期","バックアップ"],
    path:["システム設定","Apple ID","iCloud","iCloud Drive"],
    steps:["システム設定 → 上部の Apple ID をクリック","「iCloud」をクリック","「iCloud Drive」をオンにする","「デスクトップと書類フォルダ」をオンにするとこれらも同期される"],
    related_slugs:["time-machine-macos","check-storage-macos"],
    keywords:["iCloud","Drive","同期","クラウド","Apple","ストレージ"],
    description:"iCloud Driveを有効にしてMacのファイルをクラウドに同期する方法です。"},

  { title:"Macのパスワードを変更する", slug:"change-password-macos", os:"macos", version:"Sonoma", category:"security", difficulty:"beginner", estimate_minutes:3,
    aliases:["パスワード変更","ログインパスワード","Macパスワード","ユーザーパスワード"],
    path:["システム設定","ユーザーとグループ"],
    steps:["システム設定を開く","「ユーザーとグループ」をクリック","自分のアカウントをクリック","「パスワードを変更…」をクリック","現在のパスワードと新しいパスワードを入力"],
    related_slugs:["filevault-macos"],
    keywords:["パスワード","変更","ログイン","セキュリティ","アカウント"],
    description:"Macのログインパスワードを変更する方法です。"},

  { title:"Wi-Fiのパスワードを確認する", slug:"check-wifi-password-macos", os:"macos", version:"Sonoma", category:"network", difficulty:"beginner", estimate_minutes:2,
    aliases:["Wi-Fiパスワード確認","WiFiパスワード忘れた","ネットワークパスワード","キーチェーン"],
    path:["システム設定","Wi-Fi","詳細"],
    steps:["システム設定 → 「Wi-Fi」をクリック","接続中のネットワーク名の右の「詳細…」をクリック","「パスワード」フィールドの目のアイコンをクリック","Touch IDまたはパスワードで認証するとパスワードが表示される"],
    related_slugs:["connect-wifi-windows"],
    keywords:["Wi-Fi","パスワード","確認","キーチェーン","ネットワーク","忘れた"],
    description:"接続中のWi-Fiのパスワードを確認する方法です。"},

  { title:"Macのストレージを最適化する", slug:"optimize-storage-macos", os:"macos", version:"Sonoma", category:"storage", difficulty:"beginner", estimate_minutes:3,
    aliases:["ストレージ最適化","容量節約","自動削除","最適化","容量不足"],
    path:["システム設定","一般","ストレージ"],
    steps:["システム設定 → 「一般」→「ストレージ」をクリック","「最適化…」をクリック","「最適化されたストレージ」をオンにする","「ゴミ箱を自動的に空にする」もオンにすると便利","大きなファイルは一覧で確認して削除可能"],
    related_slugs:["check-storage-macos","icloud-drive-macos"],
    keywords:["ストレージ","最適化","容量","節約","自動削除","整理"],
    description:"Macのストレージを最適化して空き容量を増やす方法です。"},

  // ===== iOS =====
  { title:"AirDropで写真やファイルを共有する", slug:"airdrop-ios", os:"ios", version:"17", category:"network", difficulty:"beginner", estimate_minutes:2,
    aliases:["AirDrop","エアドロ","写真送る","ファイル共有","近くに送る"],
    path:["設定","一般","AirDropと集中モード"],
    steps:["共有したいファイル・写真を開く","共有ボタン（四角に上矢印）をタップ","「AirDrop」をタップ","受け取り相手のデバイス名をタップ","相手が「受け入れる」をタップすると送信完了"],
    related_slugs:["connect-bluetooth-ios","airdrop-macos"],
    keywords:["AirDrop","共有","写真","ファイル","ワイヤレス","送信"],
    description:"AirDropを使ってiPhoneから近くのデバイスへ写真やファイルを送る方法です。"},

  { title:"バッテリー残量を％で表示する", slug:"battery-percentage-ios", os:"ios", version:"17", category:"display", difficulty:"beginner", estimate_minutes:1,
    aliases:["バッテリー%表示","充電残量","電池残量","パーセント表示","バッテリー数値"],
    path:["設定","バッテリー","バッテリー残量（%）"],
    steps:["「設定」アプリを開く","「バッテリー」をタップ","「バッテリー残量（%）」のスイッチをオンにする"],
    related_slugs:["battery-save-ios"],
    keywords:["バッテリー","パーセント","残量","電池","表示","%"],
    description:"iPhoneのステータスバーにバッテリー残量を数値で表示する方法です。"},

  { title:"低電力モードをオンにする", slug:"battery-save-ios", os:"ios", version:"17", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["低電力モード","省電力","バッテリー節約","充電持ち","電池長持ち"],
    path:["設定","バッテリー","低電力モード"],
    steps:["「設定」アプリを開く","「バッテリー」をタップ","「低電力モード」をオンにする","またはコントロールセンターから素早くオン/オフ可能"],
    related_slugs:["battery-percentage-ios"],
    keywords:["低電力","省電力","バッテリー","節約","長持ち","充電"],
    description:"低電力モードをオンにしてiPhoneのバッテリーを長持ちさせる方法です。"},

  { title:"iCloudのバックアップを設定する", slug:"icloud-backup-ios", os:"ios", version:"17", category:"storage", difficulty:"beginner", estimate_minutes:3,
    aliases:["iCloudバックアップ","自動バックアップ","データ保存","機種変対策","バックアップ設定"],
    path:["設定","Apple ID（名前）","iCloud","iCloudバックアップ"],
    steps:["「設定」アプリを開く","一番上のApple ID（名前）をタップ","「iCloud」をタップ","「iCloudバックアップ」をタップ","「iCloudバックアップ」をオンにする","「今すぐバックアップを作成」で即時バックアップも可能"],
    related_slugs:["check-storage-ios","icloud-drive-macos"],
    keywords:["iCloud","バックアップ","自動","保存","機種変","データ"],
    description:"iCloudへの自動バックアップを設定してデータを安全に保存する方法です。"},

  { title:"Siriを設定する", slug:"setup-siri-ios", os:"ios", version:"17", category:"system", difficulty:"beginner", estimate_minutes:2,
    aliases:["Siri設定","ヘイSiri","音声アシスタント","Siriオン","Siri有効"],
    path:["設定","Siriと検索"],
    steps:["「設定」アプリを開く","「Siriと検索」をタップ","「『ねえ、Siri』を聞き取る」をオンにする","「Siriの言語」と「Siriの声」を設定","サイドボタンでSiriをオンにする設定も可能"],
    related_slugs:["screen-time-ios"],
    keywords:["Siri","音声","アシスタント","ヘイSiri","設定","有効"],
    description:"SiriをオンにしてiPhoneの音声アシスタントを使えるようにする方法です。"},

  { title:"集中モード（フォーカス）を設定する", slug:"focus-mode-ios", os:"ios", version:"17", category:"notification", difficulty:"intermediate", estimate_minutes:5,
    aliases:["集中モード","フォーカス","おやすみモード","仕事モード","通知ブロック"],
    path:["設定","集中モード"],
    steps:["「設定」アプリを開く","「集中モード」をタップ","使いたいモード（仕事・個人・睡眠など）をタップ","「許可された通知」で通知する人・アプリを選択","スケジュールを設定して自動的に有効化することも可能"],
    related_slugs:["disable-notifications-ios","focus-assist"],
    keywords:["集中モード","フォーカス","おやすみ","通知","ブロック","仕事"],
    description:"集中モードで特定の時間帯に通知をブロックして集中できる環境を作る方法です。"},

  { title:"コントロールセンターをカスタマイズする", slug:"control-center-ios", os:"ios", version:"17", category:"system", difficulty:"beginner", estimate_minutes:3,
    aliases:["コントロールセンター","コンパネ","コントロール追加","クイック設定","上スワイプ"],
    path:["設定","コントロールセンター"],
    steps:["「設定」アプリを開く","「コントロールセンター」をタップ","「コントロールを追加」から使いたい機能をタップして追加","「含まれているコントロール」の左の「−」で削除","三本線をドラッグして順番を変更"],
    related_slugs:["battery-save-ios"],
    keywords:["コントロールセンター","カスタマイズ","追加","削除","クイック","設定"],
    description:"コントロールセンターに表示するボタンを追加・削除・並べ替えする方法です。"},

  { title:"アプリのアクセス権限をまとめて確認する", slug:"check-app-permissions-ios", os:"ios", version:"17", category:"privacy", difficulty:"beginner", estimate_minutes:3,
    aliases:["アプリ権限","プライバシー確認","アクセス許可","カメラ許可","マイク許可一覧"],
    path:["設定","プライバシーとセキュリティ"],
    steps:["「設定」アプリを開く","「プライバシーとセキュリティ」をタップ","カメラ・マイク・写真・位置情報などをタップ","各機能にアクセスしているアプリの一覧が表示される","不要なアプリはオフに切り替え"],
    related_slugs:["location-services-ios","allow-microphone-ios"],
    keywords:["プライバシー","権限","アクセス","カメラ","マイク","位置情報","確認"],
    description:"アプリごとのプライバシー設定（カメラ・マイク・位置情報等）をまとめて確認・変更する方法です。"},

  { title:"Wi-Fiのパスワードを確認する", slug:"check-wifi-password-ios", os:"ios", version:"17", category:"network", difficulty:"beginner", estimate_minutes:2,
    aliases:["Wi-Fiパスワード","WiFiパスワード確認","ネットワークパスワード","パスワード忘れた"],
    path:["設定","Wi-Fi","ネットワーク名","パスワード"],
    steps:["「設定」アプリを開く","「Wi-Fi」をタップ","接続中のネットワーク名右の「ⓘ」をタップ","「パスワード」の行をタップ","Face IDまたはTouch IDで認証するとパスワードが表示される"],
    related_slugs:["connect-wifi-ios"],
    keywords:["Wi-Fi","パスワード","確認","ネットワーク","WiFi","忘れた"],
    description:"接続中のWi-Fiのパスワードを確認する方法です。"},

  { title:"写真のアルバムを整理する", slug:"organize-photos-ios", os:"ios", version:"17", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["アルバム作成","写真整理","フォト","写真アプリ","アルバム追加"],
    path:["写真アプリ","アルバム","新規アルバム"],
    steps:["「写真」アプリを開く","下の「アルバム」をタップ","右上の「＋」をタップ","「新規アルバム」をタップしてアルバム名を入力","追加する写真を選択して「完了」"],
    related_slugs:["airdrop-ios","icloud-backup-ios"],
    keywords:["写真","アルバム","整理","フォト","作成","追加"],
    description:"iPhoneの写真アプリでアルバムを作成して写真を整理する方法です。"},

  { title:"着信音・通知音を変更する", slug:"change-ringtone-ios", os:"ios", version:"17", category:"sound", difficulty:"beginner", estimate_minutes:2,
    aliases:["着信音変更","着信音設定","通知音","サウンド","アラーム音","リングトーン"],
    path:["設定","サウンドと触覚"],
    steps:["「設定」アプリを開く","「サウンドと触覚」をタップ","「着信音」をタップして好みの音を選択","「テキストトーン」では通知音を変更","「ボタンで変更」をオンにするとサイドボタンで音量調整できる"],
    related_slugs:["disable-notifications-ios"],
    keywords:["着信音","通知音","サウンド","変更","リングトーン","音"],
    description:"iPhoneの着信音や通知音を変更する方法です。"},

  { title:"Appライブラリを使う", slug:"app-library-ios", os:"ios", version:"17", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["Appライブラリ","アプリ整理","ホーム画面整理","アプリ一覧","自動整理"],
    path:["ホーム画面","右端までスワイプ"],
    steps:["ホーム画面を一番右までスワイプ","すべてのアプリが自動的にカテゴリ別に整理されて表示される","上の検索ボックスでアプリ名を検索できる","アプリをホーム画面から削除してもここから使える"],
    related_slugs:["control-center-ios"],
    keywords:["Appライブラリ","アプリ","整理","ホーム画面","カテゴリ","一覧"],
    description:"Appライブラリで全アプリをカテゴリ別に整理して探す方法です。"},

  { title:"緊急SOSを設定する", slug:"emergency-sos-ios", os:"ios", version:"17", category:"security", difficulty:"beginner", estimate_minutes:2,
    aliases:["緊急SOS","緊急電話","SOS設定","緊急連絡先","安全機能"],
    path:["設定","緊急SOS"],
    steps:["「設定」アプリを開く","「緊急SOS」をタップ","「サイドボタンを押し続けてSOSを発信」をオンにする","緊急連絡先は「ヘルスケア」アプリのメディカルIDで設定","使い方：サイドボタンと音量ボタンを同時に長押し"],
    related_slugs:["setup-faceid"],
    keywords:["緊急SOS","緊急","安全","SOS","救助","連絡先"],
    description:"緊急時にすばやく連絡できる緊急SOSの設定方法です。"},

  { title:"ホーム画面をカスタマイズする", slug:"customize-homescreen-ios", os:"ios", version:"17", category:"display", difficulty:"beginner", estimate_minutes:5,
    aliases:["ホーム画面カスタマイズ","ウィジェット追加","アイコン並べ替え","壁紙変更","ホーム画面整理"],
    path:["ホーム画面","長押し","ウィジェットを追加"],
    steps:["ホーム画面の何もない場所を長押しする","アプリが揺れた状態になる","「＋」ボタンでウィジェットを追加","アプリアイコンをドラッグして並べ替え","壁紙変更は「写真」アプリから写真を選んで「壁紙として使用」"],
    related_slugs:["app-library-ios","control-center-ios"],
    keywords:["ホーム画面","カスタマイズ","ウィジェット","壁紙","アイコン","整理"],
    description:"iPhoneのホーム画面にウィジェットを追加・アイコンを整理する方法です。"},
];

function pgArr(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(s => `'${s.replace(/'/g,"''")}'`).join(",") + "]";
}
function pgStr(s) { return s ? `'${s.replace(/'/g,"''")}'` : "NULL"; }

console.log("-- ==============================================");
console.log("-- 設定どこ？ - macOS & iOS 追加データ");
console.log(`-- ${appleSettings.length}件`);
console.log("-- ==============================================\n");
console.log("INSERT INTO settings");
console.log("  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)");
console.log("VALUES");

const rows = appleSettings.map((s,i) =>
  `  -- ${i+1}. ${s.title} (${s.os})\n  (${pgStr(s.title)},${pgStr(s.slug)},${pgStr(s.os)},${pgStr(s.version)},${pgStr(s.category)},${pgStr(s.difficulty)},${s.estimate_minutes||"NULL"},${pgArr(s.aliases)},${pgArr(s.path)},${pgArr(s.steps)},${pgArr(s.related_slugs)},${pgArr(s.keywords)},${pgStr(s.description)})`
);

console.log(rows.join(",\n"));
console.log("ON CONFLICT (slug,os) DO UPDATE SET");
console.log("  title=EXCLUDED.title,version=EXCLUDED.version,category=EXCLUDED.category,");
console.log("  difficulty=EXCLUDED.difficulty,estimate_minutes=EXCLUDED.estimate_minutes,");
console.log("  aliases=EXCLUDED.aliases,path=EXCLUDED.path,steps=EXCLUDED.steps,");
console.log("  related_slugs=EXCLUDED.related_slugs,keywords=EXCLUDED.keywords,");
console.log("  description=EXCLUDED.description,updated_at=NOW();");
console.log("\nSELECT os, count(*) FROM settings GROUP BY os ORDER BY os;");
