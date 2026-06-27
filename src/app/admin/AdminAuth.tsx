"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuth() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Set cookie via API
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "40px 48px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>管理画面</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>パスワードを入力してください</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="パスワード"
            autoFocus
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 8,
              border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
              background: "var(--bg)", color: "var(--text)", fontSize: 15,
              marginBottom: 12, outline: "none",
            }}
          />
          {error && <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>パスワードが違います</p>}
          <button
            type="submit"
            style={{ width: "100%", padding: "12px", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
