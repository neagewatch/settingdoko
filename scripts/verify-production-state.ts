import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

type Check = { name: string; status: "PRESENT" | "MISSING" | "ERROR" | "NOT_CHECKED"; detail?: string };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const migrationFiles = [
  "supabase-upgrade-operations.sql",
  ".content-operations/latest/source-checks.sql",
  ".content-operations/latest/reverification-flags.sql",
];
const migrationFileState = migrationFiles.map((file) => ({ file, onDisk: fs.existsSync(file) }));

if (!url || !serviceKey) {
  console.log(JSON.stringify({
    status: "NOT_RUN",
    reason: "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY がこの実行環境にありません。認証情報を出力せず、Supabase本番への接続確認は保留しました。",
    migrationFiles: migrationFileState,
    checks: [],
  }, null, 2));
  process.exit(0);
}

async function main() {
  const client = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
  const checks: Check[] = [];

  async function checkTable(table: string, columns: string[]) {
    const response = await client.from(table).select(columns.join(",")).limit(1);
    if (!response.error) {
      checks.push({ name: `${table} (${columns.join(",")})`, status: "PRESENT" });
      return;
    }
    const missing = response.error.code === "PGRST205" || response.error.code === "42703";
    checks.push({ name: `${table} (${columns.join(",")})`, status: missing ? "MISSING" : "ERROR", detail: `${response.error.code || "unknown"}: ${response.error.message}`.slice(0, 240) });
  }

  await checkTable("settings", ["id", "index_status", "content_type", "workflow_status", "source_type", "if_missing", "verified_on_version", "requires_reverification"]);
  await checkTable("search_logs", ["query", "normalized_query", "result_count", "created_at"]);
  await checkTable("search_query_daily", ["day", "normalized_query", "searches", "zero_hits", "weak_results"]);
  await checkTable("source_checks", ["source_url", "source_type", "status", "checked_at"]);
  await checkTable("setting_feedback", ["setting_id", "vote", "client_token_hash"]);
  await checkTable("content_candidates", ["candidate_title", "intent", "status", "priority"]);

  const present = checks.filter((check) => check.status === "PRESENT").length;
  const missing = checks.filter((check) => check.status === "MISSING").length;
  const status = missing === 0 ? "APPLIED" : present > 0 ? "PARTIAL" : "NOT_APPLIED";
  console.log(JSON.stringify({ status, checkedAt: new Date().toISOString(), migrationFiles: migrationFileState, checks }, null, 2));
}

void main().catch((error) => {
  console.error(JSON.stringify({ status: "ERROR", message: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
});
