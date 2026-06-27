// scripts/generate-office-sql.mjs
// node scripts/generate-office-sql.mjs > supabase-seed-office.sql

const officeSettings = [
  // ============================================================
  // Microsoft Outlook
  // ============================================================
  { title:"Outlookでメールアカウントを追加する", slug:"outlook-add-account", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:5,
    aliases:["Outlookアカウント追加","メール設定","Gmail Outlook","Exchange設定","IMAP設定"],
    path:["Outlook","ファイル","アカウントの追加"],
    steps:["Outlookを開く","「ファイル」タブをクリック","「アカウントの追加」をクリック","メールアドレスを入力して「接続」をクリック","パスワードを入力してサインイン完了"],
    related_slugs:["outlook-signature","outlook-rules"],
    keywords:["Outlook","メール","アカウント","追加","Gmail","Exchange","IMAP"],
    description:"Outlookに新しいメールアカウント（Gmail・Exchange等）を追加する方法です。" },

  { title:"Outlookで署名を設定する", slug:"outlook-signature", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:5,
    aliases:["Outlook署名","メール署名","自動署名","サインオフ","署名設定"],
    path:["Outlook","ファイル","オプション","メール","署名"],
    steps:["Outlookを開く","「ファイル」→「オプション」をクリック","「メール」→「署名」をクリック","「新規作成」で署名を作成","名前を入力して署名のテキストを記入","「新しいメッセージ」と「返信/転送」の既定署名を設定して「OK」"],
    related_slugs:["outlook-add-account"],
    keywords:["署名","Outlook","メール","自動署名","フッター","サインオフ"],
    description:"Outlookのメール署名を設定して自動で挿入する方法です。" },

  { title:"Outlookで受信トレイのルールを作成する", slug:"outlook-rules", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:5,
    aliases:["Outlookルール","メール振り分け","自動振り分け","フィルター","受信フォルダ"],
    path:["Outlook","ファイル","情報","ルールと通知の管理"],
    steps:["Outlookを開く","「ファイル」→「情報」→「ルールと通知の管理」をクリック","「新しいルール」をクリック","条件（差出人・件名・キーワード等）を選択","アクション（フォルダに移動・削除等）を設定して「完了」"],
    related_slugs:["outlook-add-account","outlook-signature"],
    keywords:["ルール","振り分け","フィルター","Outlook","自動","受信","トレイ"],
    description:"メールを条件で自動振り分けするルールを作成する方法です。" },

  { title:"Outlookで不在通知（自動応答）を設定する", slug:"outlook-out-of-office", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["不在通知","自動応答","休暇中","留守番メール","OOF","Out of Office"],
    path:["Outlook","ファイル","自動応答"],
    steps:["Outlookを開く","「ファイル」をクリック","「自動応答（不在通知）」をクリック","「自動応答を送信する」を選択","期間と返信メッセージを入力","「OK」をクリック"],
    related_slugs:["outlook-signature","outlook-rules"],
    keywords:["不在通知","自動応答","休暇","OOF","Out of Office","メール"],
    description:"不在時に自動で返信する不在通知（自動応答）を設定する方法です。" },

  { title:"Outlookの迷惑メールフィルターを設定する", slug:"outlook-junk-filter", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["迷惑メール","スパム","フィルター","Outlook迷惑メール","ジャンクメール"],
    path:["Outlook","ホーム","迷惑メール","迷惑メールのオプション"],
    steps:["Outlookを開く","「ホーム」タブの「迷惑メール」をクリック","「迷惑メールのオプション」をクリック","保護レベルを選択（低・高・セーフリストのみ等）","「OK」をクリック"],
    related_slugs:["outlook-rules"],
    keywords:["迷惑メール","スパム","フィルター","ジャンク","Outlook","受信"],
    description:"Outlookの迷惑メールフィルターを設定する方法です。" },

  { title:"Outlookでフォルダを作成して整理する", slug:"outlook-create-folder", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["Outlookフォルダ","メールフォルダ","フォルダ作成","メール整理","振り分け先"],
    path:["Outlook","左ペイン","右クリック","新しいフォルダー"],
    steps:["Outlookを開く","左側のフォルダーペインで「受信トレイ」を右クリック","「新しいフォルダー」をクリック","フォルダ名を入力してEnter","ルール設定でこのフォルダに自動振り分けも可能"],
    related_slugs:["outlook-rules","outlook-add-account"],
    keywords:["フォルダ","整理","作成","Outlook","メール","振り分け"],
    description:"Outlookでメール整理用のフォルダを作成する方法です。" },

  // ============================================================
  // Microsoft Word
  // ============================================================
  { title:"Wordでページ番号を挿入する", slug:"word-page-numbers", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["ページ番号","Word番号","フッターページ数","ノンブル","ページ数表示"],
    path:["Word","挿入","ページ番号"],
    steps:["Wordを開く","「挿入」タブをクリック","「ページ番号」をクリック","表示位置（ページの上部・下部・余白）を選択","番号のスタイルを選択"],
    related_slugs:["word-header-footer","word-table-of-contents"],
    keywords:["ページ番号","Word","挿入","フッター","番号","ページ"],
    description:"Wordの文書にページ番号を挿入する方法です。" },

  { title:"Wordで目次を自動作成する", slug:"word-table-of-contents", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:5,
    aliases:["目次作成","Word目次","自動目次","見出し","目次自動"],
    path:["Word","参考資料","目次"],
    steps:["見出しスタイル（見出し1・見出し2）を各タイトルに適用する","目次を挿入したい場所にカーソルを置く","「参考資料」タブをクリック","「目次」をクリック","スタイルを選択して挿入","内容変更後は目次上で右クリック→「フィールドの更新」で更新"],
    related_slugs:["word-page-numbers"],
    keywords:["目次","Word","自動","見出し","参考資料","スタイル"],
    description:"Wordで見出しスタイルを使って目次を自動作成する方法です。" },

  { title:"Wordでヘッダーとフッターを設定する", slug:"word-header-footer", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["ヘッダー","フッター","Word上部","文書番号","ドキュメント名"],
    path:["Word","挿入","ヘッダー または フッター"],
    steps:["「挿入」タブをクリック","「ヘッダー」または「フッター」をクリック","スタイルを選択","テキストを入力（文書名・日付・ページ番号等）","本文をダブルクリックしてヘッダー編集モードを終了"],
    related_slugs:["word-page-numbers"],
    keywords:["ヘッダー","フッター","Word","挿入","ページ","文書"],
    description:"Wordにヘッダーとフッターを設定する方法です。" },

  { title:"Wordで文字数・行数を設定する", slug:"word-character-count", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["文字数設定","行数設定","1行の文字数","Wordページ設定","原稿用紙"],
    path:["Word","レイアウト","ページ設定","文字数と行数"],
    steps:["「レイアウト」タブをクリック","「ページ設定」グループ右下の矢印（ダイアログ起動）をクリック","「文字数と行数」タブをクリック","「文字数と行数を指定する」を選択","1行の文字数と1ページの行数を入力して「OK」"],
    related_slugs:["word-page-numbers","word-header-footer"],
    keywords:["文字数","行数","ページ設定","Word","原稿","レイアウト"],
    description:"Wordで1行あたりの文字数と1ページあたりの行数を設定する方法です。" },

  { title:"Wordの変更履歴を使う", slug:"word-track-changes", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:3,
    aliases:["変更履歴","Track Changes","赤字","校正","差分表示","変更を追跡"],
    path:["Word","校閲","変更履歴の記録"],
    steps:["「校閲」タブをクリック","「変更履歴の記録」をクリックしてオンにする","文書を編集すると変更箇所が赤字で表示される","「変更箇所」→「次へ」で変更を確認","「承諾」または「元に戻す」で変更を受け入れ/却下"],
    related_slugs:["word-table-of-contents"],
    keywords:["変更履歴","Track Changes","校正","差分","赤字","Word","校閲"],
    description:"Wordの変更履歴（Track Changes）で文書の編集内容を追跡する方法です。" },

  { title:"Wordでテンプレートを保存する", slug:"word-save-template", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:3,
    aliases:["テンプレート保存","Word雛形","書式テンプレート","dotxファイル","ひな形"],
    path:["Word","ファイル","名前を付けて保存","Wordテンプレート"],
    steps:["書式設定済みのWordファイルを開く","「ファイル」→「名前を付けて保存」をクリック","ファイルの種類を「Wordテンプレート（*.dotx）」に変更","ファイル名を入力して保存","次回からこのテンプレートを使うには「新規作成」→「個人用」から選択"],
    related_slugs:["word-header-footer"],
    keywords:["テンプレート","Word","保存","雛形","dotx","書式"],
    description:"Wordのファイルをテンプレート（雛形）として保存して再利用する方法です。" },

  // ============================================================
  // Microsoft Excel
  // ============================================================
  { title:"Excelでセルを結合する", slug:"excel-merge-cells", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:1,
    aliases:["セル結合","Excel結合","セルをつなぐ","結合して中央揃え","セル合体"],
    path:["Excel","ホーム","結合して中央揃え"],
    steps:["結合したいセルを選択する（ドラッグで複数選択）","「ホーム」タブをクリック","「結合して中央揃え」ボタンをクリック","解除したい場合は再度「結合して中央揃え」をクリック"],
    related_slugs:["excel-freeze-panes","excel-filter"],
    keywords:["セル","結合","Excel","中央揃え","ホーム","マージ"],
    description:"Excelで複数のセルを1つに結合する方法です。" },

  { title:"Excelでフィルターを設定する", slug:"excel-filter", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["フィルター","絞り込み","オートフィルター","データ絞り込み","条件フィルター"],
    path:["Excel","データ","フィルター"],
    steps:["データが入力されているセルをクリック","「データ」タブをクリック","「フィルター」をクリック","各列のヘッダーにドロップダウン矢印が表示される","矢印をクリックして絞り込み条件を選択"],
    related_slugs:["excel-sort","excel-pivot-table"],
    keywords:["フィルター","絞り込み","Excel","データ","オートフィルター","条件"],
    description:"Excelのフィルター機能でデータを絞り込む方法です。" },

  { title:"Excelでウィンドウ枠を固定する", slug:"excel-freeze-panes", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["ウィンドウ枠固定","行固定","列固定","ヘッダー固定","スクロール固定"],
    path:["Excel","表示","ウィンドウ枠の固定"],
    steps:["固定したい行の下・列の右のセルをクリック（例：2行目と1列目を固定するならB2を選択）","「表示」タブをクリック","「ウィンドウ枠の固定」→「ウィンドウ枠の固定」をクリック","スクロールしても固定した行・列が表示され続ける"],
    related_slugs:["excel-filter","excel-merge-cells"],
    keywords:["ウィンドウ枠","固定","Excel","ヘッダー","スクロール","行","列"],
    description:"Excelでスクロールしてもヘッダー行・列が見えるように固定する方法です。" },

  { title:"Excelでピボットテーブルを作成する", slug:"excel-pivot-table", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:10,
    aliases:["ピボットテーブル","集計表","クロス集計","Excel集計","データ分析"],
    path:["Excel","挿入","ピボットテーブル"],
    steps:["集計したいデータ範囲を選択","「挿入」タブをクリック","「ピボットテーブル」をクリック","新しいシートまたは既存のシートを選択して「OK」","右側の「ピボットテーブルのフィールド」でドラッグして行・列・値を設定"],
    related_slugs:["excel-filter","excel-sort"],
    keywords:["ピボット","テーブル","集計","Excel","クロス","分析","データ"],
    description:"Excelのピボットテーブルで大量データを素早く集計・分析する方法です。" },

  { title:"Excelで並べ替えをする", slug:"excel-sort", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["並べ替え","ソート","昇順","降順","Excel並べ替え","データ整列"],
    path:["Excel","データ","並べ替え"],
    steps:["並べ替えたいデータ範囲内のセルをクリック","「データ」タブをクリック","「昇順」（A→Z）または「降順」（Z→A）をクリック","複数条件で並べ替える場合は「並べ替え」ボタンから詳細設定"],
    related_slugs:["excel-filter","excel-pivot-table"],
    keywords:["並べ替え","ソート","昇順","降順","Excel","データ","整列"],
    description:"Excelのデータを昇順・降順で並べ替える方法です。" },

  { title:"ExcelでVLOOKUPを使う", slug:"excel-vlookup", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:10,
    aliases:["VLOOKUP","縦検索","Excel検索","関数VLOOKUP","データ検索","参照"],
    path:["Excel","数式バー","=VLOOKUP()"],
    steps:["検索結果を表示したいセルをクリック","数式バーに「=VLOOKUP(」と入力","検索値（例：A2）を指定","範囲（例：$D$2:$F$100）を指定","列番号（範囲の左から何列目か）を指定","検索方法（0：完全一致）を入力して Enter","例：=VLOOKUP(A2,$D$2:$F$100,2,0)"],
    related_slugs:["excel-pivot-table","excel-filter"],
    keywords:["VLOOKUP","関数","検索","参照","Excel","縦","データ"],
    description:"ExcelのVLOOKUP関数で別の表からデータを検索・参照する方法です。" },

  { title:"Excelでグラフを作成する", slug:"excel-create-chart", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:5,
    aliases:["グラフ作成","Excel棒グラフ","円グラフ","折れ線グラフ","チャート","グラフ挿入"],
    path:["Excel","挿入","グラフ"],
    steps:["グラフにしたいデータ範囲を選択","「挿入」タブをクリック","グラフの種類（棒・円・折れ線等）を選択","グラフが挿入される","グラフをクリックして「グラフのデザイン」タブからスタイルや色を変更"],
    related_slugs:["excel-pivot-table","excel-filter"],
    keywords:["グラフ","チャート","Excel","棒グラフ","円グラフ","折れ線","挿入"],
    description:"Excelでデータをグラフ（棒・円・折れ線等）に変換する方法です。" },

  { title:"Excelでシートを保護する", slug:"excel-protect-sheet", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:3,
    aliases:["シート保護","Excel編集禁止","セル保護","パスワード保護","編集ロック"],
    path:["Excel","校閲","シートの保護"],
    steps:["「校閲」タブをクリック","「シートの保護」をクリック","保護の設定（許可する操作）を選択","パスワードを設定（任意）","「OK」をクリック","解除は「シート保護の解除」からパスワードを入力して解除"],
    related_slugs:["excel-create-chart","word-track-changes"],
    keywords:["シート保護","Excel","パスワード","編集禁止","ロック","セル"],
    description:"Excelのシートを保護して不意の編集を防ぐ方法です。" },

  // ============================================================
  // Microsoft PowerPoint
  // ============================================================
  { title:"PowerPointでスライドマスターを編集する", slug:"ppt-slide-master", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:10,
    aliases:["スライドマスター","PowerPoint書式","統一デザイン","マスタースライド","テーマ編集"],
    path:["PowerPoint","表示","スライドマスター"],
    steps:["「表示」タブをクリック","「スライドマスター」をクリック","最上部のマスタースライドを選択","フォント・色・背景・ロゴを設定","「マスター表示を閉じる」をクリック","全スライドに統一デザインが適用される"],
    related_slugs:["ppt-animations","ppt-presenter-view"],
    keywords:["スライドマスター","PowerPoint","デザイン","統一","マスター","テーマ"],
    description:"スライドマスターを編集して全スライドに統一デザインを適用する方法です。" },

  { title:"PowerPointでアニメーションを設定する", slug:"ppt-animations", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:5,
    aliases:["アニメーション","スライドアニメ","フェードイン","スライドイン","PowerPointアニメ"],
    path:["PowerPoint","アニメーション","アニメーションの追加"],
    steps:["アニメーションを付けたいオブジェクト（テキスト・画像等）をクリック","「アニメーション」タブをクリック","「アニメーションの追加」でエフェクトを選択","「プレビュー」で確認","「効果のオプション」で方向や速度を調整"],
    related_slugs:["ppt-slide-master","ppt-presenter-view"],
    keywords:["アニメーション","PowerPoint","エフェクト","フェード","スライドイン","動き"],
    description:"PowerPointのスライドにアニメーション効果を設定する方法です。" },

  { title:"PowerPointで発表者ビューを使う", slug:"ppt-presenter-view", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["発表者ビュー","プレゼンモード","スピーカービュー","ノート表示","発表者ツール"],
    path:["PowerPoint","スライドショー","発表者ツールを使用する"],
    steps:["「スライドショー」タブをクリック","「発表者ツールを使用する」にチェックを入れる","「最初から」または「現在のスライドから」でスライドショーを開始","発表者画面には現在のスライド・次のスライド・ノートが表示される"],
    related_slugs:["ppt-animations","ppt-slide-master"],
    keywords:["発表者ビュー","プレゼン","ノート","スピーカー","スライドショー","PowerPoint"],
    description:"プレゼン中に発表者だけにノートや次のスライドを表示する方法です。" },

  { title:"PowerPointでPDFとして保存する", slug:"ppt-save-as-pdf", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["PDF保存","PowerPointをPDF","スライドPDF","エクスポート","PDF変換"],
    path:["PowerPoint","ファイル","エクスポート","PDF/XPSドキュメントの作成"],
    steps:["「ファイル」タブをクリック","「エクスポート」をクリック","「PDF/XPSドキュメントの作成」をクリック","ファイル名と保存場所を選択","「発行」をクリック"],
    related_slugs:["ppt-slide-master","word-save-template"],
    keywords:["PDF","保存","PowerPoint","エクスポート","変換","スライド"],
    description:"PowerPointのスライドをPDFファイルとして保存する方法です。" },

  // ============================================================
  // Microsoft Teams
  // ============================================================
  { title:"Teamsで会議を予約する", slug:"teams-schedule-meeting", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Teams会議","会議予約","Teams予定","オンライン会議","ミーティング設定"],
    path:["Teams","カレンダー","新しい会議"],
    steps:["Teamsを開く","左側の「カレンダー」をクリック","右上の「新しい会議」をクリック","タイトル・日時・参加者のメールアドレスを入力","「送信」をクリックして招待を送る"],
    related_slugs:["teams-background","teams-mute","allow-microphone"],
    keywords:["Teams","会議","予約","カレンダー","ミーティング","スケジュール"],
    description:"Microsoft Teamsでオンライン会議を予約・招待する方法です。" },

  { title:"Teamsで背景を変更する", slug:"teams-background", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["Teams背景","バーチャル背景","背景ぼかし","背景変更","仮想背景"],
    path:["Teams","会議中","その他","ビデオエフェクトを適用する"],
    steps:["Teams会議に参加する","画面上部の「…（その他）」をクリック","「ビデオエフェクトを適用する」をクリック","「背景のぼかし」または好みの背景画像を選択","カスタム背景は「追加」から画像をアップロード"],
    related_slugs:["teams-schedule-meeting","allow-camera"],
    keywords:["背景","Teams","バーチャル","ぼかし","仮想背景","ビデオ"],
    description:"Teams会議中に背景をぼかしたり画像に変更する方法です。" },

  { title:"Teamsでマイクとカメラをミュートにする", slug:"teams-mute", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:1,
    aliases:["Teamsミュート","マイクオフ","カメラオフ","ビデオオフ","ミュート設定"],
    path:["Teams","会議中","マイク/カメラアイコン"],
    steps:["会議中の画面下部のツールバーを確認","マイクアイコンをクリックでミュート/解除（Ctrl + Shift + M）","カメラアイコンをクリックでビデオオフ/オン（Ctrl + Shift + O）","会議参加前の画面でも事前にオン/オフ設定が可能"],
    related_slugs:["teams-schedule-meeting","allow-microphone","allow-camera"],
    keywords:["ミュート","マイク","カメラ","Teams","オフ","会議","ビデオ"],
    description:"Teams会議中にマイクやカメラをミュートにする方法です。" },

  { title:"Teamsでチャンネルを作成する", slug:"teams-create-channel", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Teamsチャンネル","チャンネル作成","チャット部屋","スレッド","グループ作成"],
    path:["Teams","チーム","チャンネルを追加"],
    steps:["Teamsを開く","左側の「チーム」でチームを選択","チーム名横の「…」をクリック","「チャンネルを追加」をクリック","チャンネル名と説明を入力","プライバシー設定を選択して「追加」をクリック"],
    related_slugs:["teams-schedule-meeting","teams-mute"],
    keywords:["チャンネル","Teams","作成","チーム","グループ","スレッド"],
    description:"Teamsにチャンネル（テーマ別の会話スペース）を作成する方法です。" },

  { title:"Teamsの通知設定を変更する", slug:"teams-notifications", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Teams通知","通知オフ","Teams音","バッジ通知","Teams通知設定"],
    path:["Teams","設定","通知"],
    steps:["Teamsを開く","右上の「…（その他）」→「設定」をクリック","「通知」をクリック","各通知カテゴリ（メンション・メッセージ・会議等）のオン/オフを設定","「おやすみモード」で通知を一時停止する時間も設定可能"],
    related_slugs:["teams-mute","disable-notifications"],
    keywords:["Teams","通知","オフ","設定","メンション","メッセージ","会議"],
    description:"Teamsの通知の種類や頻度をカスタマイズする方法です。" },

  { title:"Teamsでファイルを共有する", slug:"teams-share-file", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["Teamsファイル共有","ファイル送信","Teams添付","SharePoint","ファイルアップロード"],
    path:["Teams","チャット","添付ファイル"],
    steps:["チャットまたはチャンネルを開く","メッセージ入力欄の「添付」アイコン（クリップ）をクリック","「コンピューターからアップロード」でローカルファイルを選択","またはOneDriveやSharePointからファイルを選択","ファイルが添付されたらメッセージと一緒に送信"],
    related_slugs:["teams-create-channel","setup-onedrive"],
    keywords:["ファイル","共有","Teams","添付","SharePoint","OneDrive","アップロード"],
    description:"Teamsのチャットやチャンネルでファイルを共有する方法です。" },

  // ============================================================
  // Power Automate
  // ============================================================
  { title:"Power Automateで自動化フローを作成する", slug:"power-automate-create-flow", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:15,
    aliases:["Power Automate","フロー作成","自動化","RPA","ワークフロー","自動実行"],
    path:["Power Automate","マイフロー","新しいフロー"],
    steps:["Power Automateにサインイン（flow.microsoft.com）","「マイフロー」→「新しいフロー」をクリック","「自動化したクラウドフロー」を選択","トリガー（例：メール受信・SharePoint更新）を選択","「＋新しいステップ」でアクションを追加","フローを保存してテスト実行"],
    related_slugs:["teams-share-file","outlook-rules"],
    keywords:["Power Automate","フロー","自動化","RPA","ワークフロー","Microsoft 365"],
    description:"Power Automateで繰り返し作業を自動化するフローを作成する方法です。" },

  { title:"Power AutomateでメールをTeamsに転送する", slug:"power-automate-email-to-teams", os:"windows11", version:"Microsoft 365", category:"app", difficulty:"intermediate", estimate_minutes:10,
    aliases:["メールTeams転送","自動転送","Power Automate","Outlook Teams連携","通知自動化"],
    path:["Power Automate","新しいフロー","メール受信→Teamsに投稿"],
    steps:["Power Automateにサインイン","「新しいフロー」→「自動化したクラウドフロー」をクリック","トリガーに「新しいメールが届いたとき（Outlook）」を選択","「新しいステップ」→「チャットまたはチャンネルにメッセージを投稿する（Teams）」を追加","送信先のチームとチャンネルを選択","メール件名・本文をメッセージ内容に設定して保存"],
    related_slugs:["power-automate-create-flow","teams-share-file","outlook-rules"],
    keywords:["Power Automate","メール","Teams","転送","自動","通知","Outlook"],
    description:"受信メールを自動でTeamsチャンネルに転送するフローの作成方法です。" },

  // ============================================================
  // その他業務ソフト
  // ============================================================
  { title:"Adobe Acrobatでページを並べ替える", slug:"acrobat-reorder-pages", os:"windows11", version:"Acrobat", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["PDF並べ替え","ページ順序","Acrobat","ページ移動","PDF編集"],
    path:["Acrobat","表示","ページパネル"],
    steps:["Acrobatでファイルを開く","左側の「ページパネル」アイコンをクリック","ページのサムネイルをドラッグして並べ替え","または右クリック→「ページを移動」で数値指定"],
    related_slugs:["ppt-save-as-pdf","word-save-template"],
    keywords:["Acrobat","PDF","ページ","並べ替え","順序","移動","編集"],
    description:"Adobe AcrobatでPDFのページを並べ替える方法です。" },

  { title:"Zoomで背景を変更する", slug:"zoom-virtual-background", os:"windows11", version:"Zoom", category:"app", difficulty:"beginner", estimate_minutes:2,
    aliases:["Zoom背景","バーチャル背景","背景変更","Zoomビデオ","仮想背景"],
    path:["Zoom","設定","背景とエフェクト"],
    steps:["Zoomアプリを開く","右上の歯車アイコン（設定）をクリック","「背景とエフェクト」をクリック","「仮想背景」タブを選択","プリセットから選ぶか「＋」で画像を追加"],
    related_slugs:["teams-background","allow-camera"],
    keywords:["Zoom","背景","仮想","バーチャル","ビデオ","会議"],
    description:"Zoomの会議で背景を画像に変更する方法です。" },

  { title:"Google Chromeで拡張機能を追加する", slug:"chrome-add-extension", os:"windows11", version:"Chrome", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Chrome拡張機能","拡張追加","プラグイン","Chrome拡張","アドオン"],
    path:["Chrome","Chromeウェブストア","拡張機能を追加"],
    steps:["Chromeを開く","アドレスバーに「chrome.google.com/webstore」と入力","インストールしたい拡張機能を検索","「Chromeに追加」をクリック","「拡張機能を追加」で確認"],
    related_slugs:["change-default-browser-macos","change-default-app"],
    keywords:["Chrome","拡張機能","プラグイン","追加","インストール","アドオン"],
    description:"Google Chromeに拡張機能を追加する方法です。" },

  { title:"Slackで通知をカスタマイズする", slug:"slack-notifications", os:"windows11", version:"Slack", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Slack通知","Slack通知設定","メンション通知","Slackオフ","DND Slack"],
    path:["Slack","右上のアバター","環境設定","通知"],
    steps:["Slackを開く","右上のアバター（プロフィール画像）をクリック","「環境設定」をクリック","「通知」タブをクリック","通知のトリガー・サウンド・バッジを設定","「通知しない時間帯」で特定時間に通知をオフに設定"],
    related_slugs:["teams-notifications","disable-notifications"],
    keywords:["Slack","通知","設定","DND","メンション","カスタマイズ"],
    description:"Slackの通知の種類や通知しない時間帯を設定する方法です。" },

  { title:"Google Driveでファイルを共有する", slug:"google-drive-share", os:"windows11", version:"Google Workspace", category:"app", difficulty:"beginner", estimate_minutes:3,
    aliases:["Googleドライブ共有","Drive共有","リンク共有","ファイル共有Google","共有リンク"],
    path:["Google Drive","ファイル右クリック","共有"],
    steps:["Google Driveでファイルを右クリック","「共有」をクリック","特定のユーザーのメールアドレスを入力して共有","または「リンクをコピー」でリンク共有","権限（閲覧者・コメント者・編集者）を選択して「送信」"],
    related_slugs:["setup-onedrive","teams-share-file"],
    keywords:["Google Drive","共有","リンク","ファイル","権限","閲覧","編集"],
    description:"Google Driveでファイルを特定のユーザーやリンクで共有する方法です。" },
];

function pgArr(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(s => `'${s.replace(/'/g,"''")}'`).join(",") + "]";
}
function pgStr(s) { return s ? `'${s.replace(/'/g,"''")}'` : "NULL"; }

const byApp = {};
for (const s of officeSettings) {
  const app = s.keywords[0] || "その他";
  if (!byApp[app]) byApp[app] = 0;
  byApp[app]++;
}

console.log("-- =============================================");
console.log("-- 設定どこ？ - 業務ソフト設定データ");
console.log(`-- 合計${officeSettings.length}件`);
console.log("-- Outlook, Word, Excel, PowerPoint, Teams, Power Automate, その他");
console.log("-- =============================================\n");
console.log("INSERT INTO settings");
console.log("  (title,slug,os,version,category,difficulty,estimate_minutes,aliases,path,steps,related_slugs,keywords,description)");
console.log("VALUES");

const rows = officeSettings.map((s,i) =>
  `  -- ${i+1}. ${s.title}\n  (${pgStr(s.title)},${pgStr(s.slug)},${pgStr(s.os)},${pgStr(s.version)},${pgStr(s.category)},${pgStr(s.difficulty)},${s.estimate_minutes||"NULL"},${pgArr(s.aliases)},${pgArr(s.path)},${pgArr(s.steps)},${pgArr(s.related_slugs)},${pgArr(s.keywords)},${pgStr(s.description)})`
);

console.log(rows.join(",\n"));
console.log("ON CONFLICT (slug,os) DO UPDATE SET");
console.log("  title=EXCLUDED.title,version=EXCLUDED.version,category=EXCLUDED.category,");
console.log("  difficulty=EXCLUDED.difficulty,estimate_minutes=EXCLUDED.estimate_minutes,");
console.log("  aliases=EXCLUDED.aliases,path=EXCLUDED.path,steps=EXCLUDED.steps,");
console.log("  related_slugs=EXCLUDED.related_slugs,keywords=EXCLUDED.keywords,");
console.log("  description=EXCLUDED.description,updated_at=NOW();");
console.log("\nSELECT os, version, count(*) FROM settings GROUP BY os, version ORDER BY os, version;");
