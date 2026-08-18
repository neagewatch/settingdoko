import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated, isMfaLoginAvailable, passwordLoginEnabled } from "@/lib/admin-auth";
import AdminAuth from "../AdminAuth";
import AdminLogoutButton from "../AdminLogoutButton";
import QualityReviewClient from "./QualityReviewClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "低品質記事の抽出", robots: "noindex" };

export default async function QualityReviewPage() {
  if (!await isAdminAuthenticated()) {
    return <AdminAuth mfaAvailable={isMfaLoginAvailable()} passwordEnabled={passwordLoginEnabled()} />;
  }

  return (
    <div style={{ padding: "32px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <Link href="/admin" style={{ color: "var(--primary)", fontSize: 12, textDecoration: "none" }}>← 管理画面へ戻る</Link>
          <h1 style={{ margin: "10px 0 0", fontSize: 24 }}>低品質記事の抽出</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 13 }}>内容が足りない記事を見つけ、編集の優先順位を付けます。</p>
        </div>
        <AdminLogoutButton />
      </div>
      <QualityReviewClient />
    </div>
  );
}
