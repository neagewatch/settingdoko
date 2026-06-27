# 設定どこ？ - PC・スマホの設定ナビ

「設定の場所がわからない」を最速で解決するWebサービス。

## 技術スタック

- Next.js 16 (App Router) / TypeScript / Tailwind CSS
- Supabase (PostgreSQL) / Vercel

## ローカル開発

```bash
npm install
npm run dev
# → http://localhost:3000（Supabase未設定でもサンプルデータで動作）
```

## Supabase接続

1. Supabaseプロジェクト作成
2. `supabase-schema.sql` をSQL Editorで実行
3. `.env.local` に接続情報を設定

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                 # トップ（検索）
│   ├── search/page.tsx          # 検索結果
│   ├── setting/[slug]/page.tsx  # 設定詳細（OS切り替え可）
│   ├── os/[os]/page.tsx         # OS別一覧
│   ├── admin/page.tsx           # 管理画面
│   └── api/search/route.ts     # 検索API
├── components/
│   ├── SearchBox.tsx            # 検索ボックス（アニメプレースホルダー付）
│   ├── SettingCard.tsx          # 設定カード
│   ├── PathTrail.tsx            # 設定導線パス表示
│   ├── OSTabs.tsx               # OS切り替えタブ
│   └── OSBadge.tsx              # OSバッジ
└── lib/
    ├── supabase.ts / types.ts / data.ts / search.ts / sample-data.ts
```

## SEO対応

動的title/description、OGP、JSON-LD (HowTo)、パンくず、sitemap対応構成。
