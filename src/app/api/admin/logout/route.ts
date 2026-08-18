import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireSameOrigin } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request); if (originError) return originError;
  (await cookies()).delete("admin_auth");
  return NextResponse.json({ ok: true });
}
