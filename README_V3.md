# 設定どこ？ v3 リニューアル版

## 本番サイトで修正した問題

| # | 問題 | 修正 |
|---|------|------|
| 1 | ヘッダー/フッターがページによって新旧2種類混在（詳細ページにAndroidリンク無し等） | `Header.tsx`/`Footer.tsx`に共通化し`layout.tsx`で一括適用 |
| 2 | 拡張子ページのパスが「表示›表示」— 実は正しいがモック画面と食い違い | 導線データを精査、不一致だった「設定画面イメージ」モックは廃止（キーキャップ表示に統一） |
| 3 | Xシェアの`url=`が空 | `ShareRow.tsx`で`NEXT_PUBLIC_SITE_URL`+パスから確実に生成 |
| 4 | © 2024・フッター文言にAndroid/アプリ未反映 | © 2026、全OS/アプリのリンクを掲載 |
| 5 | 業務アプリが`os=windows11`扱い（OutlookにWindows 11バッジ） | アプリを第一級の対象に（`os: 'outlook'`等、`os_type: 'app'`） |
| 6 | 「すべての業務ソフト設定」→noindexの検索ページへリンク | `/apps`ページを新設 |
| 7 | 検索のOSフィルターにアプリが無い | アプリフィルター+難易度フィルターを追加 |
| 8 | 管理画面リンクがフッターに露出 | フッターから削除（/adminは残置・noindex） |
| 9 | HowTo構造化データなし | 全詳細ページにJSON-LD（schema.org/HowTo）を出力 |

## v3の大きな変更

### URL設計: `/setting/[slug]?os=xxx` → `/setting/[slug]`
slugがOS横断でユニークになったため、クエリパラメータを廃止。
**全149設定ページが完全静的生成（SSG）**され、SEO・表示速度が大幅に向上します（ビルドで201ページ生成）。
旧URLの`?os=`付きアクセスもslugだけで解決するのでそのまま動きます。

### データ: 149項目収録
- Windows 11: 40 / iOS: 20 / macOS: 17 / Android: 18
- アプリ54: Outlook・Teams・Excel・Word・PowerPoint・Power Automate・Zoom・Slack・Chrome・Google Drive・Acrobat
- 全項目に難易度（初心者/中級/上級）と所要時間（分）を付与

### デザイン刷新
- シグネチャーUI「**キーキャップ型パス表示**」— 設定導線をキーボードのキー風チップで表現（最後のキーはアクセント色）
- ロゴにトグルスイッチモチーフ
- カラートークン: `--accent: #2557D6` / `--toggle-on: #10B981` / 背景 `#F6F7F9`

### 新機能
- 検索バーに**インスタントサジェスト**（入力中に候補表示、↑↓キー選択、`/`キーでフォーカス）
- ブックマーク（localStorage）、手順コピー、URLコピー、印刷CSS
- 前後ナビ、カテゴリページ（OS横断）、特集8本、報告リンク
- sitemap.xml / robots.txt 自動生成

## デプロイ手順

1. **環境変数**（Vercel → Settings → Environment Variables）
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`（既存のまま）
   - `NEXT_PUBLIC_SITE_URL` = `https://settingdoko.vercel.app` を**追加**（シェアURL・sitemap用）
2. **Supabase**（SQL Editorで順に実行）
   - `supabase/migration_v3.sql` … カラム追加（os_type/difficulty/minutes）、steps→jsonb変換、slugユニーク化、検索RPC
   - ※実行前に重複slugを確認: `SELECT slug, count(*) FROM settings GROUP BY slug HAVING count(*) > 1;`
   - `supabase/seed_v3.sql` … 149件を投入（ON CONFLICTでslug単位アップサート）
3. **push**
   ```
   git add -A && git commit -m "v3: full renewal" && git push origin main
   ```

※ Supabase未設定でもローカルデータ（`src/lib/data/`）で全機能が動きます。
※ 手順画像は各stepの`image_url`（jsonb内）にSupabase StorageのURLを入れると表示されます。

## 報告リンクについて
詳細ページの「情報が古い・間違いを報告」はGoogleフォームのプレースホルダーです。
実際のフォームを作成して `src/app/setting/[slug]/page.tsx` 内のURLを差し替えてください。
