import test from "node:test";
import assert from "node:assert/strict";
import { consolidateCandidates, getConsolidationReport } from "./consolidate-candidates.mjs";

test("同じslug×OSは豊富な候補を正規記事にし、別タイトルをaliasへ残す", () => {
  const base = {
    slug: "wifi-toggle",
    os: "android",
    version: "Android 16",
    category: "network",
    path: ["設定", "ネットワーク"],
    steps: ["Wi-Fiを開く", "オンにする"],
    related_slugs: [],
    keywords: ["wifi"],
  };
  const result = consolidateCandidates([
    { ...base, title: "Wi-Fiをオン", description: "短い説明", aliases: [] },
    { ...base, title: "Wi-Fiを有効にする", description: "公式資料を確認した、より具体的で十分な長さの説明です。", aliases: ["wifi 有効"], source_url: "https://support.google.com/android/answer/1", verified_at: "2026-08-01" },
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Wi-Fiを有効にする");
  assert.ok(result[0].aliases.includes("Wi-Fiをオン"));
  assert.equal(getConsolidationReport([
    { ...base, title: "Wi-Fiをオン", description: "短い説明", aliases: [] },
    { ...base, title: "Wi-Fiを有効にする", description: "長い説明", aliases: [] },
  ]).exactIdentifierRows, 1);
});

