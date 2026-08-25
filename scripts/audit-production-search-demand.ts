import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください（キーは出力・共有しないでください）。");
  process.exit(2);
}

const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

function errorStatus(error: { code?: string; message?: string } | null) {
  return {
    status: "UNAVAILABLE",
    code: error?.code || "UNKNOWN",
    detail: error?.message || "読み取りに失敗しました",
  };
}

async function main() {
  const daily = await client
    .from("search_query_daily")
    .select("searches,zero_hits,weak_results,last_seen_at")
    .order("last_seen_at", { ascending: false })
    .limit(5000);
  const raw = await client.from("search_logs").select("id", { count: "exact", head: true });

  const dailyRows = daily.error ? [] : (daily.data || []);
  const totals = dailyRows.reduce((result, row) => ({
    searches: result.searches + Number(row.searches || 0),
    zeroHits: result.zeroHits + Number(row.zero_hits || 0),
    weakResults: result.weakResults + Number(row.weak_results || 0),
  }), { searches: 0, zeroHits: 0, weakResults: 0 });

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    searchQueryDaily: daily.error ? errorStatus(daily.error) : {
      status: "PRESENT",
      aggregateRows: dailyRows.length,
      ...totals,
      latestSeenAt: dailyRows[0]?.last_seen_at || null,
    },
    searchLogs: raw.error ? errorStatus(raw.error) : {
      status: "PRESENT",
      rawRows: raw.count || 0,
    },
    privacy: "検索語・IP・ユーザー識別子は出力していません",
  }, null, 2));
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
