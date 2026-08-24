import assert from "node:assert/strict";
import test from "node:test";
import { publicationBlocks } from "./publication-policy";
import type { Setting } from "./types";

function setting(overrides: Partial<Setting> = {}): Setting {
  return {
    id: "test-publication",
    title: "Wi-Fiをオンにする",
    slug: "wifi-on",
    os: "windows11",
    version: "Windows 11 24H2",
    category: "network",
    aliases: ["wifi", "Wi-Fiを有効にする"],
    path: ["設定", "ネットワークとインターネット", "Wi-Fi"],
    steps: ["タスクバーのネットワークアイコンを選択します。", "Wi-Fiをオンにします。"],
    related_slugs: ["wifi-off"],
    keywords: ["Wi-Fi", "無線LAN"],
    description: "Windows 11でWi-Fiをオンにする手順を説明します。",
    updated_at: "2026-08-23T00:00:00.000Z",
    status: "published",
    verified_at: "2026-08-20T00:00:00.000Z",
    source_url: "https://support.microsoft.com/windows/wifi-on",
    impact: "Wi-Fi接続を有効にします。",
    rollback: "同じ場所でWi-Fiをオフにします。",
    if_missing: "Wi-Fiが表示されない場合は機内モードを確認します。",
    caution: "",
    ...overrides,
  };
}

test("公開時に対応バージョンを必須にする", () => {
  const blocks = publicationBlocks(setting({ version: "" }));
  assert.ok(blocks.some((block) => block.code === "missing-version"));
});

test("公開時に変更の戻し方と項目がない場合の案内を必須にする", () => {
  const blocks = publicationBlocks(setting({
    title: "Wi-Fiをオフにする",
    slug: "wifi-off",
    steps: ["設定を開きます。", "Wi-Fiをオフにします。"],
    rollback: "",
    if_missing: "",
  }));
  assert.ok(blocks.some((block) => block.code === "missing-rollback"));
  assert.ok(blocks.some((block) => block.code === "missing-if-missing"));
});

test("下書きは公開ゲートの対象外", () => {
  assert.deepEqual(publicationBlocks(setting({ status: "draft", version: "", source_url: null })), []);
});
