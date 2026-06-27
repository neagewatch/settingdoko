-- =============================================
-- 設定どこ？ - 業務ソフト設定データ
-- 合計37件
-- Outlook, Word, Excel, PowerPoint, Teams, Power Automate, その他
-- =============================================

INSERT INTO settings
  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)
VALUES
  -- 1. Outlookでメールアカウントを追加する
  ('Outlookでメールアカウントを追加する','outlook-add-account','windows11','Microsoft 365','app','beginner',5,ARRAY['Outlookアカウント追加','メール設定','Gmail Outlook','Exchange設定','IMAP設定'],ARRAY['Outlook','ファイル','アカウントの追加'],ARRAY['Outlookを開く','「ファイル」タブをクリック','「アカウントの追加」をクリック','メールアドレスを入力して「接続」をクリック','パスワードを入力してサインイン完了'],ARRAY['outlook-signature','outlook-rules'],ARRAY['Outlook','メール','アカウント','追加','Gmail','Exchange','IMAP'],'Outlookに新しいメールアカウント（Gmail・Exchange等）を追加する方法です。'),
  -- 2. Outlookで署名を設定する
  ('Outlookで署名を設定する','outlook-signature','windows11','Microsoft 365','app','beginner',5,ARRAY['Outlook署名','メール署名','自動署名','サインオフ','署名設定'],ARRAY['Outlook','ファイル','オプション','メール','署名'],ARRAY['Outlookを開く','「ファイル」→「オプション」をクリック','「メール」→「署名」をクリック','「新規作成」で署名を作成','名前を入力して署名のテキストを記入','「新しいメッセージ」と「返信/転送」の既定署名を設定して「OK」'],ARRAY['outlook-add-account'],ARRAY['署名','Outlook','メール','自動署名','フッター','サインオフ'],'Outlookのメール署名を設定して自動で挿入する方法です。'),
  -- 3. Outlookで受信トレイのルールを作成する
  ('Outlookで受信トレイのルールを作成する','outlook-rules','windows11','Microsoft 365','app','intermediate',5,ARRAY['Outlookルール','メール振り分け','自動振り分け','フィルター','受信フォルダ'],ARRAY['Outlook','ファイル','情報','ルールと通知の管理'],ARRAY['Outlookを開く','「ファイル」→「情報」→「ルールと通知の管理」をクリック','「新しいルール」をクリック','条件（差出人・件名・キーワード等）を選択','アクション（フォルダに移動・削除等）を設定して「完了」'],ARRAY['outlook-add-account','outlook-signature'],ARRAY['ルール','振り分け','フィルター','Outlook','自動','受信','トレイ'],'メールを条件で自動振り分けするルールを作成する方法です。'),
  -- 4. Outlookで不在通知（自動応答）を設定する
  ('Outlookで不在通知（自動応答）を設定する','outlook-out-of-office','windows11','Microsoft 365','app','beginner',3,ARRAY['不在通知','自動応答','休暇中','留守番メール','OOF','Out of Office'],ARRAY['Outlook','ファイル','自動応答'],ARRAY['Outlookを開く','「ファイル」をクリック','「自動応答（不在通知）」をクリック','「自動応答を送信する」を選択','期間と返信メッセージを入力','「OK」をクリック'],ARRAY['outlook-signature','outlook-rules'],ARRAY['不在通知','自動応答','休暇','OOF','Out of Office','メール'],'不在時に自動で返信する不在通知（自動応答）を設定する方法です。'),
  -- 5. Outlookの迷惑メールフィルターを設定する
  ('Outlookの迷惑メールフィルターを設定する','outlook-junk-filter','windows11','Microsoft 365','app','beginner',3,ARRAY['迷惑メール','スパム','フィルター','Outlook迷惑メール','ジャンクメール'],ARRAY['Outlook','ホーム','迷惑メール','迷惑メールのオプション'],ARRAY['Outlookを開く','「ホーム」タブの「迷惑メール」をクリック','「迷惑メールのオプション」をクリック','保護レベルを選択（低・高・セーフリストのみ等）','「OK」をクリック'],ARRAY['outlook-rules'],ARRAY['迷惑メール','スパム','フィルター','ジャンク','Outlook','受信'],'Outlookの迷惑メールフィルターを設定する方法です。'),
  -- 6. Outlookでフォルダを作成して整理する
  ('Outlookでフォルダを作成して整理する','outlook-create-folder','windows11','Microsoft 365','app','beginner',2,ARRAY['Outlookフォルダ','メールフォルダ','フォルダ作成','メール整理','振り分け先'],ARRAY['Outlook','左ペイン','右クリック','新しいフォルダー'],ARRAY['Outlookを開く','左側のフォルダーペインで「受信トレイ」を右クリック','「新しいフォルダー」をクリック','フォルダ名を入力してEnter','ルール設定でこのフォルダに自動振り分けも可能'],ARRAY['outlook-rules','outlook-add-account'],ARRAY['フォルダ','整理','作成','Outlook','メール','振り分け'],'Outlookでメール整理用のフォルダを作成する方法です。'),
  -- 7. Wordでページ番号を挿入する
  ('Wordでページ番号を挿入する','word-page-numbers','windows11','Microsoft 365','app','beginner',2,ARRAY['ページ番号','Word番号','フッターページ数','ノンブル','ページ数表示'],ARRAY['Word','挿入','ページ番号'],ARRAY['Wordを開く','「挿入」タブをクリック','「ページ番号」をクリック','表示位置（ページの上部・下部・余白）を選択','番号のスタイルを選択'],ARRAY['word-header-footer','word-table-of-contents'],ARRAY['ページ番号','Word','挿入','フッター','番号','ページ'],'Wordの文書にページ番号を挿入する方法です。'),
  -- 8. Wordで目次を自動作成する
  ('Wordで目次を自動作成する','word-table-of-contents','windows11','Microsoft 365','app','intermediate',5,ARRAY['目次作成','Word目次','自動目次','見出し','目次自動'],ARRAY['Word','参考資料','目次'],ARRAY['見出しスタイル（見出し1・見出し2）を各タイトルに適用する','目次を挿入したい場所にカーソルを置く','「参考資料」タブをクリック','「目次」をクリック','スタイルを選択して挿入','内容変更後は目次上で右クリック→「フィールドの更新」で更新'],ARRAY['word-page-numbers'],ARRAY['目次','Word','自動','見出し','参考資料','スタイル'],'Wordで見出しスタイルを使って目次を自動作成する方法です。'),
  -- 9. Wordでヘッダーとフッターを設定する
  ('Wordでヘッダーとフッターを設定する','word-header-footer','windows11','Microsoft 365','app','beginner',3,ARRAY['ヘッダー','フッター','Word上部','文書番号','ドキュメント名'],ARRAY['Word','挿入','ヘッダー または フッター'],ARRAY['「挿入」タブをクリック','「ヘッダー」または「フッター」をクリック','スタイルを選択','テキストを入力（文書名・日付・ページ番号等）','本文をダブルクリックしてヘッダー編集モードを終了'],ARRAY['word-page-numbers'],ARRAY['ヘッダー','フッター','Word','挿入','ページ','文書'],'Wordにヘッダーとフッターを設定する方法です。'),
  -- 10. Wordで文字数・行数を設定する
  ('Wordで文字数・行数を設定する','word-character-count','windows11','Microsoft 365','app','beginner',2,ARRAY['文字数設定','行数設定','1行の文字数','Wordページ設定','原稿用紙'],ARRAY['Word','レイアウト','ページ設定','文字数と行数'],ARRAY['「レイアウト」タブをクリック','「ページ設定」グループ右下の矢印（ダイアログ起動）をクリック','「文字数と行数」タブをクリック','「文字数と行数を指定する」を選択','1行の文字数と1ページの行数を入力して「OK」'],ARRAY['word-page-numbers','word-header-footer'],ARRAY['文字数','行数','ページ設定','Word','原稿','レイアウト'],'Wordで1行あたりの文字数と1ページあたりの行数を設定する方法です。'),
  -- 11. Wordの変更履歴を使う
  ('Wordの変更履歴を使う','word-track-changes','windows11','Microsoft 365','app','intermediate',3,ARRAY['変更履歴','Track Changes','赤字','校正','差分表示','変更を追跡'],ARRAY['Word','校閲','変更履歴の記録'],ARRAY['「校閲」タブをクリック','「変更履歴の記録」をクリックしてオンにする','文書を編集すると変更箇所が赤字で表示される','「変更箇所」→「次へ」で変更を確認','「承諾」または「元に戻す」で変更を受け入れ/却下'],ARRAY['word-table-of-contents'],ARRAY['変更履歴','Track Changes','校正','差分','赤字','Word','校閲'],'Wordの変更履歴（Track Changes）で文書の編集内容を追跡する方法です。'),
  -- 12. Wordでテンプレートを保存する
  ('Wordでテンプレートを保存する','word-save-template','windows11','Microsoft 365','app','intermediate',3,ARRAY['テンプレート保存','Word雛形','書式テンプレート','dotxファイル','ひな形'],ARRAY['Word','ファイル','名前を付けて保存','Wordテンプレート'],ARRAY['書式設定済みのWordファイルを開く','「ファイル」→「名前を付けて保存」をクリック','ファイルの種類を「Wordテンプレート（*.dotx）」に変更','ファイル名を入力して保存','次回からこのテンプレートを使うには「新規作成」→「個人用」から選択'],ARRAY['word-header-footer'],ARRAY['テンプレート','Word','保存','雛形','dotx','書式'],'Wordのファイルをテンプレート（雛形）として保存して再利用する方法です。'),
  -- 13. Excelでセルを結合する
  ('Excelでセルを結合する','excel-merge-cells','windows11','Microsoft 365','app','beginner',1,ARRAY['セル結合','Excel結合','セルをつなぐ','結合して中央揃え','セル合体'],ARRAY['Excel','ホーム','結合して中央揃え'],ARRAY['結合したいセルを選択する（ドラッグで複数選択）','「ホーム」タブをクリック','「結合して中央揃え」ボタンをクリック','解除したい場合は再度「結合して中央揃え」をクリック'],ARRAY['excel-freeze-panes','excel-filter'],ARRAY['セル','結合','Excel','中央揃え','ホーム','マージ'],'Excelで複数のセルを1つに結合する方法です。'),
  -- 14. Excelでフィルターを設定する
  ('Excelでフィルターを設定する','excel-filter','windows11','Microsoft 365','app','beginner',2,ARRAY['フィルター','絞り込み','オートフィルター','データ絞り込み','条件フィルター'],ARRAY['Excel','データ','フィルター'],ARRAY['データが入力されているセルをクリック','「データ」タブをクリック','「フィルター」をクリック','各列のヘッダーにドロップダウン矢印が表示される','矢印をクリックして絞り込み条件を選択'],ARRAY['excel-sort','excel-pivot-table'],ARRAY['フィルター','絞り込み','Excel','データ','オートフィルター','条件'],'Excelのフィルター機能でデータを絞り込む方法です。'),
  -- 15. Excelでウィンドウ枠を固定する
  ('Excelでウィンドウ枠を固定する','excel-freeze-panes','windows11','Microsoft 365','app','beginner',2,ARRAY['ウィンドウ枠固定','行固定','列固定','ヘッダー固定','スクロール固定'],ARRAY['Excel','表示','ウィンドウ枠の固定'],ARRAY['固定したい行の下・列の右のセルをクリック（例：2行目と1列目を固定するならB2を選択）','「表示」タブをクリック','「ウィンドウ枠の固定」→「ウィンドウ枠の固定」をクリック','スクロールしても固定した行・列が表示され続ける'],ARRAY['excel-filter','excel-merge-cells'],ARRAY['ウィンドウ枠','固定','Excel','ヘッダー','スクロール','行','列'],'Excelでスクロールしてもヘッダー行・列が見えるように固定する方法です。'),
  -- 16. Excelでピボットテーブルを作成する
  ('Excelでピボットテーブルを作成する','excel-pivot-table','windows11','Microsoft 365','app','intermediate',10,ARRAY['ピボットテーブル','集計表','クロス集計','Excel集計','データ分析'],ARRAY['Excel','挿入','ピボットテーブル'],ARRAY['集計したいデータ範囲を選択','「挿入」タブをクリック','「ピボットテーブル」をクリック','新しいシートまたは既存のシートを選択して「OK」','右側の「ピボットテーブルのフィールド」でドラッグして行・列・値を設定'],ARRAY['excel-filter','excel-sort'],ARRAY['ピボット','テーブル','集計','Excel','クロス','分析','データ'],'Excelのピボットテーブルで大量データを素早く集計・分析する方法です。'),
  -- 17. Excelで並べ替えをする
  ('Excelで並べ替えをする','excel-sort','windows11','Microsoft 365','app','beginner',2,ARRAY['並べ替え','ソート','昇順','降順','Excel並べ替え','データ整列'],ARRAY['Excel','データ','並べ替え'],ARRAY['並べ替えたいデータ範囲内のセルをクリック','「データ」タブをクリック','「昇順」（A→Z）または「降順」（Z→A）をクリック','複数条件で並べ替える場合は「並べ替え」ボタンから詳細設定'],ARRAY['excel-filter','excel-pivot-table'],ARRAY['並べ替え','ソート','昇順','降順','Excel','データ','整列'],'Excelのデータを昇順・降順で並べ替える方法です。'),
  -- 18. ExcelでVLOOKUPを使う
  ('ExcelでVLOOKUPを使う','excel-vlookup','windows11','Microsoft 365','app','intermediate',10,ARRAY['VLOOKUP','縦検索','Excel検索','関数VLOOKUP','データ検索','参照'],ARRAY['Excel','数式バー','=VLOOKUP()'],ARRAY['検索結果を表示したいセルをクリック','数式バーに「=VLOOKUP(」と入力','検索値（例：A2）を指定','範囲（例：$D$2:$F$100）を指定','列番号（範囲の左から何列目か）を指定','検索方法（0：完全一致）を入力して Enter','例：=VLOOKUP(A2,$D$2:$F$100,2,0)'],ARRAY['excel-pivot-table','excel-filter'],ARRAY['VLOOKUP','関数','検索','参照','Excel','縦','データ'],'ExcelのVLOOKUP関数で別の表からデータを検索・参照する方法です。'),
  -- 19. Excelでグラフを作成する
  ('Excelでグラフを作成する','excel-create-chart','windows11','Microsoft 365','app','beginner',5,ARRAY['グラフ作成','Excel棒グラフ','円グラフ','折れ線グラフ','チャート','グラフ挿入'],ARRAY['Excel','挿入','グラフ'],ARRAY['グラフにしたいデータ範囲を選択','「挿入」タブをクリック','グラフの種類（棒・円・折れ線等）を選択','グラフが挿入される','グラフをクリックして「グラフのデザイン」タブからスタイルや色を変更'],ARRAY['excel-pivot-table','excel-filter'],ARRAY['グラフ','チャート','Excel','棒グラフ','円グラフ','折れ線','挿入'],'Excelでデータをグラフ（棒・円・折れ線等）に変換する方法です。'),
  -- 20. Excelでシートを保護する
  ('Excelでシートを保護する','excel-protect-sheet','windows11','Microsoft 365','app','intermediate',3,ARRAY['シート保護','Excel編集禁止','セル保護','パスワード保護','編集ロック'],ARRAY['Excel','校閲','シートの保護'],ARRAY['「校閲」タブをクリック','「シートの保護」をクリック','保護の設定（許可する操作）を選択','パスワードを設定（任意）','「OK」をクリック','解除は「シート保護の解除」からパスワードを入力して解除'],ARRAY['excel-create-chart','word-track-changes'],ARRAY['シート保護','Excel','パスワード','編集禁止','ロック','セル'],'Excelのシートを保護して不意の編集を防ぐ方法です。'),
  -- 21. PowerPointでスライドマスターを編集する
  ('PowerPointでスライドマスターを編集する','ppt-slide-master','windows11','Microsoft 365','app','intermediate',10,ARRAY['スライドマスター','PowerPoint書式','統一デザイン','マスタースライド','テーマ編集'],ARRAY['PowerPoint','表示','スライドマスター'],ARRAY['「表示」タブをクリック','「スライドマスター」をクリック','最上部のマスタースライドを選択','フォント・色・背景・ロゴを設定','「マスター表示を閉じる」をクリック','全スライドに統一デザインが適用される'],ARRAY['ppt-animations','ppt-presenter-view'],ARRAY['スライドマスター','PowerPoint','デザイン','統一','マスター','テーマ'],'スライドマスターを編集して全スライドに統一デザインを適用する方法です。'),
  -- 22. PowerPointでアニメーションを設定する
  ('PowerPointでアニメーションを設定する','ppt-animations','windows11','Microsoft 365','app','beginner',5,ARRAY['アニメーション','スライドアニメ','フェードイン','スライドイン','PowerPointアニメ'],ARRAY['PowerPoint','アニメーション','アニメーションの追加'],ARRAY['アニメーションを付けたいオブジェクト（テキスト・画像等）をクリック','「アニメーション」タブをクリック','「アニメーションの追加」でエフェクトを選択','「プレビュー」で確認','「効果のオプション」で方向や速度を調整'],ARRAY['ppt-slide-master','ppt-presenter-view'],ARRAY['アニメーション','PowerPoint','エフェクト','フェード','スライドイン','動き'],'PowerPointのスライドにアニメーション効果を設定する方法です。'),
  -- 23. PowerPointで発表者ビューを使う
  ('PowerPointで発表者ビューを使う','ppt-presenter-view','windows11','Microsoft 365','app','beginner',3,ARRAY['発表者ビュー','プレゼンモード','スピーカービュー','ノート表示','発表者ツール'],ARRAY['PowerPoint','スライドショー','発表者ツールを使用する'],ARRAY['「スライドショー」タブをクリック','「発表者ツールを使用する」にチェックを入れる','「最初から」または「現在のスライドから」でスライドショーを開始','発表者画面には現在のスライド・次のスライド・ノートが表示される'],ARRAY['ppt-animations','ppt-slide-master'],ARRAY['発表者ビュー','プレゼン','ノート','スピーカー','スライドショー','PowerPoint'],'プレゼン中に発表者だけにノートや次のスライドを表示する方法です。'),
  -- 24. PowerPointでPDFとして保存する
  ('PowerPointでPDFとして保存する','ppt-save-as-pdf','windows11','Microsoft 365','app','beginner',2,ARRAY['PDF保存','PowerPointをPDF','スライドPDF','エクスポート','PDF変換'],ARRAY['PowerPoint','ファイル','エクスポート','PDF/XPSドキュメントの作成'],ARRAY['「ファイル」タブをクリック','「エクスポート」をクリック','「PDF/XPSドキュメントの作成」をクリック','ファイル名と保存場所を選択','「発行」をクリック'],ARRAY['ppt-slide-master','word-save-template'],ARRAY['PDF','保存','PowerPoint','エクスポート','変換','スライド'],'PowerPointのスライドをPDFファイルとして保存する方法です。'),
  -- 25. Teamsで会議を予約する
  ('Teamsで会議を予約する','teams-schedule-meeting','windows11','Microsoft 365','app','beginner',3,ARRAY['Teams会議','会議予約','Teams予定','オンライン会議','ミーティング設定'],ARRAY['Teams','カレンダー','新しい会議'],ARRAY['Teamsを開く','左側の「カレンダー」をクリック','右上の「新しい会議」をクリック','タイトル・日時・参加者のメールアドレスを入力','「送信」をクリックして招待を送る'],ARRAY['teams-background','teams-mute','allow-microphone'],ARRAY['Teams','会議','予約','カレンダー','ミーティング','スケジュール'],'Microsoft Teamsでオンライン会議を予約・招待する方法です。'),
  -- 26. Teamsで背景を変更する
  ('Teamsで背景を変更する','teams-background','windows11','Microsoft 365','app','beginner',2,ARRAY['Teams背景','バーチャル背景','背景ぼかし','背景変更','仮想背景'],ARRAY['Teams','会議中','その他','ビデオエフェクトを適用する'],ARRAY['Teams会議に参加する','画面上部の「…（その他）」をクリック','「ビデオエフェクトを適用する」をクリック','「背景のぼかし」または好みの背景画像を選択','カスタム背景は「追加」から画像をアップロード'],ARRAY['teams-schedule-meeting','allow-camera'],ARRAY['背景','Teams','バーチャル','ぼかし','仮想背景','ビデオ'],'Teams会議中に背景をぼかしたり画像に変更する方法です。'),
  -- 27. Teamsでマイクとカメラをミュートにする
  ('Teamsでマイクとカメラをミュートにする','teams-mute','windows11','Microsoft 365','app','beginner',1,ARRAY['Teamsミュート','マイクオフ','カメラオフ','ビデオオフ','ミュート設定'],ARRAY['Teams','会議中','マイク/カメラアイコン'],ARRAY['会議中の画面下部のツールバーを確認','マイクアイコンをクリックでミュート/解除（Ctrl + Shift + M）','カメラアイコンをクリックでビデオオフ/オン（Ctrl + Shift + O）','会議参加前の画面でも事前にオン/オフ設定が可能'],ARRAY['teams-schedule-meeting','allow-microphone','allow-camera'],ARRAY['ミュート','マイク','カメラ','Teams','オフ','会議','ビデオ'],'Teams会議中にマイクやカメラをミュートにする方法です。'),
  -- 28. Teamsでチャンネルを作成する
  ('Teamsでチャンネルを作成する','teams-create-channel','windows11','Microsoft 365','app','beginner',3,ARRAY['Teamsチャンネル','チャンネル作成','チャット部屋','スレッド','グループ作成'],ARRAY['Teams','チーム','チャンネルを追加'],ARRAY['Teamsを開く','左側の「チーム」でチームを選択','チーム名横の「…」をクリック','「チャンネルを追加」をクリック','チャンネル名と説明を入力','プライバシー設定を選択して「追加」をクリック'],ARRAY['teams-schedule-meeting','teams-mute'],ARRAY['チャンネル','Teams','作成','チーム','グループ','スレッド'],'Teamsにチャンネル（テーマ別の会話スペース）を作成する方法です。'),
  -- 29. Teamsの通知設定を変更する
  ('Teamsの通知設定を変更する','teams-notifications','windows11','Microsoft 365','app','beginner',3,ARRAY['Teams通知','通知オフ','Teams音','バッジ通知','Teams通知設定'],ARRAY['Teams','設定','通知'],ARRAY['Teamsを開く','右上の「…（その他）」→「設定」をクリック','「通知」をクリック','各通知カテゴリ（メンション・メッセージ・会議等）のオン/オフを設定','「おやすみモード」で通知を一時停止する時間も設定可能'],ARRAY['teams-mute','disable-notifications'],ARRAY['Teams','通知','オフ','設定','メンション','メッセージ','会議'],'Teamsの通知の種類や頻度をカスタマイズする方法です。'),
  -- 30. Teamsでファイルを共有する
  ('Teamsでファイルを共有する','teams-share-file','windows11','Microsoft 365','app','beginner',2,ARRAY['Teamsファイル共有','ファイル送信','Teams添付','SharePoint','ファイルアップロード'],ARRAY['Teams','チャット','添付ファイル'],ARRAY['チャットまたはチャンネルを開く','メッセージ入力欄の「添付」アイコン（クリップ）をクリック','「コンピューターからアップロード」でローカルファイルを選択','またはOneDriveやSharePointからファイルを選択','ファイルが添付されたらメッセージと一緒に送信'],ARRAY['teams-create-channel','setup-onedrive'],ARRAY['ファイル','共有','Teams','添付','SharePoint','OneDrive','アップロード'],'Teamsのチャットやチャンネルでファイルを共有する方法です。'),
  -- 31. Power Automateで自動化フローを作成する
  ('Power Automateで自動化フローを作成する','power-automate-create-flow','windows11','Microsoft 365','app','intermediate',15,ARRAY['Power Automate','フロー作成','自動化','RPA','ワークフロー','自動実行'],ARRAY['Power Automate','マイフロー','新しいフロー'],ARRAY['Power Automateにサインイン（flow.microsoft.com）','「マイフロー」→「新しいフロー」をクリック','「自動化したクラウドフロー」を選択','トリガー（例：メール受信・SharePoint更新）を選択','「＋新しいステップ」でアクションを追加','フローを保存してテスト実行'],ARRAY['teams-share-file','outlook-rules'],ARRAY['Power Automate','フロー','自動化','RPA','ワークフロー','Microsoft 365'],'Power Automateで繰り返し作業を自動化するフローを作成する方法です。'),
  -- 32. Power AutomateでメールをTeamsに転送する
  ('Power AutomateでメールをTeamsに転送する','power-automate-email-to-teams','windows11','Microsoft 365','app','intermediate',10,ARRAY['メールTeams転送','自動転送','Power Automate','Outlook Teams連携','通知自動化'],ARRAY['Power Automate','新しいフロー','メール受信→Teamsに投稿'],ARRAY['Power Automateにサインイン','「新しいフロー」→「自動化したクラウドフロー」をクリック','トリガーに「新しいメールが届いたとき（Outlook）」を選択','「新しいステップ」→「チャットまたはチャンネルにメッセージを投稿する（Teams）」を追加','送信先のチームとチャンネルを選択','メール件名・本文をメッセージ内容に設定して保存'],ARRAY['power-automate-create-flow','teams-share-file','outlook-rules'],ARRAY['Power Automate','メール','Teams','転送','自動','通知','Outlook'],'受信メールを自動でTeamsチャンネルに転送するフローの作成方法です。'),
  -- 33. Adobe Acrobatでページを並べ替える
  ('Adobe Acrobatでページを並べ替える','acrobat-reorder-pages','windows11','Acrobat','app','beginner',3,ARRAY['PDF並べ替え','ページ順序','Acrobat','ページ移動','PDF編集'],ARRAY['Acrobat','表示','ページパネル'],ARRAY['Acrobatでファイルを開く','左側の「ページパネル」アイコンをクリック','ページのサムネイルをドラッグして並べ替え','または右クリック→「ページを移動」で数値指定'],ARRAY['ppt-save-as-pdf','word-save-template'],ARRAY['Acrobat','PDF','ページ','並べ替え','順序','移動','編集'],'Adobe AcrobatでPDFのページを並べ替える方法です。'),
  -- 34. Zoomで背景を変更する
  ('Zoomで背景を変更する','zoom-virtual-background','windows11','Zoom','app','beginner',2,ARRAY['Zoom背景','バーチャル背景','背景変更','Zoomビデオ','仮想背景'],ARRAY['Zoom','設定','背景とエフェクト'],ARRAY['Zoomアプリを開く','右上の歯車アイコン（設定）をクリック','「背景とエフェクト」をクリック','「仮想背景」タブを選択','プリセットから選ぶか「＋」で画像を追加'],ARRAY['teams-background','allow-camera'],ARRAY['Zoom','背景','仮想','バーチャル','ビデオ','会議'],'Zoomの会議で背景を画像に変更する方法です。'),
  -- 35. Google Chromeで拡張機能を追加する
  ('Google Chromeで拡張機能を追加する','chrome-add-extension','windows11','Chrome','app','beginner',3,ARRAY['Chrome拡張機能','拡張追加','プラグイン','Chrome拡張','アドオン'],ARRAY['Chrome','Chromeウェブストア','拡張機能を追加'],ARRAY['Chromeを開く','アドレスバーに「chrome.google.com/webstore」と入力','インストールしたい拡張機能を検索','「Chromeに追加」をクリック','「拡張機能を追加」で確認'],ARRAY['change-default-browser-macos','change-default-app'],ARRAY['Chrome','拡張機能','プラグイン','追加','インストール','アドオン'],'Google Chromeに拡張機能を追加する方法です。'),
  -- 36. Slackで通知をカスタマイズする
  ('Slackで通知をカスタマイズする','slack-notifications','windows11','Slack','app','beginner',3,ARRAY['Slack通知','Slack通知設定','メンション通知','Slackオフ','DND Slack'],ARRAY['Slack','右上のアバター','環境設定','通知'],ARRAY['Slackを開く','右上のアバター（プロフィール画像）をクリック','「環境設定」をクリック','「通知」タブをクリック','通知のトリガー・サウンド・バッジを設定','「通知しない時間帯」で特定時間に通知をオフに設定'],ARRAY['teams-notifications','disable-notifications'],ARRAY['Slack','通知','設定','DND','メンション','カスタマイズ'],'Slackの通知の種類や通知しない時間帯を設定する方法です。'),
  -- 37. Google Driveでファイルを共有する
  ('Google Driveでファイルを共有する','google-drive-share','windows11','Google Workspace','app','beginner',3,ARRAY['Googleドライブ共有','Drive共有','リンク共有','ファイル共有Google','共有リンク'],ARRAY['Google Drive','ファイル右クリック','共有'],ARRAY['Google Driveでファイルを右クリック','「共有」をクリック','特定のユーザーのメールアドレスを入力して共有','または「リンクをコピー」でリンク共有','権限（閲覧者・コメント者・編集者）を選択して「送信」'],ARRAY['setup-onedrive','teams-share-file'],ARRAY['Google Drive','共有','リンク','ファイル','権限','閲覧','編集'],'Google Driveでファイルを特定のユーザーやリンクで共有する方法です。')
ON CONFLICT (slug,os) DO UPDATE SET
  title=EXCLUDED.title,version=EXCLUDED.version,category=EXCLUDED.category,
  difficulty=EXCLUDED.difficulty,estimate_minutes=EXCLUDED.estimate_minutes,
  aliases=EXCLUDED.aliases,path=EXCLUDED.path,steps=EXCLUDED.steps,
  related_slugs=EXCLUDED.related_slugs,keywords=EXCLUDED.keywords,
  description=EXCLUDED.description,updated_at=NOW();

SELECT os, version, count(*) FROM settings GROUP BY os, version ORDER BY os, version;
