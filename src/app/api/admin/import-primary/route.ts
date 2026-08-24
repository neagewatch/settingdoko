import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { primarySettings } from "@/lib/primary-data";
import { requireSameOrigin } from "@/lib/request-security";
import { revalidatePublicSettings } from "@/lib/public-revalidation";
import { quarantineCandidates } from "@/lib/draft-import";

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  try {
    const body = await request.json().catch(() => ({}));
    const execute = Boolean(body && typeof body === "object" && "execute" in body && body.execute === true);
    const report = await quarantineCandidates(primarySettings, execute);
    if (execute) revalidatePublicSettings();
    return NextResponse.json({ ok: true, ...report }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "主対象候補を下書きへ隔離できませんでした" }, { status: 500 });
  }
}
