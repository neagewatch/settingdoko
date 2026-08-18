import { NextRequest, NextResponse } from "next/server";
import { createSetting, updateSetting, deleteSetting } from "@/lib/data";
import { isAdminAuthenticated as checkAuth } from "@/lib/admin-auth";
import { requireSameOrigin } from "@/lib/request-security";
import { parseSettingWriteInput } from "@/lib/setting-validation";
import { revalidatePublicSettings } from "@/lib/public-revalidation";

// 新規作成
export async function POST(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  try {
    const body = await request.json();
    const input = parseSettingWriteInput(body);
    if (!input) return NextResponse.json({ error: "記事の入力内容が不正です" }, { status: 400 });
    const result = await createSetting(input);
    revalidatePublicSettings();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "記事を保存できませんでした" }, { status: 500 });
  }
}

// 更新
export async function PUT(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "記事の入力内容が不正です" }, { status: 400 });
    const { id, ...data } = body;
    const input = parseSettingWriteInput(data);
    if (typeof id !== "string" || !input) return NextResponse.json({ error: "記事の入力内容が不正です" }, { status: 400 });
    const result = await updateSetting(id, input);
    revalidatePublicSettings();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "記事を保存できませんでした" }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request); if (originError) return originError;
  try {
    const body = await request.json();
    const id = body && typeof body === "object" && typeof body.id === "string" ? body.id : "";
    if (typeof id !== "string") return NextResponse.json({ error: "記事IDが不正です" }, { status: 400 });
    await deleteSetting(id);
    revalidatePublicSettings();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "記事を削除できませんでした" }, { status: 500 });
  }
}
