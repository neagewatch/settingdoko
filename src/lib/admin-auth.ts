import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
const MFA_ONLY = ["mfa", "supabase-mfa"].includes((process.env.ADMIN_AUTH_MODE || "").toLowerCase());
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || ADMIN_PASSWORD;

function tokenAal(token: string): string | null {
  try { return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).aal || null; }
  catch { return null; }
}

export function isMfaLoginAvailable() { return ADMIN_EMAILS.length > 0 && !!supabase; }

function signPasswordSession(expiresAt: number): string {
  if (!ADMIN_SESSION_SECRET) throw new Error("管理者セッションの署名キーが未設定です");
  return createHmac("sha256", ADMIN_SESSION_SECRET).update(`password:${expiresAt}`).digest("base64url");
}

export function createPasswordSession(): string {
  if (!ADMIN_PASSWORD || !ADMIN_SESSION_SECRET || MFA_ONLY) throw new Error("パスワード認証は無効です");
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  return `pwd.${expiresAt}.${signPasswordSession(expiresAt)}`;
}

function isPasswordSession(token: string): boolean {
  if (!ADMIN_SESSION_SECRET) return false;
  const [prefix, expiresAtText, signature] = token.split(".");
  const expiresAt = Number(expiresAtText);
  if (prefix !== "pwd" || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) return false;
  const expected = signPasswordSession(expiresAt);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function isMfaAdminToken(token?: string): Promise<boolean> {
  if (!token || !supabase || !ADMIN_EMAILS.length || tokenAal(token) !== "aal2") return false;
  const { data, error } = await supabase.auth.getUser(token);
  return !error && !!data.user.email && ADMIN_EMAILS.includes(data.user.email.toLowerCase());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get("admin_auth")?.value;
  if (await isMfaAdminToken(token)) return true;
  return !MFA_ONLY && !!ADMIN_PASSWORD && !!token && isPasswordSession(token);
}

export function passwordLoginEnabled() { return !MFA_ONLY && !!ADMIN_PASSWORD && !!ADMIN_SESSION_SECRET; }
