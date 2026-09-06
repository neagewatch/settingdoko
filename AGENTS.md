<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SettingDoko 作業ルール

## 作業前後の共有

- 作業を始める前に [`docs/shared-memo.md`](docs/shared-memo.md) を読み、Mac/Windows 間で共有されている現状と次の作業を確認する。
- 意思決定、調査結果、未解決の問題、次に行う作業が変わったら、作業終了時に `docs/shared-memo.md` を更新する。
- 共有メモは会話ログの代わりに、後から再開するために必要な事実・判断・手順だけを記録する。パスワード、APIキー、トークン、個人情報は書かない。
- 共有メモを更新したら、可能な範囲で同じ変更をコミットして GitHub に push し、別の環境から `git pull --rebase origin main` で取得できる状態にする。

## プロジェクト概要

- 「設定どこ？」は、PC・スマホの設定場所を案内する Web サービス。
- Next.js 16 App Router、TypeScript、Tailwind CSS、Supabase を使用する。開発・ビルドは `vinext` 経由の npm scripts を使う。
- `.env.local` などの秘密情報やローカル専用ファイルはコミットしない。
- コンテンツ運用の判断は [`docs/content-operations.md`](docs/content-operations.md) を確認する。

## 検証コマンド

変更内容に応じて、次のコマンドを実行する。

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

すべてを実行できない場合は、共有メモに実行したコマンドと未実行の理由を残す。
