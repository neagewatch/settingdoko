import "server-only";

import { serverSupabase } from "./server-supabase";
import { parseSettingWriteInput } from "./setting-validation";

type Candidate = Record<string, unknown> & { slug?: unknown; os?: unknown };

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function key(item: { slug: string; os: string }) {
  return `${item.slug}\u0000${item.os}`;
}

/**
 * 生成・収集候補を公開せず、検証待ちの下書きへ隔離する。
 * 既存行は更新せず、execute=falseの既定動作は必ずdry-run。
 */
export async function quarantineCandidates(candidates: Candidate[], execute = false) {
  if (!serverSupabase) throw new Error("サーバーのSupabase権限が未設定です");

  const valid = candidates.flatMap((candidate) => {
    const parsed = parseSettingWriteInput({
      ...candidate,
      status: "draft",
      published_at: null,
    });
    return parsed ? [parsed] : [];
  });
  const invalid = candidates.length - valid.length;
  const unique = [...new Map(valid.map((candidate) => [key(candidate), candidate])).values()];
  const existing = new Set<string>();

  for (const slugChunk of chunks([...new Set(unique.map((candidate) => candidate.slug))], 100)) {
    const result = await serverSupabase.from("settings").select("slug,os").in("slug", slugChunk);
    if (result.error) throw result.error;
    for (const row of result.data || []) {
      if (typeof row.slug === "string" && typeof row.os === "string") existing.add(key({ slug: row.slug, os: row.os }));
    }
  }

  const newRows = unique.filter((candidate) => !existing.has(key(candidate)));
  if (execute) {
    for (const batch of chunks(newRows, 100)) {
      const result = await serverSupabase.from("settings").insert(batch);
      if (result.error) throw result.error;
    }
  }

  return {
    dryRun: !execute,
    totalCandidates: candidates.length,
    validCandidates: valid.length,
    uniqueCandidates: unique.length,
    invalidCandidates: invalid,
    existingCandidates: unique.length - newRows.length,
    changedRows: execute ? newRows.length : 0,
    wouldInsert: newRows.length,
    status: "draft" as const,
  };
}
