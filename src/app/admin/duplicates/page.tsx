import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated, isMfaLoginAvailable, passwordLoginEnabled } from "@/lib/admin-auth";
import AdminAuth from "../AdminAuth";
import AdminLogoutButton from "../AdminLogoutButton";
import DuplicateReviewClient from "./DuplicateReviewClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "重複候補の確認", robots: "noindex" };

export default async function DuplicateReviewPage() {
  if (!await isAdminAuthenticated()) {
    return <AdminAuth mfaAvailable={isMfaLoginAvailable()} passwordEnabled={passwordLoginEnabled()} />;
  }

  return (
    <div style={{ padding: "32px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <Link href="/admin" style={{ color: "var(--primary)", fontSize: 12, textDecoration: "none" }}>← 管理画面へ戻る</Link>
          <h1 style={{ margin: "10px 0 0", fontSize: 24 }}>重複候補の確認</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 13 }}>「重複では？」と思われる記事を確認し、必要なものだけ削除できます。</p>
        </div>
        <AdminLogoutButton />
      </div>
      <DuplicateReviewClient />
    </div>
  );
}
