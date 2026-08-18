import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import { revalidatePublicSettings } from "@/lib/public-revalidation";

const UPDATE_CHUNK_SIZE = 200;

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

export async function PATCH(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body || typeof body !== "object") return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  const values = body as { ids?: unknown; status?: unknown };
  const ids = Array.isArray(values.ids)
    ? [...new Set(values.ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 100))]
    : [];
  const status = values.status === "published" || values.status === "draft" ? values.status : null;

  if (!status || ids.length === 0) {
    return NextResponse.json({ error: "対象記事と公開状態を確認してください" }, { status: 400 });
  }

  const payload = status === "published"
    ? { status, published_at: new Date().toISOString() }
    : { status, published_at: null };
  let updated = 0;
  for (const idChunk of chunks(ids, UPDATE_CHUNK_SIZE)) {
    const { data, error } = await serverSupabase
      .from("settings")
      .update(payload)
      .in("id", idChunk)
      .select("id,status,published_at");

    if (error) return NextResponse.json({ error: "公開状態を更新できませんでした" }, { status: 500 });
    updated += data?.length || 0;
  }

  revalidatePublicSettings();
  return NextResponse.json({ ok: true, updated, status });
}
