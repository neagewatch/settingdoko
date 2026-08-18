import { NextRequest, NextResponse } from "next/server";
import { getAllSettings } from "@/lib/data";
import { detectDuplicateGroups } from "@/lib/duplicate-detection";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import { revalidatePublicSettings } from "@/lib/public-revalidation";

export const dynamic = "force-dynamic";

const DELETE_CHUNK_SIZE = 100;
const MAX_DELETE_ITEMS = 500;

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function isValidSettingId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 100;
}

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const settings = await getAllSettings(true);
    const groups = detectDuplicateGroups(settings);
    return NextResponse.json({
      ok: true,
      totalArticles: settings.length,
      totalGroups: groups.length,
      groups,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/duplicates] read failed", error);
    return NextResponse.json({ error: "重複候補を確認できませんでした" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

  const values = body as { ids?: unknown; confirmPublished?: unknown };
  const ids = Array.isArray(values.ids)
    ? [...new Set(values.ids.filter(isValidSettingId))]
    : [];
  if (ids.length === 0 || ids.length > MAX_DELETE_ITEMS) {
    return NextResponse.json({ error: `削除対象は1〜${MAX_DELETE_ITEMS}件で指定してください` }, { status: 400 });
  }

  try {
    const { data, error } = await serverSupabase
      .from("settings")
      .select("id,title,status")
      .in("id", ids);
    if (error) throw error;

    const rows = (data || []) as Array<{ id: string; title?: string | null; status?: string | null }>;
    const publishedIds = rows.filter((row) => row.status !== "draft").map((row) => row.id);
    if (publishedIds.length > 0 && values.confirmPublished !== true) {
      return NextResponse.json({
        error: "公開記事が含まれています。削除する場合はもう一度確認してください",
        publishedIds,
      }, { status: 409 });
    }

    let deleted = 0;
    for (const idChunk of chunks(ids, DELETE_CHUNK_SIZE)) {
      const { data: deletedRows, error: deleteError } = await serverSupabase
        .from("settings")
        .delete()
        .in("id", idChunk)
        .select("id");
      if (deleteError) throw deleteError;
      deleted += deletedRows?.length || 0;
    }

    revalidatePublicSettings();
    return NextResponse.json({ ok: true, deleted }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/duplicates] delete failed", error);
    return NextResponse.json({ error: "重複候補を削除できませんでした" }, { status: 500 });
  }
}
