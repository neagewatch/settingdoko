import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSettingRevisions, updateSetting } from "@/lib/data";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getSettingRevisions((await params).id));
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { revisionId } = await request.json();
  const settingId = (await params).id;
  const revision = (await getSettingRevisions(settingId)).find((item) => item.id === revisionId);
  if (!revision) return NextResponse.json({ error: "履歴が見つかりません" }, { status: 404 });
  const { id, updated_at, ...snapshot } = revision.snapshot;
  const result = await updateSetting(settingId, snapshot);
  return NextResponse.json(result);
}
