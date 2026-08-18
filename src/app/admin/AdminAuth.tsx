"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function AdminAuth({ mfaAvailable, passwordEnabled }: { mfaAvailable: boolean; passwordEnabled: boolean }) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mfaPassword, setMfaPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function finishMfaLogin() {
    const { data } = await supabase!.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error("セッションを確認できませんでした");
    const response = await fetch("/api/admin-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken }) });
    if (!response.ok) throw new Error("このメールアドレスには管理権限がないか、二段階認証が完了していません");
    router.refresh();
  }

  async function handleMfaLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true); setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: mfaPassword });
      if (signInError) throw signInError;
      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;
      const factor = factors.totp.find((item) => item.status === "verified");
      if (factor) { setFactorId(factor.id); return; }
      const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "設定どこ？管理画面" });
      if (enrollmentError) throw enrollmentError;
      setFactorId(enrollment.id); setQr(enrollment.totp.qr_code);
    } catch (err) { setError(err instanceof Error ? err.message : "ログインできませんでした"); }
    finally { setLoading(false); }
  }

  async function verifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !factorId) return;
    setLoading(true); setError("");
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
      if (verifyError) throw verifyError;
      await finishMfaLogin();
    } catch (err) { setError(err instanceof Error ? err.message : "認証できませんでした"); }
    finally { setLoading(false); }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/admin-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) router.refresh();
    else { setError("パスワードが違います"); setPassword(""); }
  }

  const input = { width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`, background: "var(--bg)", color: "var(--text)", fontSize: 15, marginBottom: 12, outline: "none" };

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "40px 48px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>管理画面</h1>
        {mfaAvailable && !factorId && <form onSubmit={handleMfaLogin}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>メールアドレス・パスワード・認証アプリでログイン</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="管理者メールアドレス" autoFocus required style={input} />
          <input type="password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} placeholder="パスワード" required style={input} />
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>{loading ? "確認中…" : "次へ"}</button>
        </form>}
        {mfaAvailable && factorId && <form onSubmit={verifyMfa}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>{qr ? "認証アプリでQRコードを読み取り、表示された6桁コードを入力してください" : "認証アプリに表示された6桁コードを入力してください"}</p>
          {qr && <Image src={qr} alt="認証アプリ登録用QRコード" width={180} height={180} unoptimized style={{ width: 180, height: 180, marginBottom: 16 }} />}
          <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="6桁の認証コード" autoFocus required style={input} />
          <button type="submit" disabled={loading || code.length !== 6} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>{loading ? "確認中…" : "二段階認証でログイン"}</button>
        </form>}
        {passwordEnabled && <form onSubmit={handlePasswordLogin} style={{ marginTop: mfaAvailable ? 22 : 0, paddingTop: mfaAvailable ? 22 : 0, borderTop: mfaAvailable ? "1px solid var(--border)" : undefined }}>
          {mfaAvailable && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>移行確認用の従来ログイン</p>}
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="従来の管理パスワード" style={input} />
          <button type="submit" style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>従来パスワードでログイン</button>
        </form>}
        {error && <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
