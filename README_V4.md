# 設定どこ？ v4 — 総合レビュー・大規模拡張版

## 📊 データ規模
**234項目**（v3の149項目から +85）/ 特集11本 / カテゴリ21 / 静的生成 約300ページ

| 対象 | 件数 | 備考 |
|---|---|---|
| Windows 11 | 46 | バッテリー・開発者向け（WSL等）追加 |
| **Windows 10** | 14 | 🆕 Win11と導線が異なる主要設定 |
| iPhone (iOS) | 25 | 低電力モード・充電上限・AirDrop等追加 |
| **iPad (iPadOS)** | 10 | 🆕 Split View・ステージマネージャ・Sidecar等 |
| macOS | 21 | バッテリー最適化・Spotlight・ターミナル追加 |
| Android | 22 | 開発者向けオプション・クイック共有等追加 |
| Chrome | 9 | メモリセーバー・タブグループ追加 |
| **Edge** | 8 | 🆕 垂直タブ・スリープタブ・検索エンジン変更等 |
| **Safari** | 6 | 🆕 履歴削除・リーダー・プライベート等 |
| **Firefox** | 5 | 🆕 トラッキング防止・アドオン等 |
| **Gmail** | 6 | 🆕 署名・不在通知・フィルタ・送信取り消し等 |
| **Googleカレンダー** | 4 | 🆕 共有・通知・祝日表示等 |
| **YouTube** | 4 | 🆕 履歴・自動再生・制限付きモード等 |
| **LINE** | 6 | 🆕 既読回避・バックアップ・送信取消等 |
| Microsoft 365ほか | 48 | Outlook/Teams/Excel/Word/PPT/PA/Zoom/Slack/Drive/Acrobat |

新カテゴリ: 🔋バッテリー・電源 / 🧑‍💻開発者向け

## 🔧 コードレビューで実施した改善

### パフォーマンス
- **検索インデックスの分離**: SearchBarが全データ（手順・tips込み）をクライアントに読み込んでいた問題を修正。`prebuild`で軽量JSON（title/slug/os/aliases/keywordsのみ）を自動生成し、バンドルサイズを大幅削減
- 全設定ページSSG継続（234ページ）

### セキュリティ
- セキュリティヘッダー追加（`X-Content-Type-Options` / `X-Frame-Options: DENY` / `Referrer-Policy` / `Permissions-Policy`）
- `X-Powered-By`ヘッダー除去（`poweredByHeader: false`）

### SEO
- **BreadcrumbList構造化データ**を全詳細ページに追加（HowToと併用。検索結果にパンくず表示）
- sitemap/robotsは新規300ページに自動追随

### アクセシビリティ
- スキップリンク（「本文へスキップ」）追加
- `:focus-visible`スタイル追加（キーボード操作の視認性）
- 検索サジェストに`role="listbox"`/`aria-selected`等を付与

### 保守性・リファクタ
- localStorageキーの重複定義を解消（`BOOKMARK_KEY`をexportし一元化）
- 報告リンクを`NEXT_PUBLIC_REPORT_FORM_URL`環境変数化（未設定時はmailtoフォールバック）
- データ整合性の自動検証（slug重複0 / 特集参照切れ0 / related参照切れ0 を確認済み）
- アプリを「ブラウザ / Microsoft 365 / Google / コミュニケーション / その他」にグループ化（`APP_GROUPS`）

### UX
- `/apps`ページをグループ別表示に刷新
- トップの人気キーワードを実データに合わせ更新（「既読」「キャッシュ削除」「バッテリー」等）
- 特集3本追加: バッテリー長持ち / ブラウザのキャッシュ削除 / LINEを安全に使う

## 🚀 デプロイ手順
1. 環境変数（Vercel）:
   - `NEXT_PUBLIC_SITE_URL` = `https://settingdoko.vercel.app`
   - `NEXT_PUBLIC_REPORT_FORM_URL` = 報告用GoogleフォームURL（任意）
2. Supabase SQL Editor: `supabase/migration_v3.sql` → `supabase/seed_v3.sql`（234件、slug単位アップサート）
3. `git add -A && git commit -m "v4: review + content expansion (234 entries)" && git push origin main`

※ ビルド時に`prebuild`（検索インデックス生成）が自動実行されます。
※ シードSQL再生成: `npm run generate:seed`
