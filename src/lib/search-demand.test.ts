import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSearchDemand, normalizeDemandQuery } from "./search-demand";
import type { Setting } from "./types";

const wifiGuide: Setting = {
  id: "wifi",
  title: "Windows 11でWi-Fiが切れるときの対処",
  slug: "wifi-disconnect",
  os: "windows11",
  version: "25H2",
  category: "network",
  aliases: ["wifi不安定"],
  keywords: ["Wi-Fi", "切断"],
  path: ["設定", "ネットワークとインターネット", "Wi-Fi"],
  steps: ["設定を開く", "Wi-Fiの接続状態を確認する"],
  related_slugs: [],
  description: "Windows 11でWi-Fi接続が繰り返し切れる場合の確認手順です。",
  updated_at: "2026-08-20T00:00:00.000Z",
  status: "published",
};

test("表記違いのゼロヒット検索を同じ需要クラスタへまとめる", () => {
  assert.equal(normalizeDemandQuery("wifi すぐ切れる"), normalizeDemandQuery("Wi-Fi切断される"));
  const clusters = analyzeSearchDemand([
    { query: "wifi すぐ切れる", os: "windows11", result_count: 0, created_at: "2026-08-22T00:00:00.000Z" },
    { query: "Wi-Fi切断される", os: "windows11", result_count: 0, created_at: "2026-08-21T00:00:00.000Z" },
  ], [wifiGuide], Date.parse("2026-08-23T00:00:00.000Z"));
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].count, 2);
  assert.equal(clusters[0].disposition, "MISSING_ALIAS");
});
