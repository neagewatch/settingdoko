import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { serverSupabase } from "@/lib/server-supabase";
import { requireSameOrigin } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request); if (originError) return originError;
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!serverSupabase) return NextResponse.json({ error: "no supabase" }, { status: 500 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "JPEG・PNG・WebPのみ対応しています" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "画像は8MB以下にしてください" }, { status: 400 });

  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type]!;
  const fileName = `screenshots/${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isPng = bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if ((file.type === "image/png" && !isPng) || (file.type === "image/jpeg" && !isJpeg) || (file.type === "image/webp" && !isWebp)) return NextResponse.json({ error: "画像ファイルの内容を確認できません" }, { status: 400 });

  // 初回利用時にも管理画面だけで使えるよう、バケットを自動準備する。
  const storage = serverSupabase.storage;
  const { data: bucket, error: bucketError } = await storage.getBucket("settings-images");
  if (!bucketError && bucket && !bucket.public) {
    await storage.updateBucket("settings-images", { public: true });
  } else if (bucketError || !bucket) {
    const { error: createError } = await storage.createBucket("settings-images", { public: true, fileSizeLimit: "8MB", allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] });
    if (createError && !/already exists|duplicate/i.test(createError.message || "")) {
      return NextResponse.json({ error: "画像保存先を準備できませんでした" }, { status: 500 });
    }
  }

  const { error } = await storage
    .from("settings-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (error) return NextResponse.json({ error: "画像を保存できませんでした" }, { status: 500 });

  const { data } = storage.from("settings-images").getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
