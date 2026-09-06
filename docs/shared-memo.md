# SettingDoko 共有メモ

このファイルは、Mac と Windows で作業を再開するときに参照する共有メモです。GitHub に push された内容を正本とし、会話ログの全文ではなく、現状・決定事項・未解決事項・次の作業を記録します。

## 使い方

1. 作業前に `git pull --rebase origin main` を実行し、このファイルを読む。
2. 重要な判断や作業結果が出たら、日付・環境・内容を追記する。
3. 作業後に、必要ならこのファイルを含めてコミットし、`git push origin main` で GitHub に反映する。
4. 秘密情報（APIキー、パスワード、アクセストークンなど）や個人情報は記録しない。

## プロジェクトの現状

- サービス: 「設定どこ？」— PC・スマホの設定場所を案内する Web サービス
- 技術: Next.js 16 App Router / TypeScript / Tailwind CSS / Supabase
- 開発サーバー: `npm install` 後に `npm run dev`（通常は `http://localhost:3000`）
- サンプルデータ: Supabase の設定がなくてもローカル開発では利用できる
- コンテンツ運用基準: [`docs/content-operations.md`](content-operations.md)
- エージェント向けルール: [`AGENTS.md`](../AGENTS.md)

## 現在の決定事項

- Mac/Windows 間で作業の前提を共有するため、リポジトリ内にこのメモを置く。
- Next.js の自動管理ブロックを保持したうえで、プロジェクト固有のルールを `AGENTS.md` に追記する。
- Next.js の変更時は、リポジトリ内の `node_modules/next/dist/docs/` にある該当ガイドを先に確認する。

## 未解決事項・次の作業

現時点で引き継ぐ未解決事項はありません。新しい作業を始めるときは、ここに目的・対象ファイル・次の一手を追記してください。

## 作業ログ

| 日付 | 環境 | 内容 | 次の一手 |
| --- | --- | --- | --- |
| 2026-09-07 | Mac | 共有メモとプロジェクト固有の `AGENTS.md` ルールを追加 | GitHub に push 後、別環境では pull して内容を確認 |
