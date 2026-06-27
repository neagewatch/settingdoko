import { getAllSettings } from "@/lib/data";
import { OS_LABELS, CATEGORIES } from "@/lib/types";
import Link from "next/link";
import AdminClient from "./AdminClient";
import AdminAuth from "./AdminAuth";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "管理画面", robots: "noindex" };

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "settingdoko2024";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  const isAuthed = authCookie?.value === ADMIN_PASSWORD || params.auth === ADMIN_PASSWORD;

  if (!isAuthed) {
    return <AdminAuth />;
  }

  const settings = await getAllSettings();
  const osCount: Record<string, number> = {};
  const catCount: Record<string, number> = {};
  for (const s of settings) {
    osCount[s.os] = (osCount[s.os] || 0) + 1;
    catCount[s.category] = (catCount[s.category] || 0) + 1;
  }

  return (
    <div style={{ padding: "32px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>管理画面</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>全{settings.length}件の設定データ</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 32 }}>
        {Object.entries(osCount).map(([os, count]) => (
          <div key={os} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{OS_LABELS[os] || os}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{count}</p>
          </div>
        ))}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>カテゴリ数</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{Object.keys(catCount).length}</p>
        </div>
      </div>

      <AdminClient settings={settings} />

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: 32 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>設定データ一覧</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["タイトル", "OS", "カテゴリ", "手順数", "alias数"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <Link href={`/setting/${s.slug}?os=${s.os}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{s.title}</Link>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.path.join(" › ")}</div>
                  </td>
                  <td style={{ padding: "10px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{OS_LABELS[s.os] || s.os}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{CATEGORIES[s.category] || s.category}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text-secondary)", textAlign: "center" }}>{s.steps.length}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text-secondary)", textAlign: "center" }}>{s.aliases.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
