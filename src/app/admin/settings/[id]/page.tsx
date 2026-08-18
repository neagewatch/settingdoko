import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingEditorPage } from "../../SettingEditor";
import AdminAuth from "../../AdminAuth";
import { isAdminAuthenticated, isMfaLoginAvailable, passwordLoginEnabled } from "@/lib/admin-auth";
import { getSettingById } from "@/lib/data";

export const metadata: Metadata = { title: "設定を編集", robots: "noindex" };

export default async function EditSettingPage({ params }: { params: Promise<{ id: string }> }) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return <AdminAuth mfaAvailable={isMfaLoginAvailable()} passwordEnabled={passwordLoginEnabled()} />;
  }

  const { id } = await params;
  const setting = await getSettingById(id);
  if (!setting) notFound();

  return <SettingEditorPage setting={setting} />;
}
