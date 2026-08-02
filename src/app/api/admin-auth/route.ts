import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isMfaAdminToken, passwordLoginEnabled } from "@/lib/admin-auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  const { password, accessToken } = await request.json();
  const mfaAuthenticated = typeof accessToken === "string" && await isMfaAdminToken(accessToken);
  const passwordAuthenticated = passwordLoginEnabled() && !!ADMIN_PASSWORD && password === ADMIN_PASSWORD;
  if (!mfaAuthenticated && !passwordAuthenticated) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set("admin_auth", mfaAuthenticated ? accessToken : ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: mfaAuthenticated ? 60 * 60 : 60 * 60 * 24 * 7,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
