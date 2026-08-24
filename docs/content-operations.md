# SettingDoko コンテンツ運用基準

## 原則

発見と公開を分離する。公式サポート索引、設定ツリー、検索ログ、問い合わせから得た項目は、まず `content_candidates` または下書きに入れる。クロール結果や生成候補を直接 `published` にしない。

運用状態は次の順序を基本とする。

`DISCOVERED → CANDIDATE → DRAFT → SOURCE_ATTACHED → VERIFIED → PUBLISHED → INDEXABLE`

`PUBLISHED` と `INDEXABLE` は別である。内容として公開可能でも検索流入に十分でなければ `PUBLIC + NOINDEX` を維持する。品質状態は保存した主観値ではなく、`src/lib/content-operations.ts` の決定論的チェックから毎回算出する。

## 正規トピックと別名

1つの設定先・1つの解決意図には、原則として1つの正規ガイドを置く。「Wi-Fiをオン」「Wi-Fiを有効」のような表現違いは別ページにせず、`aliases` と `keywords` に持たせる。症状と設定操作は別意図なので、SETTING GUIDE と TROUBLESHOOTING GUIDE は分ける。

新規記事の前に以下を確認する。

1. `npm run audit:content` の検索意図候補
2. 管理API `/api/admin/search-demand` の `MISSING_ALIAS` と `MISSING_GUIDE`
3. 同じOS・カテゴリ・設定経路・公式情報源の記事
4. 正規記事へalias追加で解決できない理由

## 公開基準

公開には、有効なOS・カテゴリ・slug、対象バージョン、最短経路、実行可能な複数手順、権威あるHTTPS情報源、未来日でない検証日が必要である。危険な変更には注意、戻せる変更には原状復帰、設定項目が移動・非表示になり得るガイドには `if_missing` を付ける。

完全性は100点満点の固定チェックリストで、タイトル8、識別子8、バージョン7、概要8、経路8、手順16、情報源12、検証日10、検索語6、戻し方5、見つからない場合5、関連4、適用範囲3である。点数だけで公開しない。`UNSAFE_TO_PUBLISH`、`MISSING_STEPS`、`LOW_VALUE` は公開を止める。

## 情報源と再検証

優先順は公式サポート、公式ドキュメント、公式ベンダー、端末メーカー、信頼できる二次情報、未分類である。一般トップページは特定手順の根拠にしない。URL消失時は記事を即削除せず `BROKEN_SOURCE` と `requires_reverification` に回す。

`version` は対象版、`verified_on_version` は実際に確認した版であり、同じ意味とは限らない。分かっていない対応範囲を `verified_from` / `verified_to` に推測で入れない。OS大型更新、期限超過、情報源移転、否定票増加、画面画像の版ずれを再検証キューの信号にする。

## Androidとアプリ

Androidの一般記事は標準Androidまたは確認端末を `device_scope` に明記する。Pixel、Galaxy、Xperia、Xiaomi、OPPOなど表示差が大きい内容は、確認可能なメーカーだけを別記事にする。全機種共通を装わない。

アプリ記事は公式情報源、確認版、具体的手順、独自の解決価値を必須とする。メニュー名だけを差し替えた一行ガイドは公開しない。エラーコードは実在、公式資料、固有の原因または行動可能な解決策が揃う場合だけ候補化する。

## スクリーンショット

全記事へ一律に付けない。高需要、見つけにくい階層、視覚的に紛らわしい画面、メーカー固有UIを優先する。手順画像には `image_alt`、`image_captured_at`、`image_platform_version`、`image_device` を保存する。版が古い画像は本文と独立して抽出できるようにする。

## 監査とエクスポート

```bash
npm run audit:data
npm run audit:content -- --input /path/to/settings.json --json /tmp/content-audit.json --csv /tmp/editorial-review.csv
npm run check:sources -- --input /path/to/settings.json --out /tmp/source-health.json
npm run audit:content -- --input /path/to/settings.json --source-health /tmp/source-health.json
npm run content:ops -- --input /path/to/settings.json --source-health /tmp/source-health.json --out-dir /tmp/settingdoko-operations
```

管理者は `/api/admin/quality?format=csv` から編集レビューCSV、`/api/admin/search-demand?format=csv` から取得バックログを出力できる。どちらも管理認証が必要で公開キャッシュしない。

`content:ops` は本文・公開状態を変更せず、`source-repair.csv`、`editorial-review.csv`、`quality-issues.csv`、`reverification-queue.csv`、`duplicate-review.json`、`acquisition-backlog.csv`、`coverage-matrix.csv`を出力する。情報源ヘルスを渡した場合は、確認済み結果だけを登録する `source-checks.sql` と、記事を削除・非公開化せず `requires_reverification` を立てる `reverification-flags.sql` も出力する。SQLはバックアップ確認と移行SQL適用後に内容を確認してから、管理者が手動実行する。

リンク監査の `orphanGuides` / `guidesWithoutRelated` は、記事ページが実際に生成する文脈関連リンクを含む。`explicitOrphanGuides` / `guidesWithoutExplicitRelated` はDBの `related_slugs` だけを対象にした保守指標であり、保存データの不足と描画後の孤立を混同しない。

大量更新前はSupabase Dashboardのバックアップ/PITR状態を確認し、対象テーブルをCSVまたはSQLでエクスポートする。投入APIはdry-runを先に実行し、変更予定件数と例を確認する。候補インポートは新規行だけを下書きへ追加し、既存公開行を上書きしない。

## 廃止方針

古いガイドは順に `UPDATE`、正規記事へ `REPLACE/REDIRECT`、履歴価値があれば `ARCHIVE/NOINDEX`、代替も被リンク価値もない場合だけ `DELETE` を選ぶ。無関係な記事やトップページへリダイレクトしない。削除前に代替URL、内部リンク、外部リンク、検索流入を人手で確認する。
