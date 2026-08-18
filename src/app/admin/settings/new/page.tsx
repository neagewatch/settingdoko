import type { Metadata } from "next";
import { SettingEditorPage } from "../../SettingEditor";
import AdminAuth from "../../AdminAuth";
import { isAdminAuthenticated, isMfaLoginAvailable, passwordLoginEnabled } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "新規設定を追加", robots: "noindex" };

export default async function NewSettingPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return <AdminAuth mfaAvailable={isMfaLoginAvailable()} passwordEnabled={passwordLoginEnabled()} />;
  }
  return <SettingEditorPage />;
}
