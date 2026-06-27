# 設定どこ？ — 公開手順書

## 全体の流れ

```
Supabase作成 → スキーマ実行 → データ投入 → Vercelデプロイ → 環境変数設定 → 公開
```

---

## Step 1: Supabaseプロジェクト作成

1. https://supabase.com にアクセス・ログイン
2. 「New project」をクリック
3. 設定:
   - **Name**: settingdoko
   - **Database Password**: 任意（メモしておく）
   - **Region**: Northeast Asia (Tokyo) を選択
4. 「Create new project」→ 2〜3分待つ

---

## Step 2: スキーマを実行

1. Supabaseダッシュボード左メニュー「SQL Editor」をクリック
2. 「New query」をクリック
3. `supabase-schema.sql` の内容を**全コピー**してペースト
4. 「Run」(Ctrl+Enter) をクリック
5. 「Success」が出ればOK

---

## Step 3: サンプルデータを投入

1. SQL Editorで「New query」をクリック
2. `supabase-seed.sql` の内容を**全コピー**してペースト
3. 「Run」をクリック
4. 最後に表示される `SELECT os, count(*)...` の結果で件数を確認:
   ```
   ios       | 12
   macos     | 10
   windows11 | 21
   ```

---

## Step 4: Supabaseの接続情報を取得

1. Supabaseダッシュボード左メニュー「Settings」→「API」
2. 以下をメモ:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon / public key**: `eyJ...` で始まる長い文字列

---

## Step 5: Vercelにデプロイ

### 5-1. GitHubにpush（初回のみ）

```bash
cd /Users/mm/settingdoko

# Gitリポジトリ初期化（まだなければ）
git init
git add -A
git commit -m "initial commit"

# GitHubで新リポジトリ作成後:
git remote add origin https://github.com/YOUR_NAME/settingdoko.git
git push -u origin main
```

### 5-2. Vercelでデプロイ

1. https://vercel.com にログイン
2. 「Add New → Project」
3. 作成したGitHubリポジトリを選択
4. **Environment Variables** に以下を追加:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
   | `NEXT_PUBLIC_BASE_URL` | `https://settingdoko.vercel.app` (後で確定URLに変更) |

5. 「Deploy」をクリック → 1〜2分待つ
6. デプロイ完了 → URLが発行される

---

## Step 6: 動作確認チェックリスト

- [ ] トップページが表示される
- [ ] 検索ボックスでサジェストが出る（例:「Bluetooth」と入力）
- [ ] 設定詳細ページが表示される
- [ ] ダークモードが切り替わる
- [ ] `/sitemap.xml` にURLが列挙されている
- [ ] `/robots.txt` が表示される
- [ ] `/admin` に設定データ一覧が出る
- [ ] `/admin` のAI補助でaliasが生成される（要: Anthropic APIキー設定）

---

## Step 7: (任意) AI補助を有効にする

管理画面のAI補助機能を使う場合:

Vercel環境変数に追加:
| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

※ ユーザー向けには常時APIを叩かない設計のため、管理画面のみ使用

---

## Step 8: (任意) カスタムドメイン設定

1. Vercelダッシュボード → プロジェクト → 「Settings → Domains」
2. 独自ドメインを入力してDNS設定
3. `NEXT_PUBLIC_BASE_URL` 環境変数をカスタムドメインに更新
4. 「Redeploy」で再デプロイ

---

## データ追加方法

### Supabase UIから手動追加
1. Supabase → Table Editor → settings
2. 「Insert row」で追加

### 管理画面のAI補助で効率化
1. `/admin` を開く
2. タイトルなど入力 → 「AIで生成する」
3. 生成されたaliasとkeywordsをコピー
4. Supabaseに貼り付けてINSERT

### SQLで一括追加
`supabase-seed.sql` と同じ形式でINSERTを追記して実行

---

## トラブルシュート

**設定が表示されない**
→ Supabaseの環境変数が正しいか確認。ダッシュボードのTable Editorでデータが入っているか確認。

**検索が動かない**
→ ブラウザのConsoleを開いてエラーを確認。`/api/search?q=test` を直接ブラウザで開いてJSONが返るか確認。

**サジェストが出ない**
→ CORSエラーの可能性。Vercelの場合は自動で同一オリジンなのでURL設定を確認。
