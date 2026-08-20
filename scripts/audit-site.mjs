#!/usr/bin/env node

// 公開サイトのサイトマップに載るURLを実際に取得し、404・5xxを検出する簡易チェック。
// 使い方: npm run audit:site -- https://settingdoko.vercel.app
const base = (process.argv[2] || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const sitemapUrl = `${base}/sitemap.xml`;
const concurrency = 12;

const sitemapResponse = await fetch(sitemapUrl, { signal: AbortSignal.timeout(30_000) });
if (!sitemapResponse.ok) {
  console.error(`サイトマップ取得失敗: ${sitemapResponse.status} ${sitemapUrl}`);
  process.exit(1);
}
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
if (!urls.length) {
  console.error("サイトマップにURLがありません");
  process.exit(1);
}

const failures = [];
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    const url = urls[index];
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { "User-Agent": "settingdoko-site-audit/1.0" },
      });
      await response.body?.cancel();
      if (response.status >= 400) failures.push({ url, status: response.status });
    } catch (error) {
      failures.push({ url, status: error instanceof Error ? error.message : "request failed" });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
console.log(`サイトマップURL: ${urls.length}件 / エラー: ${failures.length}件`);
for (const failure of failures.slice(0, 100)) console.error(`${failure.status} ${failure.url}`);
if (failures.length > 100) console.error(`…ほか${failures.length - 100}件`);
process.exitCode = failures.length ? 1 : 0;
