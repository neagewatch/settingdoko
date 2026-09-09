import assert from "node:assert/strict";
import test from "node:test";
import { getArticleCopy } from "./article-copy";
import { reviewArticle } from "./editorial-review";
import type { Setting } from "./types";
import { loadLocalCandidateSettings } from "../../scripts/candidate-dataset";

function guide(overrides: Partial<Setting> = {}): Setting {
  return {
    id: "article-copy-test",
    title: "Windows 11で通知が届かないときの確認",
    slug: "notification-not-arriving",
    os: "windows11",
    version: "25H2",
    category: "troubleshoot",
    aliases: ["通知が来ない"],
    keywords: ["通知", "届かない"],
    path: ["設定", "システム", "通知"],
    steps: ["設定を開きます。", "通知の設定を確認します。"],
    related_slugs: [],
    description: "Windows 11で通知が届かないときの確認手順です。",
    updated_at: "2026-08-20T00:00:00.000Z",
    ...overrides,
  };
}

test("トラブル解決記事には症状の切り分けと未改善時の進め方が入る", () => {
  const copy = getArticleCopy(guide());
  assert.equal(copy.kindLabel, "トラブル解決");
  assert.match(copy.description, /通知権限/);
  assert.match(copy.firstAction, /通知/);
  assert.match(copy.lastAction, /通知/);
  assert.match(copy.lead, /一つずつ/);
  assert.match(copy.outcome, /次の切り分け/);
  assert.match(copy.missing, /通知/);
});

test("既存の影響と項目がない場合の説明は置き換えない", () => {
  const copy = getArticleCopy(guide({
    content_type: "setting",
    impact: "通知バナーが表示されるようになります。",
    if_missing: "検索から通知を開いてください。",
  }));
  assert.equal(copy.outcome, "通知バナーが表示されるようになります。");
  assert.equal(copy.missing, "検索から通知を開いてください。");
});

test("エラーコード記事は記録してから確認する流れになる", () => {
  const copy = getArticleCopy(guide({
    title: "エラーコード 0x80070005 の対処",
    content_type: "error_code",
  }));
  assert.equal(copy.kindLabel, "エラーコード");
  assert.match(copy.process, /エラーコード/);
  assert.match(copy.missing, /公式サポート/);
});

test("ローカル候補の全記事に記事別の要約と開始・完了ポイントを付けられる", () => {
  const settings = loadLocalCandidateSettings();
  assert.ok(settings.length >= 1000);
  assert.ok(settings.every((setting) => {
    const copy = getArticleCopy(setting);
    return copy.description.length > 0 && copy.firstAction.length > 0 && copy.lastAction.length > 0;
  }));
});

test("全候補記事の編集パスは定型文を残さず、元の検証情報を変更しない", () => {
  const settings = loadLocalCandidateSettings();
  const genericPattern = /確認手順です|設定方法です|該当する発生場面|設定・接続・権限・更新の順|公式情報ベース|下書き候補/;
  for (const setting of settings) {
    const reviewed = reviewArticle(setting);
    assert.ok(reviewed.setting.description.length > 0, setting.slug);
    assert.ok(reviewed.setting.steps.length >= 2, setting.slug);
    assert.equal(genericPattern.test(reviewed.setting.description), false, setting.slug);
    assert.equal(genericPattern.test(reviewed.setting.steps.map((step) => typeof step === "string" ? step : step.text).join(" ")), false, setting.slug);
    assert.ok(reviewed.setting.if_missing, setting.slug);
    assert.equal(reviewed.setting.source_url, setting.source_url, setting.slug);
    assert.equal(reviewed.setting.verified_at, setting.verified_at, setting.slug);
    assert.equal(reviewed.setting.status, setting.status, setting.slug);
  }
});

test("Android通知が表示されない記事は、通知が見える場合だけ長押しする条件を示す", () => {
  const setting = loadLocalCandidateSettings().find((item) => item.slug === "trouble-android-notifications");
  assert.ok(setting);
  const reviewed = reviewArticle(setting).setting;
  assert.equal(reviewed.path.includes("おやすみ時間"), false);
  const steps = reviewed.steps.map((step) => typeof step === "string" ? step : step.text).join(" ");
  assert.match(steps, /1件でも表示される場合/);
  assert.match(steps, /一切表示されない場合はこの手順を飛ばす/);
});
