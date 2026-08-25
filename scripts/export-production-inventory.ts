import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

type Options = { out: string; healthOut: string; includeDrafts: boolean };

const FULL_COLUMNS = [
  "id", "title", "slug", "os", "version", "category", "aliases", "path", "steps", "related_slugs", "keywords", "description",
  "updated_at", "view_count", "helpful_count", "not_helpful_count", "difficulty", "estimate_minutes", "screenshot_url", "status",
  "published_at", "verified_at", "source_url", "device_scope", "impact", "rollback", "caution", "if_missing", "review_due_at",
  "index_status", "content_type", "source_type", "verified_on_version", "verified_from", "verified_to", "requires_reverification",
  "workflow_status", "editor_note",
];
const LEGACY_COLUMNS = [
  "id", "title", "slug", "os", "version", "category", "aliases", "path", "steps", "related_slugs", "keywords", "description",
  "updated_at", "view_count", "helpful_count", "difficulty", "estimate_minutes", "screenshot_url", "status", "published_at",
  "verified_at", "source_url", "device_scope", "impact", "rollback", "caution", "review_due_at",
];

function parseArgs(argv: string[]): Options {
  const options: Options = {
    out: "/tmp/settingdoko-production-settings.json",
    healthOut: "/tmp/settingdoko-production-source-health.json",
    includeDrafts: true,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--out") options.out = argv[++index];
    else if (value === "--health-out") options.healthOut = argv[++index];
    else if (value === "--published-only") options.includeDrafts = false;
    else throw new Error(`不明な引数です: ${value}`);
  }
  return options;
}

function missingColumn(error: { code?: string; message?: string } | null): boolean {
  return Boolean(error && (error.code === "42703" || error.code === "PGRST204" || error.code === "PGRST205" || /column|schema cache/i.test(error.message || "")));
}

const options = parseArgs(process.argv.slice(2));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください（キーは出力・共有しないでください）。");
  process.exit(2);
}

const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function fetchSettings(columns: string[]): Promise<unknown[]> {
  const rows: unknown[] = [];
  const pageSize = 500;
  for (let page = 0; page < 200; page += 1) {
    let query = client.from("settings").select(columns.join(",")).order("id", { ascending: true }).range(page * pageSize, (page + 1) * pageSize - 1);
    if (!options.includeDrafts) query = query.eq("status", "published");
    const result = await query;
    if (result.error) throw result.error;
    rows.push(...(result.data || []));
    if ((result.data || []).length < pageSize) return rows;
  }
  throw new Error("settingsが200ページを超えました。ページサイズ設定を確認してください。");
}

async function main() {
  let settings: unknown[];
  try {
    settings = await fetchSettings(FULL_COLUMNS);
  } catch (error) {
    if (!missingColumn(error as { code?: string; message?: string })) throw error;
    settings = await fetchSettings(LEGACY_COLUMNS);
  }

  const health = await client.from("source_checks").select("source_url,status,http_status,final_url,checked_at");
  const healthRows = health.error ? [] : (health.data || []).map((row) => ({
    sourceUrl: row.source_url,
    status: row.status,
    ...(typeof row.http_status === "number" ? { httpStatus: row.http_status } : {}),
    ...(typeof row.final_url === "string" ? { finalUrl: row.final_url } : {}),
    ...(typeof row.checked_at === "string" ? { checkedAt: row.checked_at } : {}),
  }));

  fs.writeFileSync(options.out, JSON.stringify(settings, null, 2) + "\n");
  fs.writeFileSync(options.healthOut, JSON.stringify(healthRows, null, 2) + "\n");
  console.log(JSON.stringify({
    settings: settings.length,
    sourceChecks: healthRows.length,
    sourceChecksReadable: !health.error,
    settingsOutput: options.out,
    sourceHealthOutput: options.healthOut,
  }, null, 2));
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
