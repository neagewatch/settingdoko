import { getAllSettings, getContentRequests, getContentReports, getServerZeroHitSearches } from "@/lib/data";
import { OS_LABELS } from "@/lib/types";
import AdminClient from "./AdminClient";
import AdminAuth from "./AdminAuth";
import AdminLogoutButton from "./AdminLogoutButton";
import { isAdminAuthenticated, isMfaLoginAvailable, passwordLoginEnabled } from "@/lib/admin-auth";
import type { Metadata } from "next";

export const revalidate = 0; // 常に最新を取得
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理画面", robots: "noindex" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  await searchParams;
  const isAuthed = await isAdminAuthenticated();

  if (!isAuthed) {
    return <AdminAuth mfaAvailable={isMfaLoginAvailable()} passwordEnabled={passwordLoginEnabled()} />;
  }

  const [settings, contentRequests, contentReports, serverZeroHitSearches] = await Promise.all([getAllSettings(true), getContentRequests(), getContentReports(), getServerZeroHitSearches()]);
  const catCount: Record<string, number> = {};
  for (const s of settings) {
    catCount[s.category] = (catCount[s.category] || 0) + 1;
  }
  const reviewDueCount = settings.filter((setting) => !setting.verified_at).length;
  const draftCount = settings.filter((setting) => setting.status === "draft").length;
  const publishedCount = settings.length - draftCount;
  const troubleshootCount = settings.filter((setting) => setting.category === "troubleshoot").length;
  const osStats = Object.entries(OS_LABELS).map(([os, label]) => {
    const items = settings.filter((setting) => setting.os === os);
    return {
      os, label, total: items.length,
      published: items.filter((setting) => setting.status !== "draft").length,
      draft: items.filter((setting) => setting.status === "draft").length,
      unverified: items.filter((setting) => !setting.verified_at).length,
    };
  }).filter((stat) => stat.total > 0);

  return (
    <div style={{ padding: "32px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>管理画面</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>全{settings.length}件の設定データ</p>
        </div>
        <AdminLogoutButton />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 32 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>公開中</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{publishedCount}</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "5px 0 0" }}>全{settings.length}件中</p>
        </div>
        {osStats.map((stat) => (
          <div key={stat.os} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{stat.published}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "5px 0 0", lineHeight: 1.6 }}>公開 / 全{stat.total}件<br />下書き {stat.draft}・未確認 {stat.unverified}</p>
          </div>
        ))}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>カテゴリ数</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{Object.keys(catCount).length}</p>
        </div>
        <div style={{ background: reviewDueCount ? "#FFFBEB" : "var(--surface)", border: `1px solid ${reviewDueCount ? "#FBBF24" : "var(--border)"}`, borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <p style={{ fontSize: 12, color: reviewDueCount ? "#92400E" : "var(--text-muted)", marginBottom: 4 }}>未確認記事</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: reviewDueCount ? "#92400E" : "var(--text)" }}>{reviewDueCount}</p>
        </div>
        <div style={{ background: draftCount ? "#FFFBEB" : "var(--surface)", border: `1px solid ${draftCount ? "#FCD34D" : "var(--border)"}`, borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <p style={{ fontSize: 12, color: draftCount ? "#92400E" : "var(--text-muted)", marginBottom: 4 }}>下書き</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: draftCount ? "#92400E" : "var(--text)" }}>{draftCount}</p>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>トラブル解決</p>
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{troubleshootCount}</p>
        </div>
      </div>

      <AdminClient settings={settings} contentRequests={contentRequests} contentReports={contentReports} serverZeroHitSearches={serverZeroHitSearches} />
    </div>
  );
}
