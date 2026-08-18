"use client";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin"); router.refresh(); }
  return <button onClick={logout} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", cursor: "pointer", fontSize: 13 }}>ログアウト</button>;
}
