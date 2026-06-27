-- =============================================
-- 設定どこ？ - 全追加データ
-- 合計48件
-- Windows 11: 13件 / iOS: 10件 / macOS: 10件 / Android: 15件
-- =============================================

INSERT INTO settings
  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)
VALUES
  -- 1. BitLockerでドライブを暗号化する (windows11)
  ('BitLockerでドライブを暗号化する','bitlocker-encryption','windows11','23H2','security','intermediate',10,ARRAY['BitLocker','ドライブ暗号化','Cドライブ暗号化','データ保護','ビットロッカー'],ARRAY['設定','プライバシーとセキュリティ','デバイスの暗号化'],ARRAY['設定を開く（Win + I）','「プライバシーとセキュリティ」→「デバイスの暗号化」をクリック','「デバイスの暗号化」をオンにする','または検索で「BitLocker」→「BitLockerドライブ暗号化」→「BitLockerを有効にする」','回復キーをMicrosoftアカウント・USB・印刷のいずれかに保存する'],ARRAY['enable-firewall','setup-lock-screen'],ARRAY['BitLocker','暗号化','セキュリティ','ドライブ','データ保護'],'BitLockerを使ってドライブを暗号化しデータを保護する方法です。'),
  -- 2. リモートデスクトップを設定する (windows11)
  ('リモートデスクトップを設定する','setup-remote-desktop','windows11','23H2','network','intermediate',5,ARRAY['リモートデスクトップ','RDP','遠隔操作','リモート接続','Remote Desktop'],ARRAY['設定','システム','リモートデスクトップ'],ARRAY['設定を開く（Win + I）','「システム」→「リモートデスクトップ」をクリック','「リモートデスクトップを有効にする」をオンにする','「確認する」をクリック','接続先のPCのIPアドレスを確認しておく（「このPCへの接続方法」に表示）'],ARRAY['setup-vpn','connect-wifi-windows'],ARRAY['リモートデスクトップ','RDP','遠隔','接続','Remote Desktop'],'リモートデスクトップを有効にして別のPCから遠隔操作できるようにする方法です。'),
  -- 3. 電源プランを変更する (windows11)
  ('電源プランを変更する','change-power-plan','windows11','23H2','system','beginner',2,ARRAY['電源プラン','高パフォーマンス','バランス','省電力','電源設定'],ARRAY['コントロールパネル','電源オプション'],ARRAY['スタートメニューで「電源オプション」を検索して開く','「電源プランの選択またはカスタマイズ」画面が表示される','「バランス」「高パフォーマンス」「省電力」から選択','より細かい設定は「プラン設定の変更」から調整可能'],ARRAY['change-sleep-time','disable-fast-startup'],ARRAY['電源プラン','パフォーマンス','省電力','バランス','電源','設定'],'電源プランを変更してPCのパフォーマンスや省電力モードを切り替える方法です。'),
  -- 4. プリンターを追加する (windows11)
  ('プリンターを追加する','add-printer','windows11','23H2','system','beginner',5,ARRAY['プリンター追加','プリンター設定','印刷できない','プリンター接続','ドライバ'],ARRAY['設定','Bluetoothとデバイス','プリンターとスキャナー','デバイスの追加'],ARRAY['設定を開く（Win + I）','「Bluetoothとデバイス」→「プリンターとスキャナー」をクリック','「デバイスの追加」をクリック','検出されたプリンターを選択して追加','見つからない場合は「手動で追加」からIPアドレスやドライバーで追加'],ARRAY[]::text[],ARRAY['プリンター','印刷','追加','ドライバ','スキャナー','接続'],'Windowsにプリンターを追加して使えるようにする方法です。'),
  -- 5. Windowsの表示言語を変更する (windows11)
  ('Windowsの表示言語を変更する','change-display-language','windows11','23H2','system','intermediate',5,ARRAY['言語変更','表示言語','英語化','日本語化','ロケール','UI言語'],ARRAY['設定','時刻と言語','言語と地域'],ARRAY['設定を開く（Win + I）','「時刻と言語」→「言語と地域」をクリック','「言語を追加する」で希望の言語を追加','追加した言語の「…」→「言語オプション」をクリック','「Windowsの表示言語として設定する」を選択','サインアウトして再ログインすると反映される'],ARRAY['add-keyboard-language'],ARRAY['言語','表示言語','英語','日本語','ロケール','UI'],'Windowsのシステム表示言語（UI言語）を変更する方法です。'),
  -- 6. コントロールパネルを開く (windows11)
  ('コントロールパネルを開く','open-control-panel','windows11','23H2','system','beginner',1,ARRAY['コントロールパネル','旧設定','従来の設定','システム設定','クラシック設定'],ARRAY['スタートメニュー','検索','コントロールパネル'],ARRAY['Windowsキーを押して「コントロールパネル」と入力','「コントロールパネル」アプリをクリック','または Win + R →「control」と入力してEnter'],ARRAY['check-windows-version','add-printer'],ARRAY['コントロールパネル','control','設定','クラシック','旧UI'],'従来のコントロールパネルを開く方法です。'),
  -- 7. WSL（Windows Subsystem for Linux）を有効にする (windows11)
  ('WSL（Windows Subsystem for Linux）を有効にする','enable-wsl','windows11','23H2','system','advanced',10,ARRAY['WSL','Linux','Ubuntu','Windows Subsystem for Linux','Linuxサブシステム','ターミナル'],ARRAY['設定','オプション機能','Windowsのその他の機能','Linux用Windowsサブシステム'],ARRAY['管理者としてPowerShellを開く（スタートメニューで検索→管理者として実行）','「wsl --install」と入力してEnter','インストール完了後にPCを再起動','再起動後にUbuntuが自動で起動するのでユーザー名とパスワードを設定'],ARRAY['open-cmd-admin'],ARRAY['WSL','Linux','Ubuntu','サブシステム','ターミナル','開発'],'WSLを使ってWindows上でLinux環境を動かす方法です。'),
  -- 8. スタートメニューにアプリをピン留めする (windows11)
  ('スタートメニューにアプリをピン留めする','pin-to-start','windows11','23H2','app','beginner',1,ARRAY['ピン留め','スタートにピン留め','スタートメニュー追加','よく使うアプリ','クイックアクセス'],ARRAY['スタートメニュー','アプリ右クリック','スタートにピン留めする'],ARRAY['スタートメニューを開く','「すべてのアプリ」からピン留めしたいアプリを見つける','アプリを右クリック','「スタートにピン留めする」をクリック'],ARRAY['manage-startup-apps','install-from-store'],ARRAY['ピン留め','スタートメニュー','ショートカット','アプリ','固定'],'よく使うアプリをスタートメニューにピン留めする方法です。'),
  -- 9. 音声入力（ディクテーション）を使う (windows11)
  ('音声入力（ディクテーション）を使う','use-voice-input','windows11','23H2','input','beginner',2,ARRAY['音声入力','ディクテーション','声で文字入力','音声認識','スピーチ'],ARRAY['キーボードショートカット','Win + H'],ARRAY['テキストを入力したい場所（メモ帳・ブラウザなど）をクリックしてカーソルを置く','Win + H を押して音声入力パネルを起動','マイクアイコンをクリックして話しかける','話した言葉がテキストとして入力される'],ARRAY['allow-microphone','adjust-microphone-volume'],ARRAY['音声入力','ディクテーション','音声認識','マイク','Win+H','テキスト'],'Win+Hショートカットで音声をテキストに変換する音声入力機能の使い方です。'),
  -- 10. 拡大鏡を使う (windows11)
  ('拡大鏡を使う','use-magnifier','windows11','23H2','accessibility','beginner',1,ARRAY['拡大鏡','画面拡大','ズーム','虫眼鏡','見づらい','アクセシビリティ拡大'],ARRAY['設定','アクセシビリティ','拡大鏡'],ARRAY['Win + 「＋」キーで拡大鏡を即起動（画面が拡大される）','Win + 「−」キーで縮小','Win + Escで終了','設定 → アクセシビリティ → 拡大鏡で詳細な設定が可能'],ARRAY['change-text-size','change-display-scale','use-narrator'],ARRAY['拡大鏡','ズーム','拡大','アクセシビリティ','虫眼鏡','見やすく'],'画面を拡大して見やすくする拡大鏡機能の使い方です。'),
  -- 11. タッチキーボードを設定する (windows11)
  ('タッチキーボードを設定する','setup-touch-keyboard','windows11','23H2','input','beginner',2,ARRAY['タッチキーボード','スクリーンキーボード','仮想キーボード','OSK','オンスクリーンキーボード'],ARRAY['タスクバー右クリック','タスクバーの設定','タッチキーボード'],ARRAY['タスクバーを右クリック','「タスクバーの設定」をクリック','「タッチキーボード」をオンにする','タスクバーにキーボードアイコンが表示されるのでクリック','または「スクリーンキーボード」を検索して起動'],ARRAY['use-voice-input','add-keyboard-language'],ARRAY['タッチキーボード','スクリーンキーボード','仮想','入力','OSK','タブレット'],'タッチキーボード（スクリーンキーボード）を表示する方法です。'),
  -- 12. Hyper-Vを有効にする (windows11)
  ('Hyper-Vを有効にする','enable-hyper-v','windows11','23H2','system','advanced',5,ARRAY['Hyper-V','仮想マシン','仮想化','VM','Virtual Machine','ハイパーバイザー'],ARRAY['コントロールパネル','プログラム','Windowsの機能の有効化または無効化','Hyper-V'],ARRAY['コントロールパネルを開く','「プログラム」→「Windowsの機能の有効化または無効化」をクリック','「Hyper-V」にチェックを入れる','「OK」をクリック','PCを再起動する'],ARRAY['enable-wsl','open-control-panel'],ARRAY['Hyper-V','仮想マシン','VM','仮想化','仮想環境','Windows機能'],'Hyper-Vを有効にしてWindows上で仮想マシンを動かす方法です。'),
  -- 13. レジストリエディタを開く (windows11)
  ('レジストリエディタを開く','open-registry-editor','windows11','23H2','system','advanced',1,ARRAY['レジストリ','regedit','レジストリエディタ','Registry Editor','システムレジストリ'],ARRAY['Win + R','regedit','Enter'],ARRAY['Win + R を押して「ファイル名を指定して実行」を開く','「regedit」と入力してEnter','「このアプリがデバイスに変更を加えることを許可しますか？」→「はい」をクリック','レジストリエディタが起動する','※変更は慎重に行うこと。変更前にバックアップを取ることを推奨'],ARRAY['open-cmd-admin','open-control-panel'],ARRAY['レジストリ','regedit','Registry','システム','詳細設定','上級者'],'レジストリエディタを開く方法です。操作には十分な知識が必要です。'),
  -- 14. パスコードを変更する (ios)
  ('パスコードを変更する','change-passcode-ios','ios','17','security','beginner',2,ARRAY['パスコード変更','パスコード設定','ロック解除コード','4桁パスコード','6桁パスコード'],ARRAY['設定','Face IDとパスコード'],ARRAY['「設定」アプリを開く','「Face IDとパスコード」（または「Touch IDとパスコード」）をタップ','現在のパスコードを入力','「パスコードを変更」をタップ','現在のパスコードを入力してから新しいパスコードを2回入力'],ARRAY['setup-faceid','setup-touchid'],ARRAY['パスコード','変更','セキュリティ','ロック','認証','PIN'],'iPhoneのロック解除パスコードを変更する方法です。'),
  -- 15. 自動ロックの時間を変更する (ios)
  ('自動ロックの時間を変更する','auto-lock-ios','ios','17','display','beginner',1,ARRAY['自動ロック','スリープ','画面消える','ロックまでの時間','画面タイムアウト'],ARRAY['設定','画面表示と明るさ','自動ロック'],ARRAY['「設定」アプリを開く','「画面表示と明るさ」をタップ','「自動ロック」をタップ','30秒・1分・2分・3分・4分・5分・しないから選択'],ARRAY['change-brightness-ios','battery-save-ios'],ARRAY['自動ロック','スリープ','タイムアウト','画面','消える','時間'],'iPhoneが自動でロックされるまでの時間を変更する方法です。'),
  -- 16. Safariのプライベートブラウズをオンにする (ios)
  ('Safariのプライベートブラウズをオンにする','safari-private-mode-ios','ios','17','privacy','beginner',1,ARRAY['プライベートブラウズ','シークレットモード','履歴に残らない','プライベートモード','Safari履歴'],ARRAY['Safari','タブ','プライベート'],ARRAY['「Safari」アプリを開く','右下のタブアイコン（四角が重なったもの）をタップ','「X個のタブ」と表示されている部分を長押し、またはタップ','「プライベートを開く」をタップ','プライベートモードでは履歴・Cookieが保存されない'],ARRAY['check-app-permissions-ios','location-services-ios'],ARRAY['プライベート','Safari','シークレット','履歴','Cookie','ブラウズ'],'Safariのプライベートブラウズモードをオンにして閲覧履歴を残さない方法です。'),
  -- 17. iPhoneを探す（Find My）を設定する (ios)
  ('iPhoneを探す（Find My）を設定する','setup-find-my-ios','ios','17','security','beginner',3,ARRAY['iPhoneを探す','Find My','紛失モード','位置情報共有','デバイス追跡'],ARRAY['設定','Apple ID（名前）','iCloud','iPhoneを探す'],ARRAY['「設定」アプリを開く','上部のApple ID（名前）をタップ','「iCloud」をタップ','「iPhoneを探す」をタップ','「iPhoneを探す」と「最後の位置情報を送信」をオンにする'],ARRAY['icloud-backup-ios','location-services-ios'],ARRAY['iPhoneを探す','Find My','紛失','盗難','位置情報','追跡'],'紛失・盗難時にiPhoneの場所を特定できる「iPhoneを探す」の設定方法です。'),
  -- 18. メディカルIDを設定する (ios)
  ('メディカルIDを設定する','setup-medical-id-ios','ios','17','security','beginner',5,ARRAY['メディカルID','緊急医療情報','血液型','アレルギー','緊急連絡先','ヘルスケア'],ARRAY['ヘルスケアアプリ','自分のデータ','メディカルID'],ARRAY['「ヘルスケア」アプリを開く','右下の「自分のデータ」タブをタップ','「メディカルID」をタップ','「メディカルIDを作成」または「編集」をタップ','血液型・アレルギー・内服薬・緊急連絡先などを入力','「緊急時に表示」をオンにするとロック画面から確認可能'],ARRAY['emergency-sos-ios'],ARRAY['メディカルID','緊急','医療情報','血液型','アレルギー','ヘルスケア'],'緊急時に医療情報を確認できるメディカルIDを設定する方法です。'),
  -- 19. AssistiveTouchを有効にする (ios)
  ('AssistiveTouchを有効にする','enable-assistivetouch-ios','ios','17','accessibility','beginner',2,ARRAY['AssistiveTouch','アシスティブタッチ','仮想ホームボタン','画面上ボタン','アクセシビリティ'],ARRAY['設定','アクセシビリティ','タッチ','AssistiveTouch'],ARRAY['「設定」アプリを開く','「アクセシビリティ」をタップ','「タッチ」をタップ','「AssistiveTouch」をタップ','「AssistiveTouch」をオンにする','画面上に丸いボタンが表示される'],ARRAY['change-text-size-ios'],ARRAY['AssistiveTouch','アシスティブタッチ','ホームボタン','アクセシビリティ','タッチ'],'画面上に仮想ボタンを表示するAssistiveTouchを有効にする方法です。'),
  -- 20. 文字サイズを変更する (ios)
  ('文字サイズを変更する','change-text-size-ios','ios','17','accessibility','beginner',1,ARRAY['文字サイズ','フォントサイズ','文字を大きく','テキストサイズ','見やすく'],ARRAY['設定','画面表示と明るさ','テキストサイズを変更'],ARRAY['「設定」アプリを開く','「画面表示と明るさ」をタップ','「テキストサイズを変更」をタップ','スライダーで文字サイズを調整'],ARRAY['enable-assistivetouch-ios'],ARRAY['文字サイズ','テキスト','フォント','大きく','アクセシビリティ','見やすい'],'iPhoneの文字（テキスト）サイズを変更する方法です。'),
  -- 21. テキスト置換（定型文）を設定する (ios)
  ('テキスト置換（定型文）を設定する','text-replacement-ios','ios','17','input','beginner',3,ARRAY['テキスト置換','定型文','ショートカット入力','自動変換','よく使う文字'],ARRAY['設定','一般','キーボード','テキスト置換'],ARRAY['「設定」アプリを開く','「一般」→「キーボード」をタップ','「テキスト置換」をタップ','右上の「＋」をタップ','「フレーズ」に展開したい文字列、「ショートカット」に入力する短い文字を入力'],ARRAY['change-ime-settings'],ARRAY['テキスト置換','定型文','ショートカット','自動変換','キーボード','入力'],'短い文字を入力すると自動で長い文字列に変換される定型文を設定する方法です。'),
  -- 22. App Storeの自動アップデートをオフにする (ios)
  ('App Storeの自動アップデートをオフにする','disable-auto-update-ios','ios','17','app','beginner',1,ARRAY['自動アップデート','アプリ更新','自動更新オフ','App Store設定','バッテリー節約'],ARRAY['設定','App Store','自動ダウンロード','Appのアップデート'],ARRAY['「設定」アプリを開く','「App Store」をタップ','「Appのアップデート」をオフにする','手動でアップデートするには「App Store」→「アップデート」タブから行う'],ARRAY['check-storage-ios','battery-save-ios'],ARRAY['自動アップデート','App Store','更新','オフ','手動','アプリ'],'アプリの自動アップデートをオフにする方法です。'),
  -- 23. ショートカットアプリで自動化する (ios)
  ('ショートカットアプリで自動化する','shortcuts-automation-ios','ios','17','system','intermediate',10,ARRAY['ショートカット','自動化','オートメーション','Shortcuts','マクロ','自動実行'],ARRAY['ショートカットアプリ','オートメーション'],ARRAY['「ショートカット」アプリを開く','下部の「オートメーション」タブをタップ','右上の「＋」をタップ','「個人用オートメーションを作成」をタップ','トリガー（時刻・場所・充電など）を選択して自動化を設定'],ARRAY['focus-mode-ios','control-center-ios'],ARRAY['ショートカット','自動化','オートメーション','Shortcuts','マクロ','効率化'],'ショートカットアプリで繰り返し操作を自動化する方法です。'),
  -- 24. Gatekeeperのアプリ許可設定をする (macos)
  ('Gatekeeperのアプリ許可設定をする','gatekeeper-macos','macos','Sonoma','security','intermediate',3,ARRAY['Gatekeeper','アプリ許可','開発元不明','ブロックされた','セキュリティ設定','アプリが開かない'],ARRAY['システム設定','プライバシーとセキュリティ'],ARRAY['インターネットからダウンロードしたアプリを開こうとするとブロックされることがある','システム設定 → 「プライバシーとセキュリティ」をクリック','「このまま開く」または「開くことを許可」ボタンをクリック','または Control+クリック → 「開く」でも許可可能'],ARRAY['filevault-macos','change-password-macos'],ARRAY['Gatekeeper','アプリ','許可','ブロック','開発元','セキュリティ'],'インターネットからダウンロードしたアプリの実行を許可する方法です。'),
  -- 25. ホットコーナーを設定する (macos)
  ('ホットコーナーを設定する','hot-corners-macos','macos','Sonoma','system','beginner',3,ARRAY['ホットコーナー','画面の角','コーナー設定','Mission Control起動','デスクトップ表示'],ARRAY['システム設定','デスクトップとDock','ホットコーナー'],ARRAY['システム設定を開く','「デスクトップとDock」をクリック','下にスクロールして「ホットコーナー…」をクリック','4隅それぞれにアクション（Mission Control・Launchpad・スクリーンセーバーなど）を設定','マウスカーソルをその角に移動するとアクションが実行される'],ARRAY['mission-control','auto-hide-dock'],ARRAY['ホットコーナー','コーナー','Mission Control','Launchpad','スクリーンセーバー'],'画面の四隅にマウスを移動した時のアクションを設定するホットコーナーの使い方です。'),
  -- 26. メニューバーのアイコンを整理する (macos)
  ('メニューバーのアイコンを整理する','menubar-icons-macos','macos','Sonoma','display','beginner',2,ARRAY['メニューバー','アイコン整理','ステータスバー','メニューバー非表示','バッテリー表示'],ARRAY['システム設定','コントロールセンター'],ARRAY['システム設定 → 「コントロールセンター」をクリック','「メニューバーのみ」や「コントロールセンターとメニューバー」から表示を選択','Commandキーを押しながらアイコンをドラッグして並べ替え・削除も可能'],ARRAY['auto-hide-dock','mission-control'],ARRAY['メニューバー','アイコン','整理','表示','ステータスバー'],'Macのメニューバーに表示するアイコンを整理する方法です。'),
  -- 27. Finderでファイルの拡張子を表示する (macos)
  ('Finderでファイルの拡張子を表示する','show-extensions-macos','macos','Sonoma','file','beginner',1,ARRAY['拡張子表示','ファイル拡張子','.jpg表示','.txt表示','ファイル名','拡張子Mac'],ARRAY['Finder','設定','詳細','すべてのファイル名拡張子を表示'],ARRAY['Finderを開く','メニューバーの「Finder」→「設定」をクリック','「詳細」タブをクリック','「すべてのファイル名拡張子を表示」にチェックを入れる'],ARRAY['finder-view-macos','show-file-extensions'],ARRAY['拡張子','Finder','ファイル名','表示','Mac','.jpg','.txt'],'Macのファインダーでファイルの拡張子（.jpgなど）を表示する方法です。'),
  -- 28. ターミナルを開く (macos)
  ('ターミナルを開く','open-terminal-macos','macos','Sonoma','system','intermediate',1,ARRAY['ターミナル','Terminal','コマンドライン','CLI','bash','zsh','コマンド入力'],ARRAY['アプリケーション','ユーティリティ','ターミナル'],ARRAY['Spotlight検索（Command + Space）で「ターミナル」と入力してEnter','またはFinderで「アプリケーション」→「ユーティリティ」→「ターミナル」をダブルクリック','またはLaunchpadで「その他」→「ターミナル」'],ARRAY['spotlight-search','open-cmd-admin'],ARRAY['ターミナル','Terminal','コマンド','CLI','bash','zsh','シェル'],'Macのターミナル（コマンドライン）を開く方法です。'),
  -- 29. ディスクユーティリティでディスクを修復する (macos)
  ('ディスクユーティリティでディスクを修復する','disk-utility-repair-macos','macos','Sonoma','storage','intermediate',10,ARRAY['ディスクユーティリティ','First Aid','ディスク修復','ファイルシステム修復','起動しない'],ARRAY['アプリケーション','ユーティリティ','ディスクユーティリティ'],ARRAY['Spotlight検索で「ディスクユーティリティ」と入力して開く','左のリストから修復したいディスクを選択','「First Aid」ボタンをクリック','「実行」をクリックして修復を開始','完了後に結果を確認'],ARRAY['check-storage-macos','time-machine-macos'],ARRAY['ディスクユーティリティ','First Aid','修復','ディスク','ストレージ','ファイルシステム'],'ディスクユーティリティのFirst Aid機能でディスクのエラーを修復する方法です。'),
  -- 30. カラープロファイルを変更する (macos)
  ('カラープロファイルを変更する','change-color-profile-macos','macos','Sonoma','display','intermediate',3,ARRAY['カラープロファイル','色校正','P3','sRGB','ディスプレイカラー','色設定'],ARRAY['システム設定','ディスプレイ','カラープロファイル'],ARRAY['システム設定を開く','「ディスプレイ」をクリック','「カラープロファイル」ドロップダウンをクリック','使用するプロファイル（sRGB・P3・AdobeRGBなど）を選択'],ARRAY['change-brightness-macos','setup-multi-display'],ARRAY['カラープロファイル','色','sRGB','P3','ディスプレイ','色校正'],'Macのディスプレイカラープロファイルを変更する方法です。'),
  -- 31. Touch IDを設定する (macos)
  ('Touch IDを設定する','setup-touchid-macos','macos','Sonoma','security','beginner',3,ARRAY['Touch ID','指紋認証','MacBook指紋','指で認証','生体認証Mac'],ARRAY['システム設定','Touch IDとパスコード'],ARRAY['システム設定を開く','「Touch IDとパスコード」をクリック','「指紋を追加…」をクリック','指をセンサーに繰り返し置いてスキャン','複数の指を登録可能（最大3本）'],ARRAY['change-password-macos','filevault-macos'],ARRAY['Touch ID','指紋','認証','MacBook','生体認証','セキュリティ'],'MacBook内蔵のTouch IDに指紋を登録する方法です。'),
  -- 32. 音声入力を有効にする (macos)
  ('音声入力を有効にする','enable-voice-input-macos','macos','Sonoma','input','beginner',2,ARRAY['音声入力','音声認識','ディクテーション','マイク入力','声で入力'],ARRAY['システム設定','キーボード','音声入力'],ARRAY['システム設定 → 「キーボード」をクリック','「音声入力」をオンにする','「ショートカット」でトリガーキーを設定','テキスト入力欄でショートカット（デフォルト：Fnを2回押す）を使って起動'],ARRAY['custom-shortcuts-macos','allow-microphone-macos'],ARRAY['音声入力','ディクテーション','音声認識','マイク','テキスト','入力'],'Macで音声をテキストに変換する音声入力（ディクテーション）を有効にする方法です。'),
  -- 33. メールアカウントを追加する (macos)
  ('メールアカウントを追加する','add-mail-account-macos','macos','Sonoma','account','beginner',3,ARRAY['メールアカウント追加','メール設定','Gmail追加','Outlook設定','iCloud Mail','メールアプリ'],ARRAY['メールアプリ','設定','アカウント','アカウントを追加'],ARRAY['「メール」アプリを開く','メニューバー「メール」→「設定」をクリック','「アカウント」タブの「＋」をクリック','メールプロバイダー（Google/Yahoo/Microsoft/iCloudなど）を選択','メールアドレスとパスワードを入力してサインイン'],ARRAY['signin-microsoft-account','icloud-drive-macos'],ARRAY['メール','アカウント','Gmail','Outlook','追加','設定','メールアプリ'],'MacのメールアプリにGmailやOutlookなどのアカウントを追加する方法です。'),
  -- 34. Wi-Fiに接続する (android)
  ('Wi-Fiに接続する','connect-wifi-android','android','14','network','beginner',2,ARRAY['WiFi接続','ワイファイ','無線LAN','インターネット接続','WiFiパスワード'],ARRAY['設定','ネットワークとインターネット','インターネット'],ARRAY['「設定」アプリを開く','「ネットワークとインターネット」→「インターネット」をタップ','Wi-Fiがオンになっていることを確認','接続したいネットワーク名をタップ','パスワードを入力して「接続」をタップ'],ARRAY['change-dns-android','toggle-airplane-android'],ARRAY['Wi-Fi','WiFi','接続','ネットワーク','パスワード','インターネット'],'AndroidスマホをWi-Fiに接続する方法です。'),
  -- 35. Bluetooth機器を接続する (android)
  ('Bluetooth機器を接続する','connect-bluetooth-android','android','14','bluetooth','beginner',3,ARRAY['Bluetooth接続','ブルートゥース','イヤホン接続','ペアリング','ワイヤレス'],ARRAY['設定','接続済みのデバイス','新しいデバイスとペア設定する'],ARRAY['「設定」アプリを開く','「接続済みのデバイス」をタップ','「新しいデバイスとペア設定する」をタップ','接続したい機器をペアリングモードにする','一覧に表示されたデバイスをタップして接続'],ARRAY['connect-bluetooth','connect-bluetooth-ios'],ARRAY['Bluetooth','ブルートゥース','ペアリング','接続','ワイヤレス','イヤホン'],'AndroidでBluetooth機器（イヤホン・スピーカー等）を接続する方法です。'),
  -- 36. 画面の明るさを変更する (android)
  ('画面の明るさを変更する','change-brightness-android','android','14','display','beginner',1,ARRAY['明るさ','輝度','画面暗く','まぶしい','ブライトネス'],ARRAY['設定','ディスプレイ','明るさのレベル'],ARRAY['上から下にスワイプしてクイック設定パネルを開く','明るさスライダーで調整','または設定 → 「ディスプレイ」→「明るさのレベル」でも変更可能'],ARRAY['change-brightness','change-brightness-ios','night-light-android'],ARRAY['明るさ','輝度','ディスプレイ','スライダー','暗い','まぶしい'],'Androidスマホの画面の明るさを調整する方法です。'),
  -- 37. ナイトライト（ブルーライトカット）を設定する (android)
  ('ナイトライト（ブルーライトカット）を設定する','night-light-android','android','14','display','beginner',2,ARRAY['ナイトライト','ブルーライト','夜間モード','目に優しい','暖色'],ARRAY['設定','ディスプレイ','ナイトライト'],ARRAY['「設定」アプリを開く','「ディスプレイ」をタップ','「ナイトライト」をタップ','「今すぐオンにする」または「スケジュールを設定」を選択','色温度スライダーで暖色の強さを調整'],ARRAY['change-brightness-android'],ARRAY['ナイトライト','ブルーライト','夜間','暖色','目','ディスプレイ'],'ブルーライトを軽減するナイトライト機能を設定する方法です。'),
  -- 38. 通知をオフにする (android)
  ('通知をオフにする','disable-notifications-android','android','14','notification','beginner',2,ARRAY['通知オフ','通知消したい','通知うるさい','通知設定','アプリ通知'],ARRAY['設定','通知','アプリの通知'],ARRAY['「設定」アプリを開く','「通知」をタップ','「アプリの通知」をタップ','通知をオフにしたいアプリをタップ','「通知の表示」をオフにする'],ARRAY['disable-notifications','disable-notifications-ios'],ARRAY['通知','オフ','消す','アプリ','設定','サイレント'],'アプリごとに通知をオフにする方法です。'),
  -- 39. マイクのアクセスを許可する (android)
  ('マイクのアクセスを許可する','allow-microphone-android','android','14','privacy','beginner',2,ARRAY['マイク許可','マイク設定','音声入力','マイクアクセス','アプリ権限'],ARRAY['設定','プライバシー','権限マネージャー','マイク'],ARRAY['「設定」アプリを開く','「プライバシー」をタップ','「権限マネージャー」をタップ','「マイク」をタップ','許可したいアプリをタップして「アプリの使用中のみ許可」を選択'],ARRAY['allow-microphone','allow-microphone-ios'],ARRAY['マイク','許可','プライバシー','権限','アクセス','音声'],'アプリにマイクの使用を許可する方法です。'),
  -- 40. 位置情報をオフにする (android)
  ('位置情報をオフにする','disable-location-android','android','14','privacy','beginner',1,ARRAY['位置情報オフ','GPS','場所の許可','位置情報設定','プライバシー'],ARRAY['設定','位置情報'],ARRAY['「設定」アプリを開く','「位置情報」をタップ','「位置情報の使用」をオフにする','または個別アプリの権限は「アプリの権限」から設定'],ARRAY['allow-microphone-android','disable-notifications-android'],ARRAY['位置情報','GPS','プライバシー','場所','オフ','権限'],'位置情報サービスをオフにする方法です。'),
  -- 41. バッテリー節約モードをオンにする (android)
  ('バッテリー節約モードをオンにする','battery-saver-android','android','14','system','beginner',1,ARRAY['バッテリー節約','省電力','節電','バッテリーセーバー','電池長持ち'],ARRAY['設定','バッテリー','バッテリーセーバー'],ARRAY['「設定」アプリを開く','「バッテリー」をタップ','「バッテリーセーバー」をタップ','「今すぐ使用」をオンにする','クイック設定パネルからも素早くオン/オフ可能'],ARRAY['battery-save-ios','change-brightness-android'],ARRAY['バッテリー','節約','省電力','セーバー','長持ち','充電'],'Androidのバッテリー節約モードをオンにして電池を長持ちさせる方法です。'),
  -- 42. ストレージの使用状況を確認する (android)
  ('ストレージの使用状況を確認する','check-storage-android','android','14','storage','beginner',1,ARRAY['容量確認','ストレージ不足','空き容量','内部ストレージ','GB確認'],ARRAY['設定','ストレージ'],ARRAY['「設定」アプリを開く','「ストレージ」をタップ','使用中の容量と空き容量が表示される','「詳細を表示」でカテゴリ別の使用量を確認可能'],ARRAY['check-storage-ios','battery-saver-android'],ARRAY['ストレージ','容量','空き','GB','内部','確認'],'Androidスマホのストレージ使用状況を確認する方法です。'),
  -- 43. 画面のロックを設定する (android)
  ('画面のロックを設定する','setup-screen-lock-android','android','14','security','beginner',3,ARRAY['画面ロック','PIN設定','パスワード設定','指紋認証','パターンロック','セキュリティ'],ARRAY['設定','セキュリティ','画面のロック'],ARRAY['「設定」アプリを開く','「セキュリティ」をタップ','「画面のロック」をタップ','「なし」「スワイプ」「パターン」「PIN」「パスワード」から選択','PINやパスワードの場合は2回入力して確認'],ARRAY['setup-faceid','setup-lock-screen'],ARRAY['ロック','PIN','パスワード','パターン','セキュリティ','認証'],'Androidの画面ロックを設定してセキュリティを高める方法です。'),
  -- 44. 指紋認証を設定する (android)
  ('指紋認証を設定する','setup-fingerprint-android','android','14','security','beginner',3,ARRAY['指紋認証','生体認証','指紋設定','フィンガープリント','指でロック解除'],ARRAY['設定','セキュリティ','指紋認証'],ARRAY['「設定」アプリを開く','「セキュリティ」→「指紋認証」をタップ','PINまたはパスワードを設定する（事前に必要）','「指紋を追加」をタップ','センサーに指を繰り返し置いてスキャンを完了'],ARRAY['setup-screen-lock-android','setup-faceid'],ARRAY['指紋','認証','生体認証','セキュリティ','ロック解除','フィンガープリント'],'Androidで指紋認証を設定してすばやくロック解除する方法です。'),
  -- 45. フォントサイズを変更する (android)
  ('フォントサイズを変更する','change-font-size-android','android','14','accessibility','beginner',1,ARRAY['文字サイズ','フォントサイズ','文字大きく','テキストサイズ','見やすく'],ARRAY['設定','ディスプレイ','フォントサイズと表示サイズ'],ARRAY['「設定」アプリを開く','「ディスプレイ」をタップ','「フォントサイズと表示サイズ」をタップ','「フォントサイズ」スライダーで文字の大きさを調整'],ARRAY['change-text-size-ios','change-text-size'],ARRAY['フォント','文字','サイズ','大きく','アクセシビリティ','ディスプレイ'],'Androidのシステム全体のフォント（文字）サイズを変更する方法です。'),
  -- 46. 着信音を変更する (android)
  ('着信音を変更する','change-ringtone-android','android','14','sound','beginner',2,ARRAY['着信音','着信音変更','サウンド','通知音','リングトーン'],ARRAY['設定','サウンドとバイブレーション','着信音'],ARRAY['「設定」アプリを開く','「サウンドとバイブレーション」をタップ','「着信音」をタップ','一覧から好みの着信音を選択して「保存」をタップ'],ARRAY['change-ringtone-ios','disable-notifications-android'],ARRAY['着信音','サウンド','リングトーン','変更','通知音'],'Androidの着信音を変更する方法です。'),
  -- 47. デベロッパーオプションを有効にする (android)
  ('デベロッパーオプションを有効にする','developer-options-android','android','14','system','advanced',2,ARRAY['開発者オプション','デベロッパーモード','デバッグ','USB デバッグ','開発者設定'],ARRAY['設定','デバイス情報','ビルド番号'],ARRAY['「設定」アプリを開く','「デバイス情報」をタップ','「ビルド番号」を7回連続でタップ','「デベロッパーになりました」と表示される','設定に戻ると「開発者向けオプション」が追加される'],ARRAY['open-registry-editor'],ARRAY['デベロッパー','開発者','オプション','USB','デバッグ','隠し設定'],'Androidの開発者向けオプション（デベロッパーオプション）を有効にする方法です。'),
  -- 48. スクリーンショットを撮る (android)
  ('スクリーンショットを撮る','take-screenshot-android','android','14','system','beginner',1,ARRAY['スクリーンショット','スクショ','画面キャプチャ','画面保存','スクリーンキャプチャ'],ARRAY['電源ボタン+音量ダウンボタン'],ARRAY['画面を表示した状態で「電源ボタン」と「音量ダウンボタン」を同時に押す','シャッター音と共にスクリーンショットが撮影される','通知パネルに保存された画像が表示される','機種によっては3本指で下スワイプでも撮影可能'],ARRAY['take-screenshot','screenshot-macos'],ARRAY['スクリーンショット','スクショ','キャプチャ','画面','保存','電源ボタン'],'Androidでスクリーンショットを撮る方法です。')
ON CONFLICT (slug,os) DO UPDATE SET
  title=EXCLUDED.title,version=EXCLUDED.version,category=EXCLUDED.category,
  difficulty=EXCLUDED.difficulty,estimate_minutes=EXCLUDED.estimate_minutes,
  aliases=EXCLUDED.aliases,path=EXCLUDED.path,steps=EXCLUDED.steps,
  related_slugs=EXCLUDED.related_slugs,keywords=EXCLUDED.keywords,
  description=EXCLUDED.description,updated_at=NOW();

SELECT os, count(*) FROM settings GROUP BY os ORDER BY os;
