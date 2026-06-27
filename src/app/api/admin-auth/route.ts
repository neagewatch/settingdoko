import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "settingdoko2024";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set("admin_auth", ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
