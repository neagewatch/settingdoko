# 管理画面の二段階認証（TOTP）移行手順

現在の管理画面は既存運用を止めないため、移行完了までパスワード方式を維持します。TOTPを有効化した後は、認証アプリの6桁コードを必須にしてください。

## 事前準備

1. Supabase Dashboard の **Authentication > Users** で管理者用メールアドレスを作成し、メール確認を完了します。
2. **Authentication > MFA** で TOTP の enrollment / verification が有効であることを確認します。TOTPはGoogle Authenticator、Microsoft Authenticator、1Password等で利用できます。
3. Vercelに以下を設定します。

   - `ADMIN_EMAILS` : 管理を許可するメールアドレスをカンマ区切りで指定
   - `SUPABASE_SERVICE_ROLE_KEY` : サーバー専用。`NEXT_PUBLIC_`を付けず、ブラウザへ公開しない

4. 管理者がログイン後にQRコードを読み取り、TOTP登録・コード検証を完了します。

## 切替時の安全確認

- 新方式を有効化する前に、別ブラウザまたはシークレットウィンドウで「メール・パスワード＋TOTP」でログインできることを確認します。
- 管理者を最低2名登録し、片方の認証アプリを紛失しても復旧できるようにします。
- `?auth=...` のURLログインは有効化と同時に廃止します。URLにパスワードを含める運用はしません。

SupabaseのTOTPは、登録（enroll）→チャレンジ（challenge）→検証（verify）の順で有効化し、管理APIではAAL2（二要素認証済み）のJWTのみを許可します。
