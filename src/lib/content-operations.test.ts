import assert from "node:assert/strict";
import test from "node:test";
import { buildContentInventory, buildReverificationQueue, evaluateGuide } from "./content-operations";
import type { Setting } from "./types";

function guide(overrides: Partial<Setting> = {}): Setting {
  return {
    id: "guide-1",
    title: "Windows 11で通知をオフにする",
    slug: "disable-notifications",
    os: "windows11",
    version: "25H2",
    category: "notification",
    aliases: ["通知を切る", "通知を止める"],
    keywords: ["通知", "オフ"],
    path: ["設定", "システム", "通知"],
    steps: ["スタートメニューから設定アプリを開き、システムを選択します。", "通知を開き、不要な通知だけをオフにして、通知バナーと通知音の動作を確認します。"],
    related_slugs: ["notification-settings"],
    description: "Windows 11で不要な通知を止め、必要なアプリの通知だけを残す設定手順です。",
    source_url: "https://support.microsoft.com/ja-jp/windows/example-guide",
    verified_at: "2026-08-20T00:00:00.000Z",
    review_due_at: "2027-02-20T00:00:00.000Z",
    updated_at: "2026-08-20T00:00:00.000Z",
    status: "published",
    rollback: "同じ通知画面で元のスイッチをオンに戻します。",
    if_missing: "検索から通知を開き、管理PCの場合は組織のポリシーを確認します。",
    impact: "不要な通知バナーと通知音が表示されなくなります。",
    ...overrides,
  };
}

test("完全な公式情報付きガイドをVERIFIEDに分類する", () => {
  const result = evaluateGuide(guide(), { now: Date.parse("2026-08-23T00:00:00.000Z") });
  assert.equal(result.qualityStatus, "VERIFIED");
  assert.equal(result.completeness, 100);
  assert.equal(result.indexable, true);
  assert.equal(result.requiresIfMissing, false);
  assert.equal(result.factors.find((factor) => factor.key === "if-missing")?.applicability, "not_applicable");
});

test("未検証記事を公開可能と誤分類しない", () => {
  const result = evaluateGuide(guide({ source_url: null, verified_at: null }), { now: Date.parse("2026-08-23T00:00:00.000Z") });
  assert.ok(result.statuses.includes("NEEDS_VERIFICATION"));
  assert.equal(result.indexable, false);
});

test("明示noindexは公開を維持したままindex対象から外す", () => {
  const result = evaluateGuide(guide({ index_status: "noindex" }), { now: Date.parse("2026-08-23T00:00:00.000Z") });
  assert.equal(result.indexable, false);
  assert.ok(result.indexingIssues.includes("explicit-noindex"));
});

test("ブロックされた情報源は検証日があってもindex対象にしない", () => {
  const result = evaluateGuide(guide(), {
    now: Date.parse("2026-08-23T00:00:00.000Z"),
    sourceHealth: new Map([[guide().source_url!, {
      sourceUrl: guide().source_url!,
      status: "blocked",
    }]]),
  });
  assert.equal(result.indexable, false);
  assert.ok(result.noindexReasons.includes("source_blocked"));
});

test("移転先が公式の個別資料でない情報源はindex対象にしない", () => {
  const current = guide();
  const result = evaluateGuide(current, {
    now: Date.parse("2026-08-23T00:00:00.000Z"),
    sourceHealth: new Map([[current.source_url!, {
      sourceUrl: current.source_url!,
      status: "redirect",
      finalUrl: "https://example.com/",
    }]]),
  });
  assert.equal(result.indexable, false);
  assert.ok(result.noindexReasons.includes("source_broken"));
});

test("情報源切れは閲覧数に関係なく再検証の高優先キューへ入る", () => {
  const current = guide({ view_count: 0 });
  const queue = buildReverificationQueue([current], new Map([[current.source_url!, {
    sourceUrl: current.source_url!,
    status: "broken",
  }]]), Date.parse("2026-08-23T00:00:00.000Z"));
  assert.equal(queue[0].status, "HIGH_PRIORITY_REVIEW");
  assert.ok(queue[0].reasons.includes("情報源切れ"));
});

test("記事種別の明示指定を自動判定より優先する", () => {
  const result = evaluateGuide(guide({ content_type: "troubleshooting", title: "Wi-Fiをオンにする" }), { now: Date.parse("2026-08-23T00:00:00.000Z") });
  assert.equal(result.contentType, "TROUBLESHOOTING_GUIDE");
});

test("リンクグラフの孤立とリンク切れを集計する", () => {
  const first = guide();
  const second = guide({ id: "guide-2", slug: "notification-settings", title: "Windows 11の通知を設定する", related_slugs: ["missing-guide"] });
  const { inventory } = buildContentInventory([first, second], { now: Date.parse("2026-08-23T00:00:00.000Z") });
  // 公開ページの文脈リンクが相互に張られるため、描画後の孤立は0件。
  // 明示related_slugsの欠落は別メトリクスで残す。
  assert.equal(inventory.orphanGuides, 0);
  assert.equal(inventory.explicitOrphanGuides, 1);
  assert.equal(inventory.guidesWithoutExplicitRelated, 0);
  assert.equal(inventory.dynamicRelatedEdges, 2);
  assert.equal(inventory.invalidRelatedLinks, 1);
});
