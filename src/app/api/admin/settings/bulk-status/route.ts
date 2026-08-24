import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { requireSameOrigin } from "@/lib/request-security";
import { serverSupabase } from "@/lib/server-supabase";
import { revalidatePublicSettings } from "@/lib/public-revalidation";
import { getAllSettings } from "@/lib/data";
import { publicationBlocks } from "@/lib/publication-policy";

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
  const values = body as { ids?: unknown; status?: unknown; execute?: unknown };
  const ids = Array.isArray(values.ids)
    ? [...new Set(values.ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 100))]
    : [];
  const status = values.status === "published" || values.status === "draft" ? values.status : null;

  if (!status || ids.length === 0 || ids.length > 500) {
    return NextResponse.json({ error: "対象記事と公開状態を確認してください" }, { status: 400 });
  }

  if (status === "published") {
    const byId = new Map((await getAllSettings(true)).map((setting) => [setting.id, setting]));
    const blocked = ids.flatMap((id) => {
      const setting = byId.get(id);
      if (!setting) return [{ id, title: "（記事なし）", blocks: [{ code: "not-found", message: "記事が見つかりません" }] }];
      const blocks = publicationBlocks({ ...setting, status: "published" });
      return blocks.length ? [{ id, title: setting.title, blocks }] : [];
    });
    if (blocked.length) {
      return NextResponse.json({ error: "公開基準を満たさない記事が含まれています", blocked: blocked.slice(0, 50), blockedCount: blocked.length }, { status: 409 });
    }
  }

  if (values.execute !== true) {
    return NextResponse.json({ ok: true, dryRun: true, wouldUpdate: ids.length, status }, { headers: { "Cache-Control": "no-store" } });
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
  return NextResponse.json({ ok: true, dryRun: false, updated, status });
}
