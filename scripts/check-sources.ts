import fs from "node:fs";
import { assessSource } from "../src/lib/source-quality";
import type { SourceHealth } from "../src/lib/content-operations";

type Options = { input: string; out?: string; sql?: string; limit: number; concurrency: number; timeout: number };

function args(argv: string[]): Options {
  const result: Options = { input: "", limit: Number.POSITIVE_INFINITY, concurrency: 3, timeout: 12_000 };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") result.input = argv[++index];
    else if (value === "--out") result.out = argv[++index];
    else if (value === "--sql") result.sql = argv[++index];
    else if (value === "--limit") result.limit = Math.max(1, Number(argv[++index]));
    else if (value === "--concurrency") result.concurrency = Math.max(1, Math.min(6, Number(argv[++index])));
    else if (value === "--timeout") result.timeout = Math.max(2_000, Math.min(30_000, Number(argv[++index])));
    else throw new Error(`不明な引数です: ${value}`);
  }
  if (!result.input) throw new Error("--input <settings.json> が必要です");
  return result;
}

function sourceUrls(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("入力JSONは記事配列である必要があります");
  return [...new Set(value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("source_url" in item)) return [];
    const url = (item as { source_url?: unknown }).source_url;
    return typeof url === "string" && url ? [url] : [];
  }))];
}

async function request(url: string, method: "HEAD" | "GET", timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "SettingDokoSourceAudit/1.0 (+https://settingdoko.vercel.app/editorial-policy)",
        ...(method === "GET" ? { Range: "bytes=0-0" } : {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkSource(sourceUrl: string, timeout: number): Promise<SourceHealth> {
  const initial = assessSource(sourceUrl);
  if (!initial.allowedForAutomatedCheck) return { sourceUrl, status: "invalid", checkedAt: new Date().toISOString() };

  let current = sourceUrl;
  let redirected = false;
  try {
    for (let hop = 0; hop < 4; hop += 1) {
      let response = await request(current, "HEAD", timeout);
      // Some support sites do not implement HEAD consistently and return 404/405
      // for a page that succeeds with GET. Never mark a source broken from HEAD
      // alone; retry with a one-byte GET before classifying it.
      if (response.status >= 400) response = await request(current, "GET", timeout);
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) return { sourceUrl, status: "broken", httpStatus: response.status, finalUrl: current, checkedAt: new Date().toISOString() };
        const next = new URL(location, current).toString();
        if (!assessSource(next).allowedForAutomatedCheck) return { sourceUrl, status: "broken", httpStatus: response.status, finalUrl: next, checkedAt: new Date().toISOString() };
        current = next;
        redirected = true;
        continue;
      }

      const finalAssessment = assessSource(current);
      if (response.status >= 200 && response.status < 300) {
        return {
          sourceUrl,
          status: finalAssessment.generic ? "broken" : redirected ? "redirect" : "ok",
          httpStatus: response.status,
          finalUrl: current,
          checkedAt: new Date().toISOString(),
        };
      }
      if ([401, 403, 429].includes(response.status)) {
        return { sourceUrl, status: "blocked", httpStatus: response.status, finalUrl: current, checkedAt: new Date().toISOString() };
      }
      return { sourceUrl, status: response.status === 404 || response.status === 410 ? "broken" : "blocked", httpStatus: response.status, finalUrl: current, checkedAt: new Date().toISOString() };
    }
    return { sourceUrl, status: "broken", finalUrl: current, checkedAt: new Date().toISOString() };
  } catch {
    return { sourceUrl, status: "blocked", finalUrl: current, checkedAt: new Date().toISOString() };
  }
}

function sqlLiteral(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${value.replaceAll("'", "''")}'`;
}

function sourceChecksSql(results: SourceHealth[]): string {
  if (!results.length) return "";
  const values = results.map((result) => {
    const sourceType = assessSource(result.sourceUrl).type;
    return `(${sqlLiteral(result.sourceUrl)},${sqlLiteral(sourceType)},${sqlLiteral(result.status)},${sqlLiteral(result.httpStatus)},${sqlLiteral(result.finalUrl)},${sqlLiteral(result.checkedAt)})`;
  });
  return [
    "-- dry-runで確認した結果だけをsource_checksへ保存する。settingsは変更しない。",
    "BEGIN;",
    "INSERT INTO source_checks(source_url,source_type,status,http_status,final_url,checked_at) VALUES",
    values.join(",\n"),
    "ON CONFLICT (source_url) DO UPDATE SET source_type=EXCLUDED.source_type,status=EXCLUDED.status,http_status=EXCLUDED.http_status,final_url=EXCLUDED.final_url,checked_at=EXCLUDED.checked_at;",
    "COMMIT;",
    "",
  ].join("\n");
}

async function main() {
  const options = args(process.argv.slice(2));
  const urls = sourceUrls(JSON.parse(fs.readFileSync(options.input, "utf8"))).slice(0, options.limit);
  const results: SourceHealth[] = new Array(urls.length);
  let cursor = 0;
  let completed = 0;

  async function worker() {
    while (cursor < urls.length) {
      const index = cursor++;
      results[index] = await checkSource(urls[index], options.timeout);
      completed += 1;
      if (completed % 25 === 0 || completed === urls.length) console.log(`情報源確認: ${completed}/${urls.length}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(options.concurrency, urls.length) }, () => worker()));
  if (options.out) fs.writeFileSync(options.out, JSON.stringify(results, null, 2) + "\n");
  if (options.sql) fs.writeFileSync(options.sql, sourceChecksSql(results));
  const counts: Record<string, number> = {};
  for (const result of results) counts[result.status] = (counts[result.status] || 0) + 1;
  console.log(JSON.stringify({ uniqueSources: urls.length, counts }, null, 2));
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
