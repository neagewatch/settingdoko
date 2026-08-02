"use client";

export default function AdminLogoutButton() {
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin"); }
  return <button onClick={logout} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", cursor: "pointer", fontSize: 13 }}>ログアウト</button>;
}
