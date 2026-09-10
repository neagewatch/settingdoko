<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SettingDoko 作業ルール

## 作業前後の共有

- 作業を始める前に [`docs/shared-notes.md`](docs/shared-notes.md) を最後まで読み、Mac/Windows 間で共有されている現状と次の作業を確認する。
- 意思決定、調査結果、未解決の問題、次の作業が変わったら、作業終了時に [`docs/shared-notes.md`](docs/shared-notes.md) を更新する。
- 共有ノートは会話ログの全文ではなく、後から再開するために必要な事実・判断・手順だけを記録する。パスワード、APIキー、トークン、個人情報は書かない。
- 旧ファイル名の [`docs/shared-memo.md`](docs/shared-memo.md) は互換案内として残し、内容の正本は `shared-notes.md` とする。
- 共有ノートを更新したら、可能な範囲で同じ変更をコミットして GitHub に push し、別の環境から `git pull --rebase origin main` で取得できる状態にする。ただし本番デプロイや本番データ変更を伴う場合は、依頼者の確認を得るまで実行しない。

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

すべてを実行できない場合は、共有ノートに実行したコマンドと未実行の理由を残す。

## 安全な運用

- 本番サイトは比較・確認用とし、ローカルまたはプレビューで実装・検証する。
- 本番の問い合わせ送信、テスト投稿、ダミーデータ投入、本番データの削除・一括更新は行わない。
- APIキーや秘密情報はGitHubに保存しない。

## Codex作業終了時の引き継ぎルール

作業を終了する前に、必ず docs/shared-notes.md を更新すること。

以下の内容を残すこと。

- 今回実施したこと
- 変更した主なファイル
- 設計上の判断と理由
- 未解決の問題
- 次にやるべきこと
- 次のCodexが知っておくべき注意点

単なる作業ログではなく、
別のPC・別のCodexセッションが読んだだけで
作業を継続できる内容にすること。

既に書かれている重要な情報は削除せず、
古くなった情報だけ整理すること。
