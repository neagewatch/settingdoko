import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllSettings } from "@/lib/data";
import { analyzeSearchDemand, toAcquisitionBacklog, type SearchLogRecord } from "@/lib/search-demand";
import { serverSupabase } from "@/lib/server-supabase";

export const dynamic = "force-dynamic";

function csvValue(value: unknown): string {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(","))].join("\n") + "\n";
}

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!serverSupabase) return NextResponse.json({ error: "サーバー権限が未設定です" }, { status: 503 });

  const aggregate = await serverSupabase
    .from("search_query_daily")
    .select("day,sample_query,normalized_query,os,searches,zero_hits,weak_results,last_seen_at")
    .order("day", { ascending: false })
    .limit(5000);

  let logs: SearchLogRecord[] = [];
  if (!aggregate.error && aggregate.data) {
    logs = aggregate.data.map((row) => ({
      query: row.sample_query,
      normalized_query: row.normalized_query,
      os: row.os || null,
      result_count: row.zero_hits > 0 ? 0 : 1,
      created_at: row.last_seen_at || `${row.day}T00:00:00.000Z`,
      searches: row.searches,
      zero_hits: row.zero_hits,
      weak_results: row.weak_results,
    }));
  } else {
    const raw = await serverSupabase
      .from("search_logs")
      .select("query,normalized_query,os,result_count,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (raw.error) return NextResponse.json({ error: "検索需要を取得できませんでした" }, { status: 500 });
    logs = (raw.data || []) as SearchLogRecord[];
  }

  const clusters = analyzeSearchDemand(logs, await getAllSettings(true));
  const backlog = toAcquisitionBacklog(clusters);
  if (request.nextUrl.searchParams.get("format") === "csv") {
    return new NextResponse(csv(backlog), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="settingdoko-acquisition-backlog-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  return NextResponse.json({
    ok: true,
    clusters,
    backlog,
    counts: {
      clusters: clusters.length,
      missingAlias: clusters.filter((item) => item.disposition === "MISSING_ALIAS").length,
      missingGuide: clusters.filter((item) => item.disposition === "MISSING_GUIDE").length,
      weakResult: clusters.filter((item) => item.disposition === "WEAK_RESULT").length,
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
