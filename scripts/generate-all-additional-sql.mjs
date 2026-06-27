// scripts/generate-all-additional-sql.mjs
// node scripts/generate-all-additional-sql.mjs > supabase-seed-all-additional.sql

const allAdditional = [
  // ============================================================
  // Windows 11 追加候補
  // ============================================================
  { title:"BitLockerでドライブを暗号化する", slug:"bitlocker-encryption", os:"windows11", version:"23H2", category:"security", difficulty:"intermediate", estimate_minutes:10,
    aliases:["BitLocker","ドライブ暗号化","Cドライブ暗号化","データ保護","ビットロッカー"],
    path:["設定","プライバシーとセキュリティ","デバイスの暗号化"],
    steps:["設定を開く（Win + I）","「プライバシーとセキュリティ」→「デバイスの暗号化」をクリック","「デバイスの暗号化」をオンにする","または検索で「BitLocker」→「BitLockerドライブ暗号化」→「BitLockerを有効にする」","回復キーをMicrosoftアカウント・USB・印刷のいずれかに保存する"],
    related_slugs:["enable-firewall","setup-lock-screen"],
    keywords:["BitLocker","暗号化","セキュリティ","ドライブ","データ保護"],
    description:"BitLockerを使ってドライブを暗号化しデータを保護する方法です。" },

  { title:"リモートデスクトップを設定する", slug:"setup-remote-desktop", os:"windows11", version:"23H2", category:"network", difficulty:"intermediate", estimate_minutes:5,
    aliases:["リモートデスクトップ","RDP","遠隔操作","リモート接続","Remote Desktop"],
    path:["設定","システム","リモートデスクトップ"],
    steps:["設定を開く（Win + I）","「システム」→「リモートデスクトップ」をクリック","「リモートデスクトップを有効にする」をオンにする","「確認する」をクリック","接続先のPCのIPアドレスを確認しておく（「このPCへの接続方法」に表示）"],
    related_slugs:["setup-vpn","connect-wifi-windows"],
    keywords:["リモートデスクトップ","RDP","遠隔","接続","Remote Desktop"],
    description:"リモートデスクトップを有効にして別のPCから遠隔操作できるようにする方法です。" },

  { title:"電源プランを変更する", slug:"change-power-plan", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:2,
    aliases:["電源プラン","高パフォーマンス","バランス","省電力","電源設定"],
    path:["コントロールパネル","電源オプション"],
    steps:["スタートメニューで「電源オプション」を検索して開く","「電源プランの選択またはカスタマイズ」画面が表示される","「バランス」「高パフォーマンス」「省電力」から選択","より細かい設定は「プラン設定の変更」から調整可能"],
    related_slugs:["change-sleep-time","disable-fast-startup"],
    keywords:["電源プラン","パフォーマンス","省電力","バランス","電源","設定"],
    description:"電源プランを変更してPCのパフォーマンスや省電力モードを切り替える方法です。" },

  { title:"プリンターを追加する", slug:"add-printer", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:5,
    aliases:["プリンター追加","プリンター設定","印刷できない","プリンター接続","ドライバ"],
    path:["設定","Bluetoothとデバイス","プリンターとスキャナー","デバイスの追加"],
    steps:["設定を開く（Win + I）","「Bluetoothとデバイス」→「プリンターとスキャナー」をクリック","「デバイスの追加」をクリック","検出されたプリンターを選択して追加","見つからない場合は「手動で追加」からIPアドレスやドライバーで追加"],
    related_slugs:[],
    keywords:["プリンター","印刷","追加","ドライバ","スキャナー","接続"],
    description:"Windowsにプリンターを追加して使えるようにする方法です。" },

  { title:"Windowsの表示言語を変更する", slug:"change-display-language", os:"windows11", version:"23H2", category:"system", difficulty:"intermediate", estimate_minutes:5,
    aliases:["言語変更","表示言語","英語化","日本語化","ロケール","UI言語"],
    path:["設定","時刻と言語","言語と地域"],
    steps:["設定を開く（Win + I）","「時刻と言語」→「言語と地域」をクリック","「言語を追加する」で希望の言語を追加","追加した言語の「…」→「言語オプション」をクリック","「Windowsの表示言語として設定する」を選択","サインアウトして再ログインすると反映される"],
    related_slugs:["add-keyboard-language"],
    keywords:["言語","表示言語","英語","日本語","ロケール","UI"],
    description:"Windowsのシステム表示言語（UI言語）を変更する方法です。" },

  { title:"コントロールパネルを開く", slug:"open-control-panel", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["コントロールパネル","旧設定","従来の設定","システム設定","クラシック設定"],
    path:["スタートメニュー","検索","コントロールパネル"],
    steps:["Windowsキーを押して「コントロールパネル」と入力","「コントロールパネル」アプリをクリック","または Win + R →「control」と入力してEnter"],
    related_slugs:["check-windows-version","add-printer"],
    keywords:["コントロールパネル","control","設定","クラシック","旧UI"],
    description:"従来のコントロールパネルを開く方法です。" },

  { title:"WSL（Windows Subsystem for Linux）を有効にする", slug:"enable-wsl", os:"windows11", version:"23H2", category:"system", difficulty:"advanced", estimate_minutes:10,
    aliases:["WSL","Linux","Ubuntu","Windows Subsystem for Linux","Linuxサブシステム","ターミナル"],
    path:["設定","オプション機能","Windowsのその他の機能","Linux用Windowsサブシステム"],
    steps:["管理者としてPowerShellを開く（スタートメニューで検索→管理者として実行）","「wsl --install」と入力してEnter","インストール完了後にPCを再起動","再起動後にUbuntuが自動で起動するのでユーザー名とパスワードを設定"],
    related_slugs:["open-cmd-admin"],
    keywords:["WSL","Linux","Ubuntu","サブシステム","ターミナル","開発"],
    description:"WSLを使ってWindows上でLinux環境を動かす方法です。" },

  { title:"スタートメニューにアプリをピン留めする", slug:"pin-to-start", os:"windows11", version:"23H2", category:"app", difficulty:"beginner", estimate_minutes:1,
    aliases:["ピン留め","スタートにピン留め","スタートメニュー追加","よく使うアプリ","クイックアクセス"],
    path:["スタートメニュー","アプリ右クリック","スタートにピン留めする"],
    steps:["スタートメニューを開く","「すべてのアプリ」からピン留めしたいアプリを見つける","アプリを右クリック","「スタートにピン留めする」をクリック"],
    related_slugs:["manage-startup-apps","install-from-store"],
    keywords:["ピン留め","スタートメニュー","ショートカット","アプリ","固定"],
    description:"よく使うアプリをスタートメニューにピン留めする方法です。" },

  { title:"音声入力（ディクテーション）を使う", slug:"use-voice-input", os:"windows11", version:"23H2", category:"input", difficulty:"beginner", estimate_minutes:2,
    aliases:["音声入力","ディクテーション","声で文字入力","音声認識","スピーチ"],
    path:["キーボードショートカット","Win + H"],
    steps:["テキストを入力したい場所（メモ帳・ブラウザなど）をクリックしてカーソルを置く","Win + H を押して音声入力パネルを起動","マイクアイコンをクリックして話しかける","話した言葉がテキストとして入力される"],
    related_slugs:["allow-microphone","adjust-microphone-volume"],
    keywords:["音声入力","ディクテーション","音声認識","マイク","Win+H","テキスト"],
    description:"Win+Hショートカットで音声をテキストに変換する音声入力機能の使い方です。" },

  { title:"拡大鏡を使う", slug:"use-magnifier", os:"windows11", version:"23H2", category:"accessibility", difficulty:"beginner", estimate_minutes:1,
    aliases:["拡大鏡","画面拡大","ズーム","虫眼鏡","見づらい","アクセシビリティ拡大"],
    path:["設定","アクセシビリティ","拡大鏡"],
    steps:["Win + 「＋」キーで拡大鏡を即起動（画面が拡大される）","Win + 「−」キーで縮小","Win + Escで終了","設定 → アクセシビリティ → 拡大鏡で詳細な設定が可能"],
    related_slugs:["change-text-size","change-display-scale","use-narrator"],
    keywords:["拡大鏡","ズーム","拡大","アクセシビリティ","虫眼鏡","見やすく"],
    description:"画面を拡大して見やすくする拡大鏡機能の使い方です。" },

  { title:"タッチキーボードを設定する", slug:"setup-touch-keyboard", os:"windows11", version:"23H2", category:"input", difficulty:"beginner", estimate_minutes:2,
    aliases:["タッチキーボード","スクリーンキーボード","仮想キーボード","OSK","オンスクリーンキーボード"],
    path:["タスクバー右クリック","タスクバーの設定","タッチキーボード"],
    steps:["タスクバーを右クリック","「タスクバーの設定」をクリック","「タッチキーボード」をオンにする","タスクバーにキーボードアイコンが表示されるのでクリック","または「スクリーンキーボード」を検索して起動"],
    related_slugs:["use-voice-input","add-keyboard-language"],
    keywords:["タッチキーボード","スクリーンキーボード","仮想","入力","OSK","タブレット"],
    description:"タッチキーボード（スクリーンキーボード）を表示する方法です。" },

  { title:"Hyper-Vを有効にする", slug:"enable-hyper-v", os:"windows11", version:"23H2", category:"system", difficulty:"advanced", estimate_minutes:5,
    aliases:["Hyper-V","仮想マシン","仮想化","VM","Virtual Machine","ハイパーバイザー"],
    path:["コントロールパネル","プログラム","Windowsの機能の有効化または無効化","Hyper-V"],
    steps:["コントロールパネルを開く","「プログラム」→「Windowsの機能の有効化または無効化」をクリック","「Hyper-V」にチェックを入れる","「OK」をクリック","PCを再起動する"],
    related_slugs:["enable-wsl","open-control-panel"],
    keywords:["Hyper-V","仮想マシン","VM","仮想化","仮想環境","Windows機能"],
    description:"Hyper-Vを有効にしてWindows上で仮想マシンを動かす方法です。" },

  { title:"レジストリエディタを開く", slug:"open-registry-editor", os:"windows11", version:"23H2", category:"system", difficulty:"advanced", estimate_minutes:1,
    aliases:["レジストリ","regedit","レジストリエディタ","Registry Editor","システムレジストリ"],
    path:["Win + R","regedit","Enter"],
    steps:["Win + R を押して「ファイル名を指定して実行」を開く","「regedit」と入力してEnter","「このアプリがデバイスに変更を加えることを許可しますか？」→「はい」をクリック","レジストリエディタが起動する","※変更は慎重に行うこと。変更前にバックアップを取ることを推奨"],
    related_slugs:["open-cmd-admin","open-control-panel"],
    keywords:["レジストリ","regedit","Registry","システム","詳細設定","上級者"],
    description:"レジストリエディタを開く方法です。操作には十分な知識が必要です。" },

  // ============================================================
  // iOS 追加候補
  // ============================================================
  { title:"パスコードを変更する", slug:"change-passcode-ios", os:"ios", version:"17", category:"security", difficulty:"beginner", estimate_minutes:2,
    aliases:["パスコード変更","パスコード設定","ロック解除コード","4桁パスコード","6桁パスコード"],
    path:["設定","Face IDとパスコード"],
    steps:["「設定」アプリを開く","「Face IDとパスコード」（または「Touch IDとパスコード」）をタップ","現在のパスコードを入力","「パスコードを変更」をタップ","現在のパスコードを入力してから新しいパスコードを2回入力"],
    related_slugs:["setup-faceid","setup-touchid"],
    keywords:["パスコード","変更","セキュリティ","ロック","認証","PIN"],
    description:"iPhoneのロック解除パスコードを変更する方法です。" },

  { title:"自動ロックの時間を変更する", slug:"auto-lock-ios", os:"ios", version:"17", category:"display", difficulty:"beginner", estimate_minutes:1,
    aliases:["自動ロック","スリープ","画面消える","ロックまでの時間","画面タイムアウト"],
    path:["設定","画面表示と明るさ","自動ロック"],
    steps:["「設定」アプリを開く","「画面表示と明るさ」をタップ","「自動ロック」をタップ","30秒・1分・2分・3分・4分・5分・しないから選択"],
    related_slugs:["change-brightness-ios","battery-save-ios"],
    keywords:["自動ロック","スリープ","タイムアウト","画面","消える","時間"],
    description:"iPhoneが自動でロックされるまでの時間を変更する方法です。" },

  { title:"Safariのプライベートブラウズをオンにする", slug:"safari-private-mode-ios", os:"ios", version:"17", category:"privacy", difficulty:"beginner", estimate_minutes:1,
    aliases:["プライベートブラウズ","シークレットモード","履歴に残らない","プライベートモード","Safari履歴"],
    path:["Safari","タブ","プライベート"],
    steps:["「Safari」アプリを開く","右下のタブアイコン（四角が重なったもの）をタップ","「X個のタブ」と表示されている部分を長押し、またはタップ","「プライベートを開く」をタップ","プライベートモードでは履歴・Cookieが保存されない"],
    related_slugs:["check-app-permissions-ios","location-services-ios"],
    keywords:["プライベート","Safari","シークレット","履歴","Cookie","ブラウズ"],
    description:"Safariのプライベートブラウズモードをオンにして閲覧履歴を残さない方法です。" },

  { title:"iPhoneを探す（Find My）を設定する", slug:"setup-find-my-ios", os:"ios", version:"17", category:"security", difficulty:"beginner", estimate_minutes:3,
    aliases:["iPhoneを探す","Find My","紛失モード","位置情報共有","デバイス追跡"],
    path:["設定","Apple ID（名前）","iCloud","iPhoneを探す"],
    steps:["「設定」アプリを開く","上部のApple ID（名前）をタップ","「iCloud」をタップ","「iPhoneを探す」をタップ","「iPhoneを探す」と「最後の位置情報を送信」をオンにする"],
    related_slugs:["icloud-backup-ios","location-services-ios"],
    keywords:["iPhoneを探す","Find My","紛失","盗難","位置情報","追跡"],
    description:"紛失・盗難時にiPhoneの場所を特定できる「iPhoneを探す」の設定方法です。" },

  { title:"メディカルIDを設定する", slug:"setup-medical-id-ios", os:"ios", version:"17", category:"security", difficulty:"beginner", estimate_minutes:5,
    aliases:["メディカルID","緊急医療情報","血液型","アレルギー","緊急連絡先","ヘルスケア"],
    path:["ヘルスケアアプリ","自分のデータ","メディカルID"],
    steps:["「ヘルスケア」アプリを開く","右下の「自分のデータ」タブをタップ","「メディカルID」をタップ","「メディカルIDを作成」または「編集」をタップ","血液型・アレルギー・内服薬・緊急連絡先などを入力","「緊急時に表示」をオンにするとロック画面から確認可能"],
    related_slugs:["emergency-sos-ios"],
    keywords:["メディカルID","緊急","医療情報","血液型","アレルギー","ヘルスケア"],
    description:"緊急時に医療情報を確認できるメディカルIDを設定する方法です。" },

  { title:"AssistiveTouchを有効にする", slug:"enable-assistivetouch-ios", os:"ios", version:"17", category:"accessibility", difficulty:"beginner", estimate_minutes:2,
    aliases:["AssistiveTouch","アシスティブタッチ","仮想ホームボタン","画面上ボタン","アクセシビリティ"],
    path:["設定","アクセシビリティ","タッチ","AssistiveTouch"],
    steps:["「設定」アプリを開く","「アクセシビリティ」をタップ","「タッチ」をタップ","「AssistiveTouch」をタップ","「AssistiveTouch」をオンにする","画面上に丸いボタンが表示される"],
    related_slugs:["change-text-size-ios"],
    keywords:["AssistiveTouch","アシスティブタッチ","ホームボタン","アクセシビリティ","タッチ"],
    description:"画面上に仮想ボタンを表示するAssistiveTouchを有効にする方法です。" },

  { title:"文字サイズを変更する", slug:"change-text-size-ios", os:"ios", version:"17", category:"accessibility", difficulty:"beginner", estimate_minutes:1,
    aliases:["文字サイズ","フォントサイズ","文字を大きく","テキストサイズ","見やすく"],
    path:["設定","画面表示と明るさ","テキストサイズを変更"],
    steps:["「設定」アプリを開く","「画面表示と明るさ」をタップ","「テキストサイズを変更」をタップ","スライダーで文字サイズを調整"],
    related_slugs:["enable-assistivetouch-ios"],
    keywords:["文字サイズ","テキスト","フォント","大きく","アクセシビリティ","見やすい"],
    description:"iPhoneの文字（テキスト）サイズを変更する方法です。" },

  { title:"テキスト置換（定型文）を設定する", slug:"text-replacement-ios", os:"ios", version:"17", category:"input", difficulty:"beginner", estimate_minutes:3,
    aliases:["テキスト置換","定型文","ショートカット入力","自動変換","よく使う文字"],
    path:["設定","一般","キーボード","テキスト置換"],
    steps:["「設定」アプリを開く","「一般」→「キーボード」をタップ","「テキスト置換」をタップ","右上の「＋」をタップ","「フレーズ」に展開したい文字列、「ショートカット」に入力する短い文字を入力"],
    related_slugs:["change-ime-settings"],
    keywords:["テキスト置換","定型文","ショートカット","自動変換","キーボード","入力"],
    description:"短い文字を入力すると自動で長い文字列に変換される定型文を設定する方法です。" },

  { title:"App Storeの自動アップデートをオフにする", slug:"disable-auto-update-ios", os:"ios", version:"17", category:"app", difficulty:"beginner", estimate_minutes:1,
    aliases:["自動アップデート","アプリ更新","自動更新オフ","App Store設定","バッテリー節約"],
    path:["設定","App Store","自動ダウンロード","Appのアップデート"],
    steps:["「設定」アプリを開く","「App Store」をタップ","「Appのアップデート」をオフにする","手動でアップデートするには「App Store」→「アップデート」タブから行う"],
    related_slugs:["check-storage-ios","battery-save-ios"],
    keywords:["自動アップデート","App Store","更新","オフ","手動","アプリ"],
    description:"アプリの自動アップデートをオフにする方法です。" },

  { title:"ショートカットアプリで自動化する", slug:"shortcuts-automation-ios", os:"ios", version:"17", category:"system", difficulty:"intermediate", estimate_minutes:10,
    aliases:["ショートカット","自動化","オートメーション","Shortcuts","マクロ","自動実行"],
    path:["ショートカットアプリ","オートメーション"],
    steps:["「ショートカット」アプリを開く","下部の「オートメーション」タブをタップ","右上の「＋」をタップ","「個人用オートメーションを作成」をタップ","トリガー（時刻・場所・充電など）を選択して自動化を設定"],
    related_slugs:["focus-mode-ios","control-center-ios"],
    keywords:["ショートカット","自動化","オートメーション","Shortcuts","マクロ","効率化"],
    description:"ショートカットアプリで繰り返し操作を自動化する方法です。" },

  // ============================================================
  // macOS 追加候補
  // ============================================================
  { title:"Gatekeeperのアプリ許可設定をする", slug:"gatekeeper-macos", os:"macos", version:"Sonoma", category:"security", difficulty:"intermediate", estimate_minutes:3,
    aliases:["Gatekeeper","アプリ許可","開発元不明","ブロックされた","セキュリティ設定","アプリが開かない"],
    path:["システム設定","プライバシーとセキュリティ"],
    steps:["インターネットからダウンロードしたアプリを開こうとするとブロックされることがある","システム設定 → 「プライバシーとセキュリティ」をクリック","「このまま開く」または「開くことを許可」ボタンをクリック","または Control+クリック → 「開く」でも許可可能"],
    related_slugs:["filevault-macos","change-password-macos"],
    keywords:["Gatekeeper","アプリ","許可","ブロック","開発元","セキュリティ"],
    description:"インターネットからダウンロードしたアプリの実行を許可する方法です。" },

  { title:"ホットコーナーを設定する", slug:"hot-corners-macos", os:"macos", version:"Sonoma", category:"system", difficulty:"beginner", estimate_minutes:3,
    aliases:["ホットコーナー","画面の角","コーナー設定","Mission Control起動","デスクトップ表示"],
    path:["システム設定","デスクトップとDock","ホットコーナー"],
    steps:["システム設定を開く","「デスクトップとDock」をクリック","下にスクロールして「ホットコーナー…」をクリック","4隅それぞれにアクション（Mission Control・Launchpad・スクリーンセーバーなど）を設定","マウスカーソルをその角に移動するとアクションが実行される"],
    related_slugs:["mission-control","auto-hide-dock"],
    keywords:["ホットコーナー","コーナー","Mission Control","Launchpad","スクリーンセーバー"],
    description:"画面の四隅にマウスを移動した時のアクションを設定するホットコーナーの使い方です。" },

  { title:"メニューバーのアイコンを整理する", slug:"menubar-icons-macos", os:"macos", version:"Sonoma", category:"display", difficulty:"beginner", estimate_minutes:2,
    aliases:["メニューバー","アイコン整理","ステータスバー","メニューバー非表示","バッテリー表示"],
    path:["システム設定","コントロールセンター"],
    steps:["システム設定 → 「コントロールセンター」をクリック","「メニューバーのみ」や「コントロールセンターとメニューバー」から表示を選択","Commandキーを押しながらアイコンをドラッグして並べ替え・削除も可能"],
    related_slugs:["auto-hide-dock","mission-control"],
    keywords:["メニューバー","アイコン","整理","表示","ステータスバー"],
    description:"Macのメニューバーに表示するアイコンを整理する方法です。" },

  { title:"Finderでファイルの拡張子を表示する", slug:"show-extensions-macos", os:"macos", version:"Sonoma", category:"file", difficulty:"beginner", estimate_minutes:1,
    aliases:["拡張子表示","ファイル拡張子",".jpg表示",".txt表示","ファイル名","拡張子Mac"],
    path:["Finder","設定","詳細","すべてのファイル名拡張子を表示"],
    steps:["Finderを開く","メニューバーの「Finder」→「設定」をクリック","「詳細」タブをクリック","「すべてのファイル名拡張子を表示」にチェックを入れる"],
    related_slugs:["finder-view-macos","show-file-extensions"],
    keywords:["拡張子","Finder","ファイル名","表示","Mac",".jpg",".txt"],
    description:"Macのファインダーでファイルの拡張子（.jpgなど）を表示する方法です。" },

  { title:"ターミナルを開く", slug:"open-terminal-macos", os:"macos", version:"Sonoma", category:"system", difficulty:"intermediate", estimate_minutes:1,
    aliases:["ターミナル","Terminal","コマンドライン","CLI","bash","zsh","コマンド入力"],
    path:["アプリケーション","ユーティリティ","ターミナル"],
    steps:["Spotlight検索（Command + Space）で「ターミナル」と入力してEnter","またはFinderで「アプリケーション」→「ユーティリティ」→「ターミナル」をダブルクリック","またはLaunchpadで「その他」→「ターミナル」"],
    related_slugs:["spotlight-search","open-cmd-admin"],
    keywords:["ターミナル","Terminal","コマンド","CLI","bash","zsh","シェル"],
    description:"Macのターミナル（コマンドライン）を開く方法です。" },

  { title:"ディスクユーティリティでディスクを修復する", slug:"disk-utility-repair-macos", os:"macos", version:"Sonoma", category:"storage", difficulty:"intermediate", estimate_minutes:10,
    aliases:["ディスクユーティリティ","First Aid","ディスク修復","ファイルシステム修復","起動しない"],
    path:["アプリケーション","ユーティリティ","ディスクユーティリティ"],
    steps:["Spotlight検索で「ディスクユーティリティ」と入力して開く","左のリストから修復したいディスクを選択","「First Aid」ボタンをクリック","「実行」をクリックして修復を開始","完了後に結果を確認"],
    related_slugs:["check-storage-macos","time-machine-macos"],
    keywords:["ディスクユーティリティ","First Aid","修復","ディスク","ストレージ","ファイルシステム"],
    description:"ディスクユーティリティのFirst Aid機能でディスクのエラーを修復する方法です。" },

  { title:"カラープロファイルを変更する", slug:"change-color-profile-macos", os:"macos", version:"Sonoma", category:"display", difficulty:"intermediate", estimate_minutes:3,
    aliases:["カラープロファイル","色校正","P3","sRGB","ディスプレイカラー","色設定"],
    path:["システム設定","ディスプレイ","カラープロファイル"],
    steps:["システム設定を開く","「ディスプレイ」をクリック","「カラープロファイル」ドロップダウンをクリック","使用するプロファイル（sRGB・P3・AdobeRGBなど）を選択"],
    related_slugs:["change-brightness-macos","setup-multi-display"],
    keywords:["カラープロファイル","色","sRGB","P3","ディスプレイ","色校正"],
    description:"Macのディスプレイカラープロファイルを変更する方法です。" },

  { title:"Touch IDを設定する", slug:"setup-touchid-macos", os:"macos", version:"Sonoma", category:"security", difficulty:"beginner", estimate_minutes:3,
    aliases:["Touch ID","指紋認証","MacBook指紋","指で認証","生体認証Mac"],
    path:["システム設定","Touch IDとパスコード"],
    steps:["システム設定を開く","「Touch IDとパスコード」をクリック","「指紋を追加…」をクリック","指をセンサーに繰り返し置いてスキャン","複数の指を登録可能（最大3本）"],
    related_slugs:["change-password-macos","filevault-macos"],
    keywords:["Touch ID","指紋","認証","MacBook","生体認証","セキュリティ"],
    description:"MacBook内蔵のTouch IDに指紋を登録する方法です。" },

  { title:"音声入力を有効にする", slug:"enable-voice-input-macos", os:"macos", version:"Sonoma", category:"input", difficulty:"beginner", estimate_minutes:2,
    aliases:["音声入力","音声認識","ディクテーション","マイク入力","声で入力"],
    path:["システム設定","キーボード","音声入力"],
    steps:["システム設定 → 「キーボード」をクリック","「音声入力」をオンにする","「ショートカット」でトリガーキーを設定","テキスト入力欄でショートカット（デフォルト：Fnを2回押す）を使って起動"],
    related_slugs:["custom-shortcuts-macos","allow-microphone-macos"],
    keywords:["音声入力","ディクテーション","音声認識","マイク","テキスト","入力"],
    description:"Macで音声をテキストに変換する音声入力（ディクテーション）を有効にする方法です。" },

  { title:"メールアカウントを追加する", slug:"add-mail-account-macos", os:"macos", version:"Sonoma", category:"account", difficulty:"beginner", estimate_minutes:3,
    aliases:["メールアカウント追加","メール設定","Gmail追加","Outlook設定","iCloud Mail","メールアプリ"],
    path:["メールアプリ","設定","アカウント","アカウントを追加"],
    steps:["「メール」アプリを開く","メニューバー「メール」→「設定」をクリック","「アカウント」タブの「＋」をクリック","メールプロバイダー（Google/Yahoo/Microsoft/iCloudなど）を選択","メールアドレスとパスワードを入力してサインイン"],
    related_slugs:["signin-microsoft-account","icloud-drive-macos"],
    keywords:["メール","アカウント","Gmail","Outlook","追加","設定","メールアプリ"],
    description:"MacのメールアプリにGmailやOutlookなどのアカウントを追加する方法です。" },

  // ============================================================
  // Android
  // ============================================================
  { title:"Wi-Fiに接続する", slug:"connect-wifi-android", os:"android", version:"14", category:"network", difficulty:"beginner", estimate_minutes:2,
    aliases:["WiFi接続","ワイファイ","無線LAN","インターネット接続","WiFiパスワード"],
    path:["設定","ネットワークとインターネット","インターネット"],
    steps:["「設定」アプリを開く","「ネットワークとインターネット」→「インターネット」をタップ","Wi-Fiがオンになっていることを確認","接続したいネットワーク名をタップ","パスワードを入力して「接続」をタップ"],
    related_slugs:["change-dns-android","toggle-airplane-android"],
    keywords:["Wi-Fi","WiFi","接続","ネットワーク","パスワード","インターネット"],
    description:"AndroidスマホをWi-Fiに接続する方法です。" },

  { title:"Bluetooth機器を接続する", slug:"connect-bluetooth-android", os:"android", version:"14", category:"bluetooth", difficulty:"beginner", estimate_minutes:3,
    aliases:["Bluetooth接続","ブルートゥース","イヤホン接続","ペアリング","ワイヤレス"],
    path:["設定","接続済みのデバイス","新しいデバイスとペア設定する"],
    steps:["「設定」アプリを開く","「接続済みのデバイス」をタップ","「新しいデバイスとペア設定する」をタップ","接続したい機器をペアリングモードにする","一覧に表示されたデバイスをタップして接続"],
    related_slugs:["connect-bluetooth","connect-bluetooth-ios"],
    keywords:["Bluetooth","ブルートゥース","ペアリング","接続","ワイヤレス","イヤホン"],
    description:"AndroidでBluetooth機器（イヤホン・スピーカー等）を接続する方法です。" },

  { title:"画面の明るさを変更する", slug:"change-brightness-android", os:"android", version:"14", category:"display", difficulty:"beginner", estimate_minutes:1,
    aliases:["明るさ","輝度","画面暗く","まぶしい","ブライトネス"],
    path:["設定","ディスプレイ","明るさのレベル"],
    steps:["上から下にスワイプしてクイック設定パネルを開く","明るさスライダーで調整","または設定 → 「ディスプレイ」→「明るさのレベル」でも変更可能"],
    related_slugs:["change-brightness","change-brightness-ios","night-light-android"],
    keywords:["明るさ","輝度","ディスプレイ","スライダー","暗い","まぶしい"],
    description:"Androidスマホの画面の明るさを調整する方法です。" },

  { title:"ナイトライト（ブルーライトカット）を設定する", slug:"night-light-android", os:"android", version:"14", category:"display", difficulty:"beginner", estimate_minutes:2,
    aliases:["ナイトライト","ブルーライト","夜間モード","目に優しい","暖色"],
    path:["設定","ディスプレイ","ナイトライト"],
    steps:["「設定」アプリを開く","「ディスプレイ」をタップ","「ナイトライト」をタップ","「今すぐオンにする」または「スケジュールを設定」を選択","色温度スライダーで暖色の強さを調整"],
    related_slugs:["change-brightness-android"],
    keywords:["ナイトライト","ブルーライト","夜間","暖色","目","ディスプレイ"],
    description:"ブルーライトを軽減するナイトライト機能を設定する方法です。" },

  { title:"通知をオフにする", slug:"disable-notifications-android", os:"android", version:"14", category:"notification", difficulty:"beginner", estimate_minutes:2,
    aliases:["通知オフ","通知消したい","通知うるさい","通知設定","アプリ通知"],
    path:["設定","通知","アプリの通知"],
    steps:["「設定」アプリを開く","「通知」をタップ","「アプリの通知」をタップ","通知をオフにしたいアプリをタップ","「通知の表示」をオフにする"],
    related_slugs:["disable-notifications","disable-notifications-ios"],
    keywords:["通知","オフ","消す","アプリ","設定","サイレント"],
    description:"アプリごとに通知をオフにする方法です。" },

  { title:"マイクのアクセスを許可する", slug:"allow-microphone-android", os:"android", version:"14", category:"privacy", difficulty:"beginner", estimate_minutes:2,
    aliases:["マイク許可","マイク設定","音声入力","マイクアクセス","アプリ権限"],
    path:["設定","プライバシー","権限マネージャー","マイク"],
    steps:["「設定」アプリを開く","「プライバシー」をタップ","「権限マネージャー」をタップ","「マイク」をタップ","許可したいアプリをタップして「アプリの使用中のみ許可」を選択"],
    related_slugs:["allow-microphone","allow-microphone-ios"],
    keywords:["マイク","許可","プライバシー","権限","アクセス","音声"],
    description:"アプリにマイクの使用を許可する方法です。" },

  { title:"位置情報をオフにする", slug:"disable-location-android", os:"android", version:"14", category:"privacy", difficulty:"beginner", estimate_minutes:1,
    aliases:["位置情報オフ","GPS","場所の許可","位置情報設定","プライバシー"],
    path:["設定","位置情報"],
    steps:["「設定」アプリを開く","「位置情報」をタップ","「位置情報の使用」をオフにする","または個別アプリの権限は「アプリの権限」から設定"],
    related_slugs:["allow-microphone-android","disable-notifications-android"],
    keywords:["位置情報","GPS","プライバシー","場所","オフ","権限"],
    description:"位置情報サービスをオフにする方法です。" },

  { title:"バッテリー節約モードをオンにする", slug:"battery-saver-android", os:"android", version:"14", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["バッテリー節約","省電力","節電","バッテリーセーバー","電池長持ち"],
    path:["設定","バッテリー","バッテリーセーバー"],
    steps:["「設定」アプリを開く","「バッテリー」をタップ","「バッテリーセーバー」をタップ","「今すぐ使用」をオンにする","クイック設定パネルからも素早くオン/オフ可能"],
    related_slugs:["battery-save-ios","change-brightness-android"],
    keywords:["バッテリー","節約","省電力","セーバー","長持ち","充電"],
    description:"Androidのバッテリー節約モードをオンにして電池を長持ちさせる方法です。" },

  { title:"ストレージの使用状況を確認する", slug:"check-storage-android", os:"android", version:"14", category:"storage", difficulty:"beginner", estimate_minutes:1,
    aliases:["容量確認","ストレージ不足","空き容量","内部ストレージ","GB確認"],
    path:["設定","ストレージ"],
    steps:["「設定」アプリを開く","「ストレージ」をタップ","使用中の容量と空き容量が表示される","「詳細を表示」でカテゴリ別の使用量を確認可能"],
    related_slugs:["check-storage-ios","battery-saver-android"],
    keywords:["ストレージ","容量","空き","GB","内部","確認"],
    description:"Androidスマホのストレージ使用状況を確認する方法です。" },

  { title:"画面のロックを設定する", slug:"setup-screen-lock-android", os:"android", version:"14", category:"security", difficulty:"beginner", estimate_minutes:3,
    aliases:["画面ロック","PIN設定","パスワード設定","指紋認証","パターンロック","セキュリティ"],
    path:["設定","セキュリティ","画面のロック"],
    steps:["「設定」アプリを開く","「セキュリティ」をタップ","「画面のロック」をタップ","「なし」「スワイプ」「パターン」「PIN」「パスワード」から選択","PINやパスワードの場合は2回入力して確認"],
    related_slugs:["setup-faceid","setup-lock-screen"],
    keywords:["ロック","PIN","パスワード","パターン","セキュリティ","認証"],
    description:"Androidの画面ロックを設定してセキュリティを高める方法です。" },

  { title:"指紋認証を設定する", slug:"setup-fingerprint-android", os:"android", version:"14", category:"security", difficulty:"beginner", estimate_minutes:3,
    aliases:["指紋認証","生体認証","指紋設定","フィンガープリント","指でロック解除"],
    path:["設定","セキュリティ","指紋認証"],
    steps:["「設定」アプリを開く","「セキュリティ」→「指紋認証」をタップ","PINまたはパスワードを設定する（事前に必要）","「指紋を追加」をタップ","センサーに指を繰り返し置いてスキャンを完了"],
    related_slugs:["setup-screen-lock-android","setup-faceid"],
    keywords:["指紋","認証","生体認証","セキュリティ","ロック解除","フィンガープリント"],
    description:"Androidで指紋認証を設定してすばやくロック解除する方法です。" },

  { title:"フォントサイズを変更する", slug:"change-font-size-android", os:"android", version:"14", category:"accessibility", difficulty:"beginner", estimate_minutes:1,
    aliases:["文字サイズ","フォントサイズ","文字大きく","テキストサイズ","見やすく"],
    path:["設定","ディスプレイ","フォントサイズと表示サイズ"],
    steps:["「設定」アプリを開く","「ディスプレイ」をタップ","「フォントサイズと表示サイズ」をタップ","「フォントサイズ」スライダーで文字の大きさを調整"],
    related_slugs:["change-text-size-ios","change-text-size"],
    keywords:["フォント","文字","サイズ","大きく","アクセシビリティ","ディスプレイ"],
    description:"Androidのシステム全体のフォント（文字）サイズを変更する方法です。" },

  { title:"着信音を変更する", slug:"change-ringtone-android", os:"android", version:"14", category:"sound", difficulty:"beginner", estimate_minutes:2,
    aliases:["着信音","着信音変更","サウンド","通知音","リングトーン"],
    path:["設定","サウンドとバイブレーション","着信音"],
    steps:["「設定」アプリを開く","「サウンドとバイブレーション」をタップ","「着信音」をタップ","一覧から好みの着信音を選択して「保存」をタップ"],
    related_slugs:["change-ringtone-ios","disable-notifications-android"],
    keywords:["着信音","サウンド","リングトーン","変更","通知音"],
    description:"Androidの着信音を変更する方法です。" },

  { title:"デベロッパーオプションを有効にする", slug:"developer-options-android", os:"android", version:"14", category:"system", difficulty:"advanced", estimate_minutes:2,
    aliases:["開発者オプション","デベロッパーモード","デバッグ","USB デバッグ","開発者設定"],
    path:["設定","デバイス情報","ビルド番号"],
    steps:["「設定」アプリを開く","「デバイス情報」をタップ","「ビルド番号」を7回連続でタップ","「デベロッパーになりました」と表示される","設定に戻ると「開発者向けオプション」が追加される"],
    related_slugs:["open-registry-editor"],
    keywords:["デベロッパー","開発者","オプション","USB","デバッグ","隠し設定"],
    description:"Androidの開発者向けオプション（デベロッパーオプション）を有効にする方法です。" },

  { title:"スクリーンショットを撮る", slug:"take-screenshot-android", os:"android", version:"14", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["スクリーンショット","スクショ","画面キャプチャ","画面保存","スクリーンキャプチャ"],
    path:["電源ボタン+音量ダウンボタン"],
    steps:["画面を表示した状態で「電源ボタン」と「音量ダウンボタン」を同時に押す","シャッター音と共にスクリーンショットが撮影される","通知パネルに保存された画像が表示される","機種によっては3本指で下スワイプでも撮影可能"],
    related_slugs:["take-screenshot","screenshot-macos"],
    keywords:["スクリーンショット","スクショ","キャプチャ","画面","保存","電源ボタン"],
    description:"Androidでスクリーンショットを撮る方法です。" },
];

function pgArr(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(s => `'${s.replace(/'/g,"''")}'`).join(",") + "]";
}
function pgStr(s) { return s ? `'${s.replace(/'/g,"''")}'` : "NULL"; }

const windows = allAdditional.filter(s => s.os === "windows11");
const ios = allAdditional.filter(s => s.os === "ios");
const macos = allAdditional.filter(s => s.os === "macos");
const android = allAdditional.filter(s => s.os === "android");

console.log("-- =============================================");
console.log("-- 設定どこ？ - 全追加データ");
console.log(`-- 合計${allAdditional.length}件`);
console.log(`-- Windows 11: ${windows.length}件 / iOS: ${ios.length}件 / macOS: ${macos.length}件 / Android: ${android.length}件`);
console.log("-- =============================================\n");
console.log("INSERT INTO settings");
console.log("  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)");
console.log("VALUES");

const rows = allAdditional.map((s,i) =>
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
