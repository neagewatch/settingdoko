import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
const MFA_ONLY = process.env.ADMIN_AUTH_MODE === "supabase-mfa";

function tokenAal(token: string): string | null {
  try { return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).aal || null; }
  catch { return null; }
}

export function isMfaLoginAvailable() { return ADMIN_EMAILS.length > 0 && !!supabase; }

export async function isMfaAdminToken(token?: string): Promise<boolean> {
  if (!token || !supabase || !ADMIN_EMAILS.length || tokenAal(token) !== "aal2") return false;
  const { data, error } = await supabase.auth.getUser(token);
  return !error && !!data.user.email && ADMIN_EMAILS.includes(data.user.email.toLowerCase());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get("admin_auth")?.value;
  if (await isMfaAdminToken(token)) return true;
  return !MFA_ONLY && !!ADMIN_PASSWORD && token === ADMIN_PASSWORD;
}

export function passwordLoginEnabled() { return !MFA_ONLY; }
