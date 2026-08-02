import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!serverSupabase) return NextResponse.json({ error: "no supabase" }, { status: 500 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return NextResponse.json({ error: "対応していない画像形式です" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "画像は10MB以下にしてください" }, { status: 400 });

  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[file.type]!;
  const fileName = `screenshots/${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error } = await serverSupabase.storage
    .from("settings-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = serverSupabase.storage.from("settings-images").getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
