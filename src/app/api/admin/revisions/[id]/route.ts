import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSettingRevisions, updateSetting } from "@/lib/data";
import { requireSameOrigin } from "@/lib/request-security";
import { revalidatePublicSettings } from "@/lib/public-revalidation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getSettingRevisions((await params).id));
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  const body = await request.json();
  const revisionId = body && typeof body.revisionId === "string" ? body.revisionId : "";
  if (!revisionId || revisionId.length > 100) return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const settingId = (await params).id;
  const revision = (await getSettingRevisions(settingId)).find((item) => item.id === revisionId);
  if (!revision) return NextResponse.json({ error: "履歴が見つかりません" }, { status: 404 });
  const { id, updated_at, ...snapshot } = revision.snapshot;
  void id;
  void updated_at;
  const result = await updateSetting(settingId, snapshot);
  revalidatePublicSettings();
  return NextResponse.json(result);
}
