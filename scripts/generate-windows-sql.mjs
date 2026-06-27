// scripts/generate-windows-sql.mjs
// node scripts/generate-windows-sql.mjs > supabase-seed-windows.sql

const windowsSettings = [
  // === セキュリティ ===
  { title:"Windowsセキュリティを開く", slug:"open-windows-security", os:"windows11", version:"23H2", category:"security", difficulty:"beginner", estimate_minutes:1,
    aliases:["ウイルス対策","セキュリティ確認","Windows Defender","ファイアウォール確認"],
    path:["設定","プライバシーとセキュリティ","Windowsセキュリティ"],
    steps:["設定を開く（Win + I）","「プライバシーとセキュリティ」をクリック","「Windowsセキュリティ」をクリック","「Windowsセキュリティを開く」をクリック"],
    related_slugs:["enable-firewall","windows-defender-scan"],
    keywords:["セキュリティ","Defender","ウイルス","マルウェア","保護"],
    description:"Windowsセキュリティセンターを開いてPCの保護状況を確認する方法です。"},

  { title:"ウイルススキャンを実行する", slug:"windows-defender-scan", os:"windows11", version:"23H2", category:"security", difficulty:"beginner", estimate_minutes:5,
    aliases:["ウイルス検索","マルウェアスキャン","Defenderスキャン","フルスキャン","クイックスキャン"],
    path:["Windowsセキュリティ","ウイルスと脅威の防止","スキャンのオプション"],
    steps:["スタートメニューから「Windowsセキュリティ」を開く","「ウイルスと脅威の防止」をクリック","「スキャンのオプション」をクリック","スキャンの種類を選択（クイック・フル・カスタム）","「今すぐスキャン」をクリック"],
    related_slugs:["open-windows-security"],
    keywords:["ウイルス","スキャン","Defender","マルウェア","検査"],
    description:"Windows Defenderでウイルス・マルウェアのスキャンを実行する方法です。"},

  { title:"Windowsファイアウォールを有効にする", slug:"enable-firewall", os:"windows11", version:"23H2", category:"security", difficulty:"beginner", estimate_minutes:2,
    aliases:["ファイアウォール設定","FW有効","ネットワーク保護","ファイアウォールオン"],
    path:["設定","プライバシーとセキュリティ","Windowsセキュリティ","ファイアウォールとネットワーク保護"],
    steps:["設定を開く（Win + I）","「プライバシーとセキュリティ」→「Windowsセキュリティ」をクリック","「ファイアウォールとネットワーク保護」をクリック","使用中のネットワーク（ドメイン・プライベート・パブリック）を選択","「Microsoft Defenderファイアウォール」をオンにする"],
    related_slugs:["open-windows-security"],
    keywords:["ファイアウォール","FW","ネットワーク","保護","セキュリティ"],
    description:"Windowsファイアウォールを有効にしてネットワーク上の脅威からPCを守る方法です。"},

  { title:"Windowsロック画面を設定する", slug:"setup-lock-screen", os:"windows11", version:"23H2", category:"security", difficulty:"beginner", estimate_minutes:2,
    aliases:["ロック画面","スクリーンロック","PIN設定","ロックをかける","自動ロック"],
    path:["設定","アカウント","サインインオプション"],
    steps:["設定を開く（Win + I）","「アカウント」→「サインインオプション」をクリック","「PIN（Windows Hello）」をクリック","「設定する」でPINを登録","または「パスワード」でパスワードを設定"],
    related_slugs:["auto-lock-setting"],
    keywords:["ロック","PIN","パスワード","認証","サインイン"],
    description:"PCにロック（PIN・パスワード）をかけて不正アクセスを防ぐ方法です。"},

  { title:"自動ロックの時間を設定する", slug:"auto-lock-setting", os:"windows11", version:"23H2", category:"security", difficulty:"beginner", estimate_minutes:2,
    aliases:["自動ロック","スクリーンセーバー後ロック","放置後ロック","動的ロック"],
    path:["設定","個人用設定","ロック画面","スクリーンセーバーの設定"],
    steps:["設定を開く（Win + I）","「個人用設定」→「ロック画面」をクリック","下にスクロールして「スクリーンセーバーの設定」をクリック","スクリーンセーバーを選択し「待ち時間」を設定","「再開時にログオン画面に戻る」にチェックを入れる"],
    related_slugs:["setup-lock-screen"],
    keywords:["自動ロック","スクリーンセーバー","セキュリティ","放置","タイムアウト"],
    description:"一定時間操作がない場合に自動でPCをロックする方法です。"},

  // === アカウント ===
  { title:"Microsoftアカウントでサインインする", slug:"signin-microsoft-account", os:"windows11", version:"23H2", category:"account", difficulty:"beginner", estimate_minutes:5,
    aliases:["Microsoftアカウント連携","MSアカウント","アカウント切り替え","オンラインアカウント"],
    path:["設定","アカウント","ユーザーの情報"],
    steps:["設定を開く（Win + I）","「アカウント」→「ユーザーの情報」をクリック","「Microsoftアカウントでのサインインに切り替える」をクリック","Microsoftアカウントのメールアドレスとパスワードを入力","確認コードを入力して完了"],
    related_slugs:["add-user-account"],
    keywords:["Microsoftアカウント","サインイン","アカウント","連携","同期"],
    description:"ローカルアカウントからMicrosoftアカウントに切り替える方法です。"},

  { title:"新しいユーザーアカウントを追加する", slug:"add-user-account", os:"windows11", version:"23H2", category:"account", difficulty:"intermediate", estimate_minutes:5,
    aliases:["ユーザー追加","新しいアカウント","家族アカウント","マルチユーザー","子供アカウント"],
    path:["設定","アカウント","家族とその他のユーザー"],
    steps:["設定を開く（Win + I）","「アカウント」→「家族とその他のユーザー」をクリック","「その他のユーザーを追加する」をクリック","「このユーザーのサインイン情報がありません」をクリック","「Microsoftアカウントを持たないユーザーを追加する」でローカルアカウントを作成"],
    related_slugs:["signin-microsoft-account"],
    keywords:["ユーザー","アカウント追加","家族","マルチユーザー","共有PC"],
    description:"PCに新しいユーザーアカウントを追加する方法です。"},

  { title:"Microsoftアカウントのパスワードを変更する", slug:"change-ms-password", os:"windows11", version:"23H2", category:"account", difficulty:"beginner", estimate_minutes:3,
    aliases:["パスワード変更","MSパスワード","アカウントパスワード","パスワード更新"],
    path:["設定","アカウント","サインインオプション","パスワード"],
    steps:["設定を開く（Win + I）","「アカウント」→「サインインオプション」をクリック","「パスワード」をクリック","「変更」をクリック","現在のパスワードと新しいパスワードを入力"],
    related_slugs:["setup-lock-screen"],
    keywords:["パスワード","変更","アカウント","セキュリティ","認証"],
    description:"Windowsのサインインパスワードを変更する方法です。"},

  // === ネットワーク ===
  { title:"Wi-Fiに接続する", slug:"connect-wifi-windows", os:"windows11", version:"23H2", category:"network", difficulty:"beginner", estimate_minutes:2,
    aliases:["WiFi接続","ワイファイ","無線LAN接続","インターネット接続","ネット繋がらない"],
    path:["タスクバー","ネットワークアイコン","Wi-Fiネットワーク選択"],
    steps:["タスクバー右下のネットワークアイコンをクリック","Wi-Fiがオンになっていることを確認","接続したいネットワーク名をクリック","「接続」をクリック","パスワードを入力して「次へ」をクリック"],
    related_slugs:["change-dns","wifi-troubleshoot"],
    keywords:["Wi-Fi","WiFi","無線LAN","接続","ネットワーク","パスワード"],
    description:"WindowsのPCをWi-Fiに接続する方法です。"},

  { title:"Wi-Fiが繋がらない時の対処", slug:"wifi-troubleshoot", os:"windows11", version:"23H2", category:"network", difficulty:"intermediate", estimate_minutes:5,
    aliases:["WiFi繋がらない","Wi-Fi不具合","インターネット繋がらない","ネット障害","Wi-Fiエラー"],
    path:["設定","システム","トラブルシューティング","その他のトラブルシューティングツール"],
    steps:["まずPCとルーターの電源を切って30秒後に再起動する","設定 → システム → トラブルシューティング → インターネット接続 を実行","それでも繋がらない場合はWi-Fiアダプターをデバイスマネージャーで更新する","ネットワークの設定をリセット：コマンドプロンプトで「netsh winsock reset」を実行"],
    related_slugs:["connect-wifi-windows","change-dns"],
    keywords:["Wi-Fi","繋がらない","トラブル","ネット","接続できない"],
    description:"Wi-Fiが繋がらない時の基本的な対処手順です。"},

  { title:"VPNを設定する", slug:"setup-vpn", os:"windows11", version:"23H2", category:"network", difficulty:"intermediate", estimate_minutes:5,
    aliases:["VPN接続","プライベートネットワーク","VPN設定","リモート接続"],
    path:["設定","ネットワークとインターネット","VPN"],
    steps:["設定を開く（Win + I）","「ネットワークとインターネット」→「VPN」をクリック","「VPN接続を追加する」をクリック","VPNプロバイダー・接続名・サーバー名を入力","「保存」して接続"],
    related_slugs:["connect-wifi-windows"],
    keywords:["VPN","プライベートネットワーク","セキュリティ","リモート","接続"],
    description:"Windows 11でVPN接続を設定する方法です。"},

  { title:"機内モードをオン・オフする", slug:"toggle-airplane-mode", os:"windows11", version:"23H2", category:"network", difficulty:"beginner", estimate_minutes:1,
    aliases:["機内モード","フライトモード","ネット切断","通信オフ","電波オフ"],
    path:["タスクバー","アクションセンター","機内モード"],
    steps:["タスクバー右下のWi-Fi・音量・電池アイコンをクリック","「機内モード」ボタンをクリック","オン/オフが切り替わる","またはWin + A でアクションセンターを開いて操作可能"],
    related_slugs:["connect-wifi-windows"],
    keywords:["機内モード","フライトモード","通信","オフ","ネット"],
    description:"機内モードをオン・オフして全ての無線通信を切断/再開する方法です。"},

  { title:"プロキシを設定する", slug:"setup-proxy", os:"windows11", version:"23H2", category:"network", difficulty:"advanced", estimate_minutes:5,
    aliases:["プロキシ設定","Proxy","プロキシサーバー","企業ネットワーク"],
    path:["設定","ネットワークとインターネット","プロキシ"],
    steps:["設定を開く（Win + I）","「ネットワークとインターネット」→「プロキシ」をクリック","「手動プロキシ セットアップ」をオンにする","プロキシサーバーのアドレスとポートを入力","「保存」をクリック"],
    related_slugs:["change-dns"],
    keywords:["プロキシ","Proxy","ネットワーク","企業","接続設定"],
    description:"プロキシサーバーを手動で設定する方法です。"},

  // === ストレージ ===
  { title:"ディスクのストレージ使用量を確認する", slug:"check-disk-storage", os:"windows11", version:"23H2", category:"storage", difficulty:"beginner", estimate_minutes:1,
    aliases:["ディスク容量","空き容量確認","ストレージ不足","Cドライブ容量","ディスク使用量"],
    path:["設定","システム","ストレージ"],
    steps:["設定を開く（Win + I）","「システム」→「ストレージ」をクリック","各ドライブの使用量が表示される","「その他のカテゴリを表示する」で詳細なカテゴリ別使用量も確認可能"],
    related_slugs:["storage-sense","cleanup-temp-files"],
    keywords:["ストレージ","容量","ディスク","Cドライブ","空き"],
    description:"PCのストレージ（ディスク）使用量をカテゴリ別に確認する方法です。"},

  { title:"ストレージセンサーで自動クリーンアップする", slug:"storage-sense", os:"windows11", version:"23H2", category:"storage", difficulty:"beginner", estimate_minutes:2,
    aliases:["ストレージセンサー","自動クリーンアップ","ディスク自動整理","空き容量自動確保"],
    path:["設定","システム","ストレージ","ストレージセンサー"],
    steps:["設定を開く（Win + I）","「システム」→「ストレージ」をクリック","「ストレージセンサー」をオンにする","「今すぐストレージセンサーを実行する」で即時実行も可能"],
    related_slugs:["check-disk-storage","cleanup-temp-files"],
    keywords:["ストレージセンサー","クリーンアップ","自動","空き容量","整理"],
    description:"Windowsが自動で不要ファイルを削除して空き容量を確保する設定です。"},

  { title:"一時ファイルを削除する", slug:"cleanup-temp-files", os:"windows11", version:"23H2", category:"storage", difficulty:"beginner", estimate_minutes:3,
    aliases:["一時ファイル削除","テンポラリ削除","キャッシュ削除","ディスククリーンアップ","temp削除"],
    path:["設定","システム","ストレージ","一時ファイル"],
    steps:["設定を開く（Win + I）","「システム」→「ストレージ」をクリック","「一時ファイル」をクリック","削除したい項目にチェックを入れる","「ファイルの削除」をクリック"],
    related_slugs:["storage-sense","check-disk-storage"],
    keywords:["一時ファイル","temp","キャッシュ","クリーンアップ","削除","空き容量"],
    description:"PCに溜まった一時ファイル・キャッシュを削除して空き容量を増やす方法です。"},

  { title:"ゴミ箱を空にする", slug:"empty-recycle-bin", os:"windows11", version:"23H2", category:"storage", difficulty:"beginner", estimate_minutes:1,
    aliases:["ゴミ箱削除","ゴミ箱を空に","Recycle Bin","削除ファイル完全削除"],
    path:["デスクトップ","ゴミ箱","右クリック","ゴミ箱を空にする"],
    steps:["デスクトップのゴミ箱アイコンを右クリック","「ゴミ箱を空にする」をクリック","「はい」で確認"],
    related_slugs:["check-disk-storage"],
    keywords:["ゴミ箱","削除","空にする","ストレージ","容量"],
    description:"ゴミ箱を空にしてディスク容量を回収する方法です。"},

  { title:"ドライブのデフラグ・最適化を行う", slug:"defrag-drive", os:"windows11", version:"23H2", category:"storage", difficulty:"intermediate", estimate_minutes:5,
    aliases:["デフラグ","最適化","ドライブ最適化","SSD最適化","HDDデフラグ"],
    path:["検索","「ドライブの最適化とデフラグ」","最適化"],
    steps:["タスクバーの検索ボックスに「デフラグ」と入力","「ドライブのデフラグと最適化」をクリック","最適化したいドライブを選択","「最適化」をクリック"],
    related_slugs:["check-disk-storage"],
    keywords:["デフラグ","最適化","ドライブ","SSD","HDD","パフォーマンス"],
    description:"ドライブを最適化してパフォーマンスを改善する方法です（HDDはデフラグ、SSDはTRIM）。"},

  // === アクセシビリティ ===
  { title:"テキストのサイズを変更する", slug:"change-text-size", os:"windows11", version:"23H2", category:"accessibility", difficulty:"beginner", estimate_minutes:1,
    aliases:["文字サイズ変更","文字を大きく","テキスト拡大","フォントサイズ","見やすく"],
    path:["設定","アクセシビリティ","テキストのサイズ"],
    steps:["設定を開く（Win + I）","「アクセシビリティ」をクリック","「テキストのサイズ」をクリック","スライダーでテキストサイズを調整","「適用」をクリック"],
    related_slugs:["change-display-scale","high-contrast-mode"],
    keywords:["テキスト","文字","サイズ","大きく","アクセシビリティ","見やすい"],
    description:"画面上のテキスト（文字）のサイズを変更する方法です。"},

  { title:"表示スケールを変更する", slug:"change-display-scale", os:"windows11", version:"23H2", category:"accessibility", difficulty:"beginner", estimate_minutes:2,
    aliases:["表示倍率","スケール変更","DPI設定","高DPI","画面拡大","125%","150%"],
    path:["設定","システム","ディスプレイ","拡大縮小とレイアウト"],
    steps:["設定を開く（Win + I）","「システム」→「ディスプレイ」をクリック","「拡大縮小とレイアウト」の「拡大縮小」ドロップダウンを選択","100%・125%・150%・175%から選ぶ"],
    related_slugs:["change-text-size","change-resolution"],
    keywords:["スケール","拡大縮小","DPI","倍率","表示","画面"],
    description:"アプリやアイコンの表示サイズ（スケール）を変更する方法です。"},

  { title:"ハイコントラストモードを設定する", slug:"high-contrast-mode", os:"windows11", version:"23H2", category:"accessibility", difficulty:"beginner", estimate_minutes:2,
    aliases:["ハイコントラスト","コントラスト強調","視覚補助","色コントラスト","見やすい配色"],
    path:["設定","アクセシビリティ","コントラストのテーマ"],
    steps:["設定を開く（Win + I）","「アクセシビリティ」をクリック","「コントラストのテーマ」をクリック","テーマ（水色・砂漠・黄昏・夜空）を選択","「適用」をクリック"],
    related_slugs:["change-text-size"],
    keywords:["ハイコントラスト","コントラスト","アクセシビリティ","視覚","配色"],
    description:"画面のコントラストを強調して視認性を高める方法です。"},

  { title:"ナレーター（画面読み上げ）を使う", slug:"use-narrator", os:"windows11", version:"23H2", category:"accessibility", difficulty:"beginner", estimate_minutes:2,
    aliases:["ナレーター","読み上げ","スクリーンリーダー","音声読み上げ","テキスト読み上げ"],
    path:["設定","アクセシビリティ","ナレーター"],
    steps:["設定を開く（Win + I）","「アクセシビリティ」→「ナレーター」をクリック","「ナレーター」のスイッチをオンにする","または Win + Ctrl + Enter で即起動"],
    related_slugs:["change-text-size","high-contrast-mode"],
    keywords:["ナレーター","読み上げ","音声","スクリーンリーダー","アクセシビリティ"],
    description:"画面の内容を音声で読み上げるナレーター機能を使う方法です。"},

  { title:"マウスポインターのサイズと色を変える", slug:"change-mouse-pointer", os:"windows11", version:"23H2", category:"accessibility", difficulty:"beginner", estimate_minutes:2,
    aliases:["マウスカーソル","ポインター変更","カーソル大きく","マウス見やすく"],
    path:["設定","アクセシビリティ","マウスポインターとタッチ"],
    steps:["設定を開く（Win + I）","「アクセシビリティ」→「マウスポインターとタッチ」をクリック","「マウスポインターのスタイル」で色を選択（白・黒・反転・カスタム）","スライダーでサイズを調整"],
    related_slugs:["change-text-size"],
    keywords:["マウス","ポインター","カーソル","サイズ","色","見やすい"],
    description:"マウスポインターのサイズと色を変えて見やすくする方法です。"},

  // === システム ===
  { title:"タスクマネージャーを開く", slug:"open-task-manager", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["タスクマネージャー","CPU使用率","メモリ使用率","プロセス確認","アプリ強制終了"],
    path:["Ctrl + Shift + Esc"],
    steps:["Ctrl + Shift + Esc を同時に押す","またはタスクバーを右クリック →「タスクマネージャー」","または Ctrl + Alt + Delete →「タスクマネージャー」"],
    related_slugs:["manage-startup-apps","check-windows-version"],
    keywords:["タスクマネージャー","CPU","メモリ","プロセス","パフォーマンス","強制終了"],
    description:"タスクマネージャーを開いてCPU・メモリ使用率やプロセスを確認する方法です。"},

  { title:"パソコンを再起動する", slug:"restart-pc", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["再起動","リスタート","PCリセット","再起動方法","再起動できない"],
    path:["スタートメニュー","電源","再起動"],
    steps:["スタートメニュー（Windowsキー）をクリック","右下の「電源」アイコンをクリック","「再起動」を選択","または Alt + F4 でデスクトップを選択した状態でシャットダウンメニューを表示"],
    related_slugs:["shutdown-pc"],
    keywords:["再起動","リスタート","電源","スタートメニュー"],
    description:"PCを再起動する方法です。"},

  { title:"パソコンをシャットダウンする", slug:"shutdown-pc", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:1,
    aliases:["シャットダウン","電源オフ","PC終了","電源切る","終了方法"],
    path:["スタートメニュー","電源","シャットダウン"],
    steps:["スタートメニュー（Windowsキー）をクリック","右下の「電源」アイコンをクリック","「シャットダウン」を選択","または Alt + F4 →「シャットダウン」"],
    related_slugs:["restart-pc","change-sleep-time"],
    keywords:["シャットダウン","電源","終了","オフ","スタートメニュー"],
    description:"PCをシャットダウン（電源オフ）する方法です。"},

  { title:"高速スタートアップを無効にする", slug:"disable-fast-startup", os:"windows11", version:"23H2", category:"system", difficulty:"intermediate", estimate_minutes:3,
    aliases:["高速起動","高速スタートアップ","完全シャットダウン","高速スタートアップ無効"],
    path:["コントロールパネル","電源オプション","電源ボタンの動作を選択する"],
    steps:["スタートメニューで「コントロールパネル」を検索して開く","「電源オプション」をクリック","「電源ボタンの動作を選択する」をクリック","「現在利用可能ではない設定を変更します」をクリック","「高速スタートアップを有効にする」のチェックを外す","「変更の保存」をクリック"],
    related_slugs:["restart-pc","shutdown-pc"],
    keywords:["高速スタートアップ","シャットダウン","起動","電源","トラブル"],
    description:"高速スタートアップを無効にして完全なシャットダウンを実行する方法です。"},

  { title:"仮想デスクトップを使う", slug:"virtual-desktop", os:"windows11", version:"23H2", category:"system", difficulty:"beginner", estimate_minutes:2,
    aliases:["仮想デスクトップ","タスクビュー","デスクトップ追加","デスクトップ切り替え","作業スペース"],
    path:["タスクバー","タスクビューボタン"],
    steps:["タスクバーの「タスクビュー」ボタンをクリック（または Win + Tab）","「新しいデスクトップ」をクリックして追加","デスクトップ間の切り替えは Win + Ctrl + ← / →","デスクトップを削除するにはタスクビューで × をクリック"],
    related_slugs:["open-task-manager"],
    keywords:["仮想デスクトップ","タスクビュー","デスクトップ","切り替え","作業"],
    description:"複数の仮想デスクトップを作成・切り替えて作業スペースを整理する方法です。"},

  { title:"コマンドプロンプトを管理者として開く", slug:"open-cmd-admin", os:"windows11", version:"23H2", category:"system", difficulty:"intermediate", estimate_minutes:1,
    aliases:["コマンドプロンプト","CMD","管理者権限","管理者として実行","PowerShell管理者"],
    path:["スタートメニュー","検索","cmd","管理者として実行"],
    steps:["スタートメニューで「cmd」と入力","「コマンドプロンプト」を右クリック","「管理者として実行」をクリック","「はい」で確認"],
    related_slugs:["check-windows-version"],
    keywords:["コマンドプロンプト","CMD","管理者","管理者権限","ターミナル"],
    description:"コマンドプロンプトを管理者権限で開く方法です。"},

  { title:"Windowsの回復・リセットをする", slug:"reset-windows", os:"windows11", version:"23H2", category:"system", difficulty:"advanced", estimate_minutes:30,
    aliases:["Windows初期化","リセット","工場出荷状態","PCリセット","初期化"],
    path:["設定","システム","回復"],
    steps:["重要なファイルをバックアップする","設定を開く（Win + I）","「システム」→「回復」をクリック","「このPCをリセットする」の「PCをリセットする」をクリック","「個人用ファイルを保持する」または「すべてを削除する」を選択","画面の指示に従って完了"],
    related_slugs:["check-windows-version","check-windows-update"],
    keywords:["リセット","初期化","回復","工場出荷","クリーンインストール"],
    description:"PCをリセット・初期化する方法です。重要なデータのバックアップを先に行ってください。"},

  // === ファイル ===
  { title:"ファイルのコピー・移動をする", slug:"copy-move-files", os:"windows11", version:"23H2", category:"file", difficulty:"beginner", estimate_minutes:1,
    aliases:["ファイルコピー","ファイル移動","コピペ","Ctrl+C","Ctrl+V","ドラッグ移動"],
    path:["エクスプローラー","ファイル選択","コピー・貼り付け"],
    steps:["コピーしたいファイルを選択","Ctrl + C でコピー（または右クリック →「コピー」）","移動先のフォルダを開く","Ctrl + V で貼り付け","移動の場合は Ctrl + X でカット → Ctrl + V で貼り付け"],
    related_slugs:["show-file-extensions","create-new-folder"],
    keywords:["コピー","移動","ファイル","Ctrl+C","Ctrl+V","カット","貼り付け"],
    description:"ファイルをコピーまたは移動する方法です。"},

  { title:"新しいフォルダを作成する", slug:"create-new-folder", os:"windows11", version:"23H2", category:"file", difficulty:"beginner", estimate_minutes:1,
    aliases:["フォルダ作成","新規フォルダ","ディレクトリ作成","フォルダ新規"],
    path:["エクスプローラー","右クリック","新規作成","フォルダー"],
    steps:["エクスプローラーで新しいフォルダを作りたい場所を開く","何もない場所を右クリック","「新規作成」→「フォルダー」をクリック","フォルダ名を入力してEnter","またはツールバーの「新規作成」→「フォルダー」"],
    related_slugs:["copy-move-files","show-file-extensions"],
    keywords:["フォルダ","新規作成","ディレクトリ","エクスプローラー","作成"],
    description:"新しいフォルダを作成する方法です。"},

  { title:"ファイルを圧縮・解凍する", slug:"zip-unzip-files", os:"windows11", version:"23H2", category:"file", difficulty:"beginner", estimate_minutes:2,
    aliases:["ZIP圧縮","解凍","zipファイル","ファイル圧縮","展開","7zip"],
    path:["エクスプローラー","ファイル右クリック","ZIPに圧縮"],
    steps:["圧縮したいファイル・フォルダを選択（複数選択可）","右クリック →「ZIPファイルに圧縮する」をクリック","ファイル名を入力してEnter","解凍は ZIPファイルを右クリック →「すべて展開」"],
    related_slugs:["show-file-extensions","show-hidden-files"],
    keywords:["ZIP","圧縮","解凍","展開","アーカイブ","ファイル"],
    description:"ファイルをZIP形式で圧縮・解凍する方法です。"},

  { title:"ファイルの検索をする", slug:"search-files", os:"windows11", version:"23H2", category:"file", difficulty:"beginner", estimate_minutes:1,
    aliases:["ファイル検索","ファイルを探す","検索ボックス","ファイルが見つからない","ファイル名検索"],
    path:["エクスプローラー","検索ボックス"],
    steps:["エクスプローラーを開く（Win + E）","右上の検索ボックスにファイル名を入力","Enterで検索開始","より詳細な検索は「検索オプション」で種類・更新日時・サイズ絞り込み可能"],
    related_slugs:["show-hidden-files","show-file-extensions"],
    keywords:["検索","ファイル","エクスプローラー","ファイル名","探す"],
    description:"エクスプローラーでファイルを検索する方法です。"},

  { title:"ファイルの関連付けを変更する", slug:"change-file-association", os:"windows11", version:"23H2", category:"file", difficulty:"intermediate", estimate_minutes:3,
    aliases:["拡張子関連付け","開くアプリ変更","デフォルトアプリ拡張子","ファイルを開くプログラム変更"],
    path:["ファイル右クリック","プログラムから開く","別のプログラムを選択"],
    steps:["変更したい拡張子のファイルを右クリック","「プログラムから開く」→「別のプログラムを選択」をクリック","使いたいアプリを選択","「常にこのアプリを使って開く」にチェックを入れる","「OK」をクリック"],
    related_slugs:["change-default-app","show-file-extensions"],
    keywords:["関連付け","拡張子","アプリ","プログラム","開く","変更"],
    description:"特定の拡張子のファイルを開くアプリを変更する方法です。"},

  { title:"OneDriveの同期を設定する", slug:"setup-onedrive", os:"windows11", version:"23H2", category:"file", difficulty:"beginner", estimate_minutes:5,
    aliases:["OneDrive設定","クラウド同期","OneDrive有効","ファイル同期","バックアップ"],
    path:["タスクバー","OneDriveアイコン","設定"],
    steps:["タスクバーのOneDriveアイコン（雲マーク）をクリック","「設定」をクリック","「アカウント」タブでサインイン","「フォルダーのバックアップを管理する」で同期するフォルダを選択","「バックアップの開始」をクリック"],
    related_slugs:["signin-microsoft-account"],
    keywords:["OneDrive","クラウド","同期","バックアップ","ストレージ","Microsoft"],
    description:"OneDriveでファイルをクラウドに同期・バックアップする方法です。"},

  // === 入力・キーボード ===
  { title:"キーボードショートカット一覧", slug:"keyboard-shortcuts", os:"windows11", version:"23H2", category:"input", difficulty:"beginner", estimate_minutes:2,
    aliases:["ショートカットキー","キーボード操作","ホットキー","Win+D","Alt+Tab"],
    path:["キーボードショートカット"],
    steps:["Win + D：デスクトップを表示/非表示","Win + L：画面をロック","Win + E：エクスプローラーを開く","Win + I：設定を開く","Alt + Tab：アプリを切り替える","Win + Tab：タスクビューを開く","Win + PrtSc：スクリーンショットを撮る"],
    related_slugs:["virtual-desktop","open-task-manager"],
    keywords:["ショートカット","キーボード","Win","Alt","Ctrl","ホットキー","効率化"],
    description:"Windows 11でよく使うキーボードショートカットの一覧です。"},

  { title:"マウスのスクロール速度を変更する", slug:"change-scroll-speed", os:"windows11", version:"23H2", category:"input", difficulty:"beginner", estimate_minutes:1,
    aliases:["スクロール速度","マウスホイール","スクロール設定","ホイール速度"],
    path:["設定","Bluetoothとデバイス","マウス"],
    steps:["設定を開く（Win + I）","「Bluetoothとデバイス」→「マウス」をクリック","「一度にスクロールする行数」のスライダーで調整","「マルチライン」で一度にスクロールする行数を3〜10程度に設定"],
    related_slugs:["add-keyboard-language"],
    keywords:["マウス","スクロール","速度","ホイール","設定"],
    description:"マウスホイールのスクロール速度を変更する方法です。"},

  { title:"タッチパッドの感度を変更する", slug:"change-touchpad-sensitivity", os:"windows11", version:"23H2", category:"input", difficulty:"beginner", estimate_minutes:2,
    aliases:["タッチパッド","トラックパッド","感度設定","誤タッチ","パッド設定"],
    path:["設定","Bluetoothとデバイス","タッチパッド"],
    steps:["設定を開く（Win + I）","「Bluetoothとデバイス」→「タッチパッド」をクリック","「タッチパッドの感度」ドロップダウンで感度を選択","ジェスチャー設定も同画面で変更可能"],
    related_slugs:["change-scroll-speed"],
    keywords:["タッチパッド","感度","ジェスチャー","ノートPC","トラックパッド"],
    description:"ノートPCのタッチパッドの感度を調整する方法です。"},

  { title:"日本語入力（IME）の設定を変更する", slug:"change-ime-settings", os:"windows11", version:"23H2", category:"input", difficulty:"intermediate", estimate_minutes:3,
    aliases:["IME設定","日本語入力","かな入力","ローマ字入力","変換設定","Microsoft IME"],
    path:["タスクバー","IMEアイコン右クリック","設定"],
    steps:["タスクバー右下のIMEアイコン（「あ」または「A」）を右クリック","「設定」をクリック","「全般」でキー設定・変換・予測入力などを調整","ローマ字入力/かな入力の切り替えは「キーとタッチのカスタマイズ」"],
    related_slugs:["add-keyboard-language"],
    keywords:["IME","日本語","入力","かな","ローマ字","変換","予測"],
    description:"日本語入力（Microsoft IME）の設定を変更する方法です。"},

  // === 表示・個人用設定 ===
  { title:"ダークモードを有効にする", slug:"enable-dark-mode", os:"windows11", version:"23H2", category:"display", difficulty:"beginner", estimate_minutes:1,
    aliases:["ダークモード","ダークテーマ","黒背景","ダーク設定","目に優しい"],
    path:["設定","個人用設定","色"],
    steps:["設定を開く（Win + I）","「個人用設定」→「色」をクリック","「モードを選択」で「ダーク」を選択","Windowsと各アプリがダークモードになる"],
    related_slugs:["change-brightness","change-wallpaper"],
    keywords:["ダークモード","ダーク","テーマ","黒","背景","目"],
    description:"Windows 11をダークモードに切り替える方法です。"},

  { title:"アクセントカラーを変更する", slug:"change-accent-color", os:"windows11", version:"23H2", category:"display", difficulty:"beginner", estimate_minutes:1,
    aliases:["アクセントカラー","テーマカラー","強調色","Windowsカラー","色設定"],
    path:["設定","個人用設定","色"],
    steps:["設定を開く（Win + I）","「個人用設定」→「色」をクリック","「アクセントカラー」で好みの色を選択","「手動」を選んで自由な色も設定可能"],
    related_slugs:["enable-dark-mode","change-wallpaper"],
    keywords:["アクセントカラー","色","テーマ","カスタマイズ","スタイル"],
    description:"Windowsのアクセントカラー（テーマカラー）を変更する方法です。"},

  { title:"複数ディスプレイを設定する", slug:"setup-multi-display", os:"windows11", version:"23H2", category:"display", difficulty:"intermediate", estimate_minutes:5,
    aliases:["デュアルディスプレイ","外部モニター","サブモニター","拡張表示","複数画面"],
    path:["設定","システム","ディスプレイ"],
    steps:["外部ディスプレイをPCに接続する（HDMI・DisplayPort・USB-Cなど）","Win + P を押して表示モードを選択","「拡張」：画面を2枚に拡張（おすすめ）","「複製」：同じ画面を両方に表示","「セカンドスクリーンのみ」：外部のみ表示","設定 → ディスプレイで各モニターの解像度・配置を調整"],
    related_slugs:["change-resolution","change-brightness"],
    keywords:["デュアルディスプレイ","外部モニター","拡張","複数画面","HDMI","Win+P"],
    description:"外部ディスプレイを接続して複数画面で使う方法です。"},

  { title:"スクリーンショットを撮る", slug:"take-screenshot", os:"windows11", version:"23H2", category:"display", difficulty:"beginner", estimate_minutes:1,
    aliases:["スクリーンショット","スクショ","画面キャプチャ","Print Screen","画面保存"],
    path:["キーボードショートカット","Win + PrtSc または Snipping Tool"],
    steps:["全画面スクショ：Win + PrtSc（自動保存：ピクチャ→スクリーンショット）","範囲選択スクショ：Win + Shift + S（クリップボードにコピー）","Snipping Tool：スタートメニューで検索して起動","スクショ後は画像編集アプリで開いて保存可能"],
    related_slugs:["search-files"],
    keywords:["スクリーンショット","スクショ","キャプチャ","PrtSc","Win+Shift+S","画面"],
    description:"Windows 11でスクリーンショットを撮る方法です。"},

  // === プライバシー ===
  { title:"位置情報サービスをオフにする", slug:"disable-location-windows", os:"windows11", version:"23H2", category:"privacy", difficulty:"beginner", estimate_minutes:2,
    aliases:["位置情報オフ","GPS無効","プライバシー位置","場所の許可","位置情報設定"],
    path:["設定","プライバシーとセキュリティ","位置情報"],
    steps:["設定を開く（Win + I）","「プライバシーとセキュリティ」→「位置情報」をクリック","「位置情報サービス」をオフにする","またはアプリ別に許可/拒否を設定"],
    related_slugs:["allow-microphone","allow-camera"],
    keywords:["位置情報","GPS","プライバシー","場所","オフ"],
    description:"Windowsの位置情報サービスをオフにする方法です。"},

  { title:"アプリの通知許可を管理する", slug:"manage-app-notifications", os:"windows11", version:"23H2", category:"notification", difficulty:"beginner", estimate_minutes:2,
    aliases:["通知許可","アプリ通知","通知管理","通知設定","通知バナー"],
    path:["設定","システム","通知"],
    steps:["設定を開く（Win + I）","「システム」→「通知」をクリック","「アプリや他の送信者からの通知」でアプリ一覧を確認","オフにしたいアプリのトグルをオフにする","各アプリをクリックするとバナー・サウンド・優先度も設定可能"],
    related_slugs:["disable-notifications"],
    keywords:["通知","アプリ","許可","管理","バナー","サウンド"],
    description:"アプリごとに通知の許可・拒否を設定する方法です。"},

  { title:"フォーカスアシスト（集中モード）を設定する", slug:"focus-assist", os:"windows11", version:"23H2", category:"notification", difficulty:"beginner", estimate_minutes:2,
    aliases:["集中モード","フォーカス","邪魔しないモード","DND","通知ブロック","作業集中"],
    path:["設定","システム","フォーカス"],
    steps:["設定を開く（Win + I）","「システム」→「フォーカス」をクリック","「フォーカスセッションを開始する」で時間を設定","またはアクションセンター（Win + A）から「フォーカスアシスト」をすぐ切り替え可能"],
    related_slugs:["disable-notifications","manage-app-notifications"],
    keywords:["フォーカス","集中","DND","邪魔しない","通知","ブロック"],
    description:"作業中に通知を一時的にブロックするフォーカスモードの設定方法です。"},

  // === サウンド ===
  { title:"マイクの音量を調整する", slug:"adjust-microphone-volume", os:"windows11", version:"23H2", category:"sound", difficulty:"beginner", estimate_minutes:2,
    aliases:["マイク音量","マイク感度","録音音量","マイクレベル","入力音量"],
    path:["設定","システム","サウンド","入力デバイス"],
    steps:["設定を開く（Win + I）","「システム」→「サウンド」をクリック","「入力」セクションでマイクを選択","「ボリューム」スライダーで入力音量を調整","「マイクをテストする」で録音レベルを確認"],
    related_slugs:["allow-microphone","set-audio-output"],
    keywords:["マイク","音量","感度","入力","録音","レベル"],
    description:"マイクの入力音量（感度）を調整する方法です。"},

  { title:"サウンドの出力デバイスをアプリごとに設定する", slug:"app-volume-settings", os:"windows11", version:"23H2", category:"sound", difficulty:"intermediate", estimate_minutes:3,
    aliases:["アプリ音量","アプリ別サウンド","ミキサー","音量ミキサー","アプリ出力先"],
    path:["設定","システム","サウンド","音量ミキサー"],
    steps:["設定を開く（Win + I）","「システム」→「サウンド」をクリック","下にスクロールして「音量ミキサー」をクリック","アプリごとに音量と出力デバイスを個別に設定可能"],
    related_slugs:["change-volume","set-audio-output"],
    keywords:["音量ミキサー","アプリ","サウンド","出力","個別","調整"],
    description:"アプリごとに音量と出力デバイスを個別に設定する方法です。"},

  { title:"システムサウンドをオフにする", slug:"disable-system-sounds", os:"windows11", version:"23H2", category:"sound", difficulty:"beginner", estimate_minutes:2,
    aliases:["効果音オフ","システム音消す","通知音オフ","Windowsサウンド無効","ビープ音"],
    path:["コントロールパネル","サウンド","サウンドタブ"],
    steps:["スタートメニューで「サウンド」を検索して「サウンドの変更」を開く","「サウンド」タブをクリック","「サウンドの設定」で「サウンドなし」を選択","または個別のイベントを選択して「なし」に変更","「適用」をクリック"],
    related_slugs:["change-volume"],
    keywords:["システムサウンド","効果音","通知音","オフ","無音","ビープ"],
    description:"Windowsのシステムサウンド（効果音）をオフにする方法です。"},

  // === アプリ ===
  { title:"Windowsの標準アプリをアンインストールする", slug:"uninstall-builtin-apps", os:"windows11", version:"23H2", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["プリインストールアプリ削除","標準アプリ削除","不要アプリ削除","アンインストール","アプリ削除"],
    path:["設定","アプリ","インストールされているアプリ"],
    steps:["設定を開く（Win + I）","「アプリ」→「インストールされているアプリ」をクリック","削除したいアプリを検索または一覧から探す","アプリの右側「…」をクリック","「アンインストール」をクリックして確認"],
    related_slugs:["change-default-app"],
    keywords:["アンインストール","削除","アプリ","プリインストール","不要","整理"],
    description:"不要なアプリやプリインストールアプリを削除する方法です。"},

  { title:"Microsoft Storeからアプリをインストールする", slug:"install-from-store", os:"windows11", version:"23H2", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Storeからインストール","アプリ追加","Microsoft Store","ストアアプリ"],
    path:["スタートメニュー","Microsoft Store"],
    steps:["スタートメニューから「Microsoft Store」を開く","検索ボックスでアプリを検索","アプリをクリックして「入手」または「インストール」をクリック","Microsoftアカウントでサインインが必要な場合あり"],
    related_slugs:["uninstall-builtin-apps","signin-microsoft-account"],
    keywords:["Microsoft Store","アプリ","インストール","ストア","追加"],
    description:"Microsoft Storeからアプリをインストールする方法です。"},

  { title:"アプリのバックグラウンド実行を制限する", slug:"limit-background-apps", os:"windows11", version:"23H2", category:"app", difficulty:"intermediate", estimate_minutes:3,
    aliases:["バックグラウンド","バッテリー節約","バックグラウンドアプリ","CPU節約","省電力"],
    path:["設定","アプリ","インストールされているアプリ","各アプリ","詳細オプション"],
    steps:["設定を開く（Win + I）","「アプリ」→「インストールされているアプリ」をクリック","制限したいアプリの「…」→「詳細オプション」をクリック","「バックグラウンドアプリのアクセス許可」を「なし」に変更"],
    related_slugs:["manage-startup-apps","change-sleep-time"],
    keywords:["バックグラウンド","アプリ","制限","バッテリー","CPU","省電力"],
    description:"アプリのバックグラウンド実行を制限してバッテリーとCPUを節約する方法です。"},
];

function pgArr(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(s => `'${s.replace(/'/g,"''")}'`).join(",") + "]";
}
function pgStr(s) { return s ? `'${s.replace(/'/g,"''")}'` : "NULL"; }

console.log("-- ==============================================");
console.log("-- 設定どこ？ - Windows 11 追加データ");
console.log(`-- ${windowsSettings.length}件`);
console.log("-- ==============================================");
console.log("");
console.log("INSERT INTO settings");
console.log("  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)");
console.log("VALUES");

const rows = windowsSettings.map((s,i) => {
  return `  -- ${i+1}. ${s.title}\n  (${pgStr(s.title)},${pgStr(s.slug)},${pgStr(s.os)},${pgStr(s.version)},${pgStr(s.category)},${pgStr(s.difficulty)},${s.estimate_minutes||"NULL"},${pgArr(s.aliases)},${pgArr(s.path)},${pgArr(s.steps)},${pgArr(s.related_slugs)},${pgArr(s.keywords)},${pgStr(s.description)})`;
});

console.log(rows.join(",\n"));
console.log("ON CONFLICT (slug,os) DO UPDATE SET");
console.log("  title=EXCLUDED.title,version=EXCLUDED.version,category=EXCLUDED.category,");
console.log("  difficulty=EXCLUDED.difficulty,estimate_minutes=EXCLUDED.estimate_minutes,");
console.log("  aliases=EXCLUDED.aliases,path=EXCLUDED.path,steps=EXCLUDED.steps,");
console.log("  related_slugs=EXCLUDED.related_slugs,keywords=EXCLUDED.keywords,");
console.log("  description=EXCLUDED.description,updated_at=NOW();");
console.log("");
console.log("SELECT os, count(*) FROM settings GROUP BY os ORDER BY os;");
