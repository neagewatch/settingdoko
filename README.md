# 設定どこ？ — PC・スマホの設定ナビ

「設定の場所がわからない」を最速で解決する、構造化された設定DBサービス。

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 で確認。Supabase未接続でもサンプルデータで動作する。

## Supabase接続

1. Supabaseでプロジェクト作成
2. `.env.local` を作成:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

3. SQL Editorで `supabase/schema.sql` → `supabase/seed.sql` を順に実行

## DB設計

settingsテーブルが中心。slug + os でユニーク。同じslugのOS違いレコードでOS切り替えを実現。

## デプロイ

```bash
vercel
```

環境変数に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定。
