-- ==============================================
-- 設定どこ？ - Seed Data
-- ==============================================
-- Supabase SQL Editor でそのまま実行してください

INSERT INTO settings
  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)
VALUES
  -- 1. ファイル拡張子を表示する (windows11)
  ('ファイル拡張子を表示する','show-file-extensions','windows11','23H2','file','beginner',1,ARRAY['拡張子表示','拡張子を見たい','ファイルの種類','.txtが見えない','拡張子が消えた'],ARRAY['エクスプローラー','表示','表示','ファイル名拡張子'],ARRAY['エクスプローラーを開く（Win + E）','上部メニューの「表示」をクリック','「表示」にカーソルを合わせる','「ファイル名拡張子」にチェックを入れる'],ARRAY['show-hidden-files','change-default-app'],ARRAY['拡張子','extension','ファイル名','表示','エクスプローラー'],'ファイルの拡張子（.txt .jpgなど）を表示する方法です。'),
  -- 2. 隠しファイルを表示する (windows11)
  ('隠しファイルを表示する','show-hidden-files','windows11','23H2','file','beginner',1,ARRAY['隠しファイル','非表示ファイル','ドットファイル'],ARRAY['エクスプローラー','表示','表示','隠しファイル'],ARRAY['エクスプローラーを開く（Win + E）','上部メニューの「表示」をクリック','「表示」にカーソルを合わせる','「隠しファイル」にチェックを入れる'],ARRAY['show-file-extensions'],ARRAY['隠しファイル','hidden','非表示','ドットファイル'],'隠しファイル・フォルダを表示する方法です。'),
  -- 3. Bluetooth機器を接続する (windows11)
  ('Bluetooth機器を接続する','connect-bluetooth','windows11','23H2','bluetooth','beginner',3,ARRAY['Bluetooth接続','ブルートゥース','ワイヤレス接続','イヤホン接続','BT'],ARRAY['設定','Bluetoothとデバイス','デバイスの追加'],ARRAY['設定を開く（Win + I）','「Bluetoothとデバイス」をクリック','Bluetoothがオンになっていることを確認','「デバイスの追加」をクリック','接続したい機器をペアリングモードにする','一覧から機器を選択して接続'],ARRAY['bluetooth-troubleshoot','connect-bluetooth-ios','connect-bluetooth-macos'],ARRAY['Bluetooth','ブルートゥース','ペアリング','ワイヤレス','イヤホン','ヘッドホン'],'Bluetoothでイヤホンやマウスなどを接続する方法です。'),
  -- 4. Bluetoothが繋がらない時の対処 (windows11)
  ('Bluetoothが繋がらない時の対処','bluetooth-troubleshoot','windows11','23H2','bluetooth','intermediate',5,ARRAY['Bluetooth繋がらない','BT不具合','ペアリングできない'],ARRAY['設定','Bluetoothとデバイス'],ARRAY['設定 > Bluetoothとデバイス でBluetoothをオフ→オンにする','接続済みの機器を一度「デバイスの削除」で削除する','機器側もペアリング情報をリセットする','再度「デバイスの追加」から接続する','解決しない場合はデバイスマネージャーでBluetoothドライバーを更新する'],ARRAY['connect-bluetooth'],ARRAY['Bluetooth','繋がらない','接続できない','トラブル','不具合'],'Bluetooth機器が接続できない場合の対処方法です。'),
  -- 5. 画面の明るさを変更する (windows11)
  ('画面の明るさを変更する','change-brightness','windows11','23H2','display','beginner',1,ARRAY['明るさ','画面暗く','画面まぶしい','輝度','ブライトネス'],ARRAY['設定','システム','ディスプレイ','明るさ'],ARRAY['設定を開く（Win + I）','「システム」→「ディスプレイ」をクリック','「明るさ」のスライダーで調整','または、アクションセンター（Win + A）から素早く変更可能'],ARRAY['night-light','change-brightness-ios','change-brightness-macos'],ARRAY['明るさ','輝度','暗い','まぶしい','ディスプレイ','ブライトネス'],'画面の明るさ（輝度）を調整する方法です。'),
  -- 6. 夜間モード（ナイトライト）を設定する (windows11)
  ('夜間モード（ナイトライト）を設定する','night-light','windows11','23H2','display','beginner',2,ARRAY['ナイトライト','ブルーライト','夜間モード','目に優しい'],ARRAY['設定','システム','ディスプレイ','夜間モード'],ARRAY['設定を開く（Win + I）','「システム」→「ディスプレイ」をクリック','「夜間モード」をオンにする','「強さ」スライダーでブルーライトカットの強さを調整','スケジュール設定で自動ON/OFFも可能'],ARRAY['change-brightness'],ARRAY['ナイトライト','夜間','ブルーライト','目','暖色'],'画面を暖色にしてブルーライトを軽減する設定です。'),
  -- 7. マイクのアクセスを許可する (windows11)
  ('マイクのアクセスを許可する','allow-microphone','windows11','23H2','privacy','beginner',2,ARRAY['マイク許可','マイク使えない','音声入力できない','マイクアクセス'],ARRAY['設定','プライバシーとセキュリティ','マイク'],ARRAY['設定を開く（Win + I）','「プライバシーとセキュリティ」をクリック','「マイク」をクリック','「マイクへのアクセス」をオンにする','使いたいアプリのマイク許可もオンにする'],ARRAY['allow-camera','allow-microphone-ios','allow-microphone-macos'],ARRAY['マイク','音声','許可','プライバシー','Teams','Zoom'],'アプリがマイクを使えるように許可する方法です。'),
  -- 8. カメラのアクセスを許可する (windows11)
  ('カメラのアクセスを許可する','allow-camera','windows11','23H2','privacy','beginner',2,ARRAY['カメラ許可','カメラ使えない','ビデオ通話できない'],ARRAY['設定','プライバシーとセキュリティ','カメラ'],ARRAY['設定を開く（Win + I）','「プライバシーとセキュリティ」をクリック','「カメラ」をクリック','「カメラへのアクセス」をオンにする','使いたいアプリのカメラ許可もオンにする'],ARRAY['allow-microphone'],ARRAY['カメラ','ビデオ','許可','プライバシー','Teams','Zoom'],'アプリがカメラを使えるように許可する方法です。'),
  -- 9. 通知をオフにする (windows11)
  ('通知をオフにする','disable-notifications','windows11','23H2','notification','beginner',2,ARRAY['通知オフ','通知消したい','通知うるさい','集中モード'],ARRAY['設定','システム','通知'],ARRAY['設定を開く（Win + I）','「システム」→「通知」をクリック','全体の通知をオフにするか、アプリ別にオフにする','「応答不可」モードを使えば一時的に通知を止められる'],ARRAY['disable-notifications-ios','disable-notifications-macos'],ARRAY['通知','オフ','消す','応答不可','集中','ノーティフィケーション'],'不要な通知を止める方法です。'),
  -- 10. DNSサーバーを変更する (windows11)
  ('DNSサーバーを変更する','change-dns','windows11','23H2','network','intermediate',5,ARRAY['DNS変更','DNSサーバー','ネット速度改善','1.1.1.1','8.8.8.8'],ARRAY['設定','ネットワークとインターネット','Wi-Fi','プロパティ','DNS サーバーの割り当て'],ARRAY['設定を開く（Win + I）','「ネットワークとインターネット」をクリック','接続中のネットワーク（Wi-Fiなど）のプロパティを開く','「DNS サーバーの割り当て」の「編集」をクリック','「手動」に変更し、希望のDNSアドレスを入力（例: 8.8.8.8）'],ARRAY[]::text[],ARRAY['DNS','ネットワーク','速度','Google DNS','Cloudflare'],'DNSサーバーを手動で変更する方法です。'),
  -- 11. デフォルトアプリを変更する (windows11)
  ('デフォルトアプリを変更する','change-default-app','windows11','23H2','app','beginner',2,ARRAY['既定のアプリ','デフォルトブラウザ','関連付け変更'],ARRAY['設定','アプリ','既定のアプリ'],ARRAY['設定を開く（Win + I）','「アプリ」→「既定のアプリ」をクリック','変更したいアプリまたはファイルの種類を検索','新しいデフォルトアプリを選択'],ARRAY['show-file-extensions'],ARRAY['既定','デフォルト','ブラウザ','関連付け','アプリ'],'ファイルを開くデフォルトアプリを変更する方法です。'),
  -- 12. スタートアップアプリを管理する (windows11)
  ('スタートアップアプリを管理する','manage-startup-apps','windows11','23H2','system','beginner',2,ARRAY['起動時に起動するアプリ','スタートアップ無効','起動遅い','自動起動'],ARRAY['タスクマネージャー','スタートアップ アプリ'],ARRAY['Ctrl + Shift + Esc でタスクマネージャーを開く','「スタートアップ アプリ」タブをクリック','無効にしたいアプリを右クリック','「無効にする」を選択'],ARRAY[]::text[],ARRAY['スタートアップ','自動起動','起動','タスクマネージャー','遅い'],'PCの起動時に自動で立ち上がるアプリを管理する方法です。'),
  -- 13. スリープ時間を変更する (windows11)
  ('スリープ時間を変更する','change-sleep-time','windows11','23H2','system','beginner',2,ARRAY['スリープ設定','画面が消える','電源設定','スリープしない'],ARRAY['設定','システム','電源','スクリーンとスリープ'],ARRAY['設定を開く（Win + I）','「システム」→「電源」をクリック','「スクリーンとスリープ」を展開','スリープの時間をドロップダウンで変更'],ARRAY[]::text[],ARRAY['スリープ','電源','画面消える','省電力','スクリーン'],'PCが自動でスリープに入るまでの時間を変更する方法です。'),
  -- 14. Windowsの壁紙を変更する (windows11)
  ('Windowsの壁紙を変更する','change-wallpaper','windows11','23H2','display','beginner',1,ARRAY['背景変更','デスクトップ背景','壁紙','バックグラウンド'],ARRAY['設定','個人用設定','背景'],ARRAY['デスクトップを右クリック','「個人用設定」をクリック','「背景」をクリック','「画像」「単色」「スライドショー」から選んで設定'],ARRAY[]::text[],ARRAY['壁紙','背景','デスクトップ','個人用設定'],'デスクトップの背景（壁紙）を変更する方法です。'),
  -- 15. タスクバーの位置を変更する (windows11)
  ('タスクバーの位置を変更する','taskbar-position','windows11','23H2','display','beginner',1,ARRAY['タスクバー移動','タスクバー下','タスクバー左','バーの位置'],ARRAY['設定','個人用設定','タスクバー','タスクバーの動作'],ARRAY['設定を開く（Win + I）','「個人用設定」→「タスクバー」をクリック','下にスクロールして「タスクバーの動作」を展開','「タスクバーの配置」で「左揃え」または「中央揃え」を選択'],ARRAY['change-wallpaper'],ARRAY['タスクバー','位置','配置','左揃え','中央'],'タスクバーのアイコンの配置を左右どちらかに変更する方法です。'),
  -- 16. 音量を変更する (windows11)
  ('音量を変更する','change-volume','windows11','23H2','sound','beginner',1,ARRAY['音量設定','ボリューム','音が出ない','音小さい','スピーカー音量'],ARRAY['タスクバー右下','スピーカーアイコン'],ARRAY['タスクバー右下のスピーカーアイコンをクリック','スライダーで音量を調整','またはアクションセンター（Win + A）から調整可能'],ARRAY['set-audio-output'],ARRAY['音量','ボリューム','スピーカー','サウンド','音'],'PCの音量を変更する方法です。'),
  -- 17. 既定のオーディオ出力デバイスを変更する (windows11)
  ('既定のオーディオ出力デバイスを変更する','set-audio-output','windows11','23H2','sound','beginner',2,ARRAY['スピーカー切り替え','ヘッドホン出力','音声出力先','サウンド設定'],ARRAY['設定','システム','サウンド'],ARRAY['設定を開く（Win + I）','「システム」→「サウンド」をクリック','「出力」セクションでデバイスを選択'],ARRAY['change-volume'],ARRAY['オーディオ','出力','スピーカー','ヘッドホン','サウンド'],'音声の出力先（スピーカーやヘッドホン）を切り替える方法です。'),
  -- 18. 画面の解像度を変更する (windows11)
  ('画面の解像度を変更する','change-resolution','windows11','23H2','display','beginner',2,ARRAY['解像度変更','画面サイズ','1080p','4K設定','ディスプレイ解像度'],ARRAY['設定','システム','ディスプレイ','画面の解像度'],ARRAY['設定を開く（Win + I）','「システム」→「ディスプレイ」をクリック','下にスクロールして「画面の解像度」を選択','ドロップダウンから解像度を選ぶ'],ARRAY['change-brightness'],ARRAY['解像度','1080p','4K','ディスプレイ','画面'],'画面の解像度（ピクセル数）を変更する方法です。'),
  -- 19. Windowsのバージョンを確認する (windows11)
  ('Windowsのバージョンを確認する','check-windows-version','windows11','23H2','system','beginner',1,ARRAY['Windowsバージョン確認','ビルド番号','OS確認','winver'],ARRAY['設定','システム','バージョン情報'],ARRAY['Win + R を押して「winver」と入力してEnter','またはWin + I で設定を開き「システム」→「バージョン情報」を確認'],ARRAY[]::text[],ARRAY['バージョン','確認','winver','ビルド','システム'],'Windowsのバージョンやビルド番号を確認する方法です。'),
  -- 20. Windowsアップデートを手動で確認する (windows11)
  ('Windowsアップデートを手動で確認する','check-windows-update','windows11','23H2','system','beginner',3,ARRAY['アップデート確認','Windows更新','WU','更新プログラム'],ARRAY['設定','Windows Update'],ARRAY['設定を開く（Win + I）','「Windows Update」をクリック','「更新プログラムの確認」ボタンをクリック'],ARRAY[]::text[],ARRAY['アップデート','更新','Windows Update','最新'],'Windowsのアップデートを手動で確認・適用する方法です。'),
  -- 21. キーボードの言語・入力ソースを追加する (windows11)
  ('キーボードの言語・入力ソースを追加する','add-keyboard-language','windows11','23H2','input','intermediate',3,ARRAY['英語キーボード','言語追加','IME','入力方式'],ARRAY['設定','時刻と言語','言語と地域'],ARRAY['設定を開く（Win + I）','「時刻と言語」→「言語と地域」をクリック','「言語を追加する」をクリック','追加したい言語を検索して選択'],ARRAY[]::text[],ARRAY['キーボード','言語','英語','IME','入力'],'英語キーボードなど追加の言語・入力ソースを設定する方法です。'),
  -- 22. Bluetooth機器を接続する (ios)
  ('Bluetooth機器を接続する','connect-bluetooth-ios','ios','17','bluetooth','beginner',3,ARRAY['Bluetooth接続','ブルートゥース','AirPods接続','イヤホン接続'],ARRAY['設定','Bluetooth'],ARRAY['「設定」アプリを開く','「Bluetooth」をタップ','Bluetoothがオンになっていることを確認','接続したい機器をペアリングモードにする','「その他のデバイス」に表示されたらタップして接続'],ARRAY['connect-bluetooth','connect-bluetooth-macos'],ARRAY['Bluetooth','ブルートゥース','AirPods','ペアリング','ワイヤレス'],'iPhoneでBluetooth機器を接続する方法です。'),
  -- 23. 画面の明るさを変更する (ios)
  ('画面の明るさを変更する','change-brightness-ios','ios','17','display','beginner',1,ARRAY['明るさ','画面暗く','まぶしい','輝度'],ARRAY['設定','画面表示と明るさ'],ARRAY['「設定」アプリを開く','「画面表示と明るさ」をタップ','「明るさ」スライダーで調整','またはコントロールセンターで素早く変更可能（右上から下スワイプ）'],ARRAY['change-brightness','change-brightness-macos','night-shift-ios'],ARRAY['明るさ','輝度','暗い','まぶしい','ディスプレイ'],'iPhoneの画面の明るさを調整する方法です。'),
  -- 24. Night Shift（ブルーライトカット）を設定する (ios)
  ('Night Shift（ブルーライトカット）を設定する','night-shift-ios','ios','17','display','beginner',2,ARRAY['ナイトシフト','ブルーライト','夜間モード','目に優しい'],ARRAY['設定','画面表示と明るさ','Night Shift'],ARRAY['「設定」アプリを開く','「画面表示と明るさ」をタップ','「Night Shift」をタップ','「時間指定」をオンにするか、「手動で明日まで有効にする」をオンにする','「色温度」スライダーで暖色の強さを調整'],ARRAY['change-brightness-ios'],ARRAY['Night Shift','ナイトシフト','ブルーライト','夜間','暖色'],'画面を暖色にしてブルーライトを軽減する設定です。'),
  -- 25. マイクのアクセスを許可する (ios)
  ('マイクのアクセスを許可する','allow-microphone-ios','ios','17','privacy','beginner',2,ARRAY['マイク許可','マイク使えない','音声入力','マイクアクセス'],ARRAY['設定','プライバシーとセキュリティ','マイク'],ARRAY['「設定」アプリを開く','「プライバシーとセキュリティ」をタップ','「マイク」をタップ','マイクを許可したいアプリのスイッチをオンにする'],ARRAY['allow-microphone','allow-microphone-macos'],ARRAY['マイク','音声','許可','プライバシー'],'アプリがマイクを使えるように許可する方法です。'),
  -- 26. 通知をオフにする (ios)
  ('通知をオフにする','disable-notifications-ios','ios','17','notification','beginner',2,ARRAY['通知オフ','通知消したい','通知うるさい','集中モード','おやすみモード'],ARRAY['設定','通知'],ARRAY['「設定」アプリを開く','「通知」をタップ','通知をオフにしたいアプリをタップ','「通知を許可」のスイッチをオフにする','全体を止めたい場合は「集中モード」を使う'],ARRAY['disable-notifications','disable-notifications-macos'],ARRAY['通知','オフ','消す','集中モード','おやすみ'],'不要な通知を止める方法です。'),
  -- 27. Wi-Fiに接続する (ios)
  ('Wi-Fiに接続する','connect-wifi-ios','ios','17','network','beginner',2,ARRAY['Wi-Fi接続','WiFi','ワイファイ','ネット繋がらない'],ARRAY['設定','Wi-Fi'],ARRAY['「設定」アプリを開く','「Wi-Fi」をタップ','Wi-Fiをオンにする','接続したいネットワーク名をタップ','パスワードを入力して「接続」をタップ'],ARRAY[]::text[],ARRAY['Wi-Fi','WiFi','ワイファイ','接続','ネットワーク','パスワード'],'iPhoneをWi-Fiに接続する方法です。'),
  -- 28. FaceIDを設定する (ios)
  ('FaceIDを設定する','setup-faceid','ios','17','security','beginner',3,ARRAY['顔認証','FaceID設定','顔ロック解除','顔で開く'],ARRAY['設定','Face IDとパスコード'],ARRAY['「設定」アプリを開く','「Face IDとパスコード」をタップ','「Face IDを設定」をタップ','画面の指示に従って顔をスキャン'],ARRAY['setup-touchid'],ARRAY['FaceID','顔認証','生体認証','セキュリティ','ロック'],'iPhoneのFace IDを設定する方法です。'),
  -- 29. TouchIDを設定する (ios)
  ('TouchIDを設定する','setup-touchid','ios','17','security','beginner',3,ARRAY['指紋認証','TouchID設定','指で開く','指紋ロック'],ARRAY['設定','Touch IDとパスコード'],ARRAY['「設定」アプリを開く','「Touch IDとパスコード」をタップ','「指紋を追加」をタップ','ホームボタンに指を置いてスキャン'],ARRAY['setup-faceid'],ARRAY['TouchID','指紋','生体認証','セキュリティ'],'iPhoneの指紋認証（Touch ID）を設定する方法です。'),
  -- 30. モバイルデータ通信をオフにする (ios)
  ('モバイルデータ通信をオフにする','disable-cellular-ios','ios','17','network','beginner',1,ARRAY['データ通信オフ','通信量節約','モバイル通信','4G LTE'],ARRAY['設定','モバイル通信'],ARRAY['「設定」アプリを開く','「モバイル通信」をタップ','「モバイルデータ通信」をオフにする'],ARRAY['connect-wifi-ios'],ARRAY['モバイルデータ','通信量','LTE','4G','5G'],'モバイルデータ通信をオフにしてデータ消費を抑える方法です。'),
  -- 31. 位置情報サービスを管理する (ios)
  ('位置情報サービスを管理する','location-services-ios','ios','17','privacy','beginner',2,ARRAY['位置情報オフ','GPS設定','プライバシー位置','場所の許可'],ARRAY['設定','プライバシーとセキュリティ','位置情報サービス'],ARRAY['「設定」アプリを開く','「プライバシーとセキュリティ」をタップ','「位置情報サービス」をタップ','全体のオン/オフ、またはアプリ別に設定'],ARRAY['allow-microphone-ios'],ARRAY['位置情報','GPS','プライバシー','場所'],'アプリの位置情報アクセスを管理する方法です。'),
  -- 32. スクリーンタイムを設定する (ios)
  ('スクリーンタイムを設定する','screen-time-ios','ios','17','system','intermediate',5,ARRAY['使用時間制限','スクリーンタイム','子供制限','アプリ制限'],ARRAY['設定','スクリーンタイム'],ARRAY['「設定」アプリを開く','「スクリーンタイム」をタップ','「スクリーンタイムをオンにする」をタップ','アプリカテゴリ別の使用時間制限などを設定'],ARRAY[]::text[],ARRAY['スクリーンタイム','使用時間','制限','子供','ペアレンタル'],'iPhoneの使用時間を管理・制限する方法です。'),
  -- 33. ストレージの使用状況を確認する (ios)
  ('ストレージの使用状況を確認する','check-storage-ios','ios','17','storage','beginner',1,ARRAY['容量確認','空き容量','ストレージ不足','容量足りない'],ARRAY['設定','一般','iPhoneストレージ'],ARRAY['「設定」アプリを開く','「一般」をタップ','「iPhoneストレージ」をタップ','アプリ別の使用容量を確認'],ARRAY[]::text[],ARRAY['ストレージ','容量','空き','GB','保存'],'iPhoneのストレージ（容量）の使用状況を確認する方法です。'),
  -- 34. Bluetooth機器を接続する (macos)
  ('Bluetooth機器を接続する','connect-bluetooth-macos','macos','Sonoma','bluetooth','beginner',3,ARRAY['Bluetooth接続','ブルートゥース','AirPods接続','ワイヤレス接続'],ARRAY['システム設定','Bluetooth'],ARRAY['Appleメニュー（）→「システム設定」を開く','「Bluetooth」をクリック','Bluetoothがオンになっていることを確認','接続したい機器をペアリングモードにする','「近くのデバイス」に表示されたら「接続」をクリック'],ARRAY['connect-bluetooth','connect-bluetooth-ios'],ARRAY['Bluetooth','ブルートゥース','AirPods','ペアリング','ワイヤレス'],'MacでBluetooth機器を接続する方法です。'),
  -- 35. 画面の明るさを変更する (macos)
  ('画面の明るさを変更する','change-brightness-macos','macos','Sonoma','display','beginner',1,ARRAY['明るさ','画面暗く','まぶしい','輝度'],ARRAY['システム設定','ディスプレイ'],ARRAY['Appleメニュー（）→「システム設定」を開く','「ディスプレイ」をクリック','「輝度」スライダーで調整','またはキーボードの輝度キー（F1/F2）で変更可能'],ARRAY['change-brightness','change-brightness-ios'],ARRAY['明るさ','輝度','暗い','まぶしい','ディスプレイ'],'Macの画面の明るさを調整する方法です。'),
  -- 36. マイクのアクセスを許可する (macos)
  ('マイクのアクセスを許可する','allow-microphone-macos','macos','Sonoma','privacy','beginner',2,ARRAY['マイク許可','マイク使えない','音声入力','マイクアクセス'],ARRAY['システム設定','プライバシーとセキュリティ','マイク'],ARRAY['Appleメニュー（）→「システム設定」を開く','「プライバシーとセキュリティ」をクリック','「マイク」をクリック','マイクを許可したいアプリのスイッチをオンにする'],ARRAY['allow-microphone','allow-microphone-ios'],ARRAY['マイク','音声','許可','プライバシー'],'アプリがマイクを使えるように許可する方法です。'),
  -- 37. 通知をオフにする (macos)
  ('通知をオフにする','disable-notifications-macos','macos','Sonoma','notification','beginner',2,ARRAY['通知オフ','通知消したい','通知うるさい','集中モード','おやすみモード'],ARRAY['システム設定','通知'],ARRAY['Appleメニュー（）→「システム設定」を開く','「通知」をクリック','通知をオフにしたいアプリをクリック','「通知を許可」のスイッチをオフにする','全体を止めたい場合は「集中モード」を使う'],ARRAY['disable-notifications','disable-notifications-ios'],ARRAY['通知','オフ','消す','集中モード','おやすみ'],'不要な通知を止める方法です。'),
  -- 38. Dockを自動的に隠す (macos)
  ('Dockを自動的に隠す','auto-hide-dock','macos','Sonoma','display','beginner',1,ARRAY['Dock非表示','Dock隠す','画面広く','Dock自動'],ARRAY['システム設定','デスクトップとDock'],ARRAY['Appleメニュー（）→「システム設定」を開く','「デスクトップとDock」をクリック','「Dockを自動的に表示/非表示」をオンにする'],ARRAY[]::text[],ARRAY['Dock','非表示','隠す','自動','デスクトップ'],'Dockを自動的に隠して画面を広く使う方法です。'),
  -- 39. Mission Controlでウィンドウを管理する (macos)
  ('Mission Controlでウィンドウを管理する','mission-control','macos','Sonoma','system','beginner',2,ARRAY['ミッションコントロール','ウィンドウ一覧','仮想デスクトップ'],ARRAY['システム設定','デスクトップとDock','Mission Control'],ARRAY['トラックパッドで3本指上スワイプ（またはControl + ↑）','すべてのウィンドウが一覧表示される','上部にスペース（仮想デスクトップ）を追加可能'],ARRAY['auto-hide-dock'],ARRAY['Mission Control','ウィンドウ','仮想デスクトップ','スペース'],'すべてのウィンドウを一覧表示・整理する方法です。'),
  -- 40. トラックパッドのジェスチャーを設定する (macos)
  ('トラックパッドのジェスチャーを設定する','trackpad-gestures','macos','Sonoma','input','beginner',3,ARRAY['トラックパッド設定','スクロール方向','ジェスチャー','タップでクリック'],ARRAY['システム設定','トラックパッド'],ARRAY['Appleメニュー（）→「システム設定」を開く','「トラックパッド」をクリック','「ポイントとクリック」「スクロールとズーム」「その他のジェスチャー」タブで設定'],ARRAY[]::text[],ARRAY['トラックパッド','ジェスチャー','スクロール','タップ','スワイプ'],'トラックパッドのジェスチャーをカスタマイズする方法です。'),
  -- 41. ストレージの使用状況を確認する (macos)
  ('ストレージの使用状況を確認する','check-storage-macos','macos','Sonoma','storage','beginner',1,ARRAY['容量確認','空き容量','ストレージ不足','ディスク容量'],ARRAY['Appleメニュー','このMacについて','ストレージ'],ARRAY['Appleメニュー（）をクリック','「このMacについて」をクリック','「ストレージ」タブをクリック','カテゴリ別の使用容量を確認'],ARRAY[]::text[],ARRAY['ストレージ','容量','空き','ディスク','GB'],'Macのストレージ（容量）の使用状況を確認する方法です。'),
  -- 42. スクリーンショットを撮る (macos)
  ('スクリーンショットを撮る','screenshot-macos','macos','Sonoma','system','beginner',1,ARRAY['スクショ','画面キャプチャ','画面保存','スクリーンキャプチャ'],ARRAY['キーボードショートカット'],ARRAY['全画面：Shift + Command + 3','範囲指定：Shift + Command + 4 → ドラッグ','ウィンドウ指定：Shift + Command + 4 → Space → クリック','画面収録なども含めたパネル：Shift + Command + 5'],ARRAY[]::text[],ARRAY['スクリーンショット','スクショ','キャプチャ','Command+Shift+3','画面'],'Macでスクリーンショットを撮る方法です。'),
  -- 43. Spotlight検索を使う (macos)
  ('Spotlight検索を使う','spotlight-search','macos','Sonoma','system','beginner',1,ARRAY['スポットライト','ファイル検索','アプリ起動','Command+Space'],ARRAY['キーボードショートカット','Command + Space'],ARRAY['Command + Space でSpotlightを開く','検索したいファイル名・アプリ名・計算式などを入力','Enterで開く、またはCommand+Enterでファインダーで表示'],ARRAY[]::text[],ARRAY['Spotlight','検索','ファイル','アプリ','Command+Space'],'MacのSpotlight検索でファイルやアプリをすばやく開く方法です。')
ON CONFLICT (slug,os) DO UPDATE SET
  title=EXCLUDED.title, version=EXCLUDED.version, category=EXCLUDED.category,
  difficulty=EXCLUDED.difficulty, estimate_minutes=EXCLUDED.estimate_minutes,
  aliases=EXCLUDED.aliases, path=EXCLUDED.path, steps=EXCLUDED.steps,
  related_slugs=EXCLUDED.related_slugs, keywords=EXCLUDED.keywords,
  description=EXCLUDED.description, updated_at=NOW();

-- 件数確認
SELECT os, count(*) FROM settings GROUP BY os ORDER BY os;
