import assert from "node:assert/strict";
import { test } from "node:test";
import { auditSettingsQuality } from "./quality-audit";
import type { Setting } from "./types";

const NOW = Date.parse("2026-08-18T00:00:00.000Z");

function makeSetting(overrides: Partial<Setting> = {}): Setting {
  return {
    id: "quality-test",
    title: "Windows 11で通知を設定する",
    slug: "quality-test",
    os: "windows11",
    version: "25H2",
    category: "notification",
    aliases: ["通知"],
    path: ["設定", "システム", "通知"],
    steps: ["Windowsの設定アプリを開きます。", "通知を選び、アプリごとの表示方法や通知音を変更します。"],
    related_slugs: [],
    keywords: ["通知設定"],
    description: "Windows 11で通知をアプリごとに変更し、不要な通知を減らす方法を説明します。",
    updated_at: "2026-08-01T00:00:00.000Z",
    status: "published",
    verified_at: "2026-08-01T00:00:00.000Z",
    review_due_at: "2027-01-01T00:00:00.000Z",
    source_url: "https://support.microsoft.com/example",
    impact: "通知の表示を必要なものだけに整理できます。",
    rollback: "同じ画面で元の通知設定に戻せます。",
    ...overrides,
  };
}

test("十分な記事は低品質候補にならない", () => {
  const result = auditSettingsQuality([makeSetting()], NOW);
  assert.equal(result.items.length, 0);
  assert.deepEqual(result.counts, { high: 0, medium: 0, low: 0 });
});

test("必須情報がない記事は要修正として抽出する", () => {
  const result = auditSettingsQuality([makeSetting({
    title: "",
    description: "",
    path: [],
    steps: [],
    source_url: null,
    verified_at: null,
    version: "",
    aliases: [],
    keywords: [],
    impact: null,
    rollback: null,
  })], NOW);
  assert.equal(result.items[0]?.priority, "high");
  assert.ok(result.items[0]?.issueCodes.includes("missing-steps"));
  assert.ok(result.items[0]?.issueCodes.includes("missing-path"));
});

test("見直し期限を過ぎた記事を抽出する", () => {
  const result = auditSettingsQuality([makeSetting({ review_due_at: "2026-08-01T00:00:00.000Z" })], NOW);
  assert.equal(result.items.length, 1);
  assert.ok(result.items[0]?.issueCodes.includes("review-overdue"));
});
