import { NextRequest, NextResponse } from "next/server";
import { createSetting, updateSetting, deleteSetting } from "@/lib/data";
import { isAdminAuthenticated as checkAuth } from "@/lib/admin-auth";

// 新規作成
export async function POST(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const result = await createSetting(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 更新
export async function PUT(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const result = await updateSetting(id, data);
    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    await deleteSetting(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
