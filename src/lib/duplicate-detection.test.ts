import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalSlug,
  detectDuplicateGroups,
  isLegacyTroubleshootingSlug,
  isStrongDuplicateGroup,
  isUnwantedConditionTitle,
  selectIntentAliasConsolidation,
} from "./duplicate-detection";
import type { Setting } from "./types";

function setting(slug: string): Setting {
  return {
    id: slug,
    title: "Windows 11にサインインできないときの対処",
    slug,
    os: "windows11",
    version: "25H2",
    category: "troubleshoot",
    aliases: ["Windowsにログインできない"],
    path: ["サインイン画面", "パスワード"],
    steps: ["パスワードを確認する", "PCを再起動する"],
    related_slugs: [],
    keywords: ["サインイン", "ログイン"],
    description: "Windows 11にサインインできないときの確認手順です。",
    updated_at: "2026-08-18T00:00:00.000Z",
    status: "draft",
  };
}

test("基本slugと派生slugを重複候補としてまとめる", () => {
  assert.equal(canonicalSlug("trouble6-win11-signin-failed"), "trouble6-win11-signin");
  assert.equal(canonicalSlug("trouble8-win11-signin-failed-new-device"), "trouble6-win11-signin");
  assert.equal(canonicalSlug("trouble9-win11-signin-after"), "trouble6-win11-signin");
  const groups = detectDuplicateGroups([
    setting("trouble6-win11-signin"),
    setting("trouble8-win11-signin-failed-new-device"),
  ]);
  assert.equal(groups.length, 1);
  assert.ok(groups[0].reasons.includes("derived-slug"));
  assert.equal(isStrongDuplicateGroup(groups[0]), true);
});

test("発生条件だけの派生タイトルは自動整理対象にする", () => {
  const left = setting("wifi-settings");
  const right = {
    ...setting("wifi-troubleshoot"),
    title: "Windows 11にサインインできないときの対処（PIN）",
    description: "別の確認内容です。",
    path: ["設定", "アカウント"],
    steps: ["別の手順を確認する"],
  };
  const groups = detectDuplicateGroups([left, right]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].reasons.includes("variant-title"), true);
  assert.equal(isStrongDuplicateGroup(groups[0]), true);
});

test("タイトルが似ているだけの候補は自動整理しない", () => {
  const left = setting("signin-settings");
  const right = {
    ...setting("signin-howto"),
    title: "Windows 11にサインインできないときの対処方法",
    description: "別の確認内容です。",
    path: ["設定", "アカウント"],
    steps: ["別の手順を確認する"],
  };
  const groups = detectDuplicateGroups([left, right]);
  assert.equal(groups.length, 1);
  assert.equal(isStrongDuplicateGroup(groups[0]), false);
});

test("同じslugでもOSが違う記事は別記事として扱う", () => {
  const windows = setting("network-settings");
  const iphone = { ...setting("network-settings"), id: "iphone-network-settings", os: "ios" as const };
  assert.equal(detectDuplicateGroups([windows, iphone]).length, 0);
});

test("旧トラブルパックだけを削除対象として判定する", () => {
  assert.equal(isLegacyTroubleshootingSlug("trouble7-win11-wifi"), true);
  assert.equal(isLegacyTroubleshootingSlug("trouble8-iphone-bluetooth"), true);
  assert.equal(isLegacyTroubleshootingSlug("trouble9-android-wifi"), false);
  assert.equal(isLegacyTroubleshootingSlug("trouble-win11-wifi"), false);
});

test("指定された条件付きタイトルだけを削除対象として判定する", () => {
  assert.equal(isUnwantedConditionTitle("Wi-Fiにつながらないときの対処（OS更新後）"), true);
  assert.equal(isUnwantedConditionTitle("アカウントに入れないときの対処（新しい端末から）"), true);
  assert.equal(isUnwantedConditionTitle("Bluetooth機器を追加できないときの対処（新しい端末を追加した場合）"), true);
  assert.equal(isUnwantedConditionTitle("イヤホンが接続済みなのに音が出ない場合"), false);
  assert.equal(isUnwantedConditionTitle("Windows 11で通知をオフにする（Windows版）"), false);
});

test("オン・有効などの表現違いを検索意図候補として検出する", () => {
  const left = { ...setting("wifi-on"), title: "Windows 11でWi-Fiをオンにする", category: "network", aliases: ["Wi-Fiをオン"] } as Setting;
  const right = { ...setting("wifi-enable"), title: "Windows 11でWi-Fiを有効にする", category: "network", aliases: ["Wi-Fiを有効"], path: ["クイック設定", "Wi-Fi"], steps: ["クイック設定を開く", "Wi-Fiボタンを有効にする"], source_url: "https://support.microsoft.com/wifi-enable" } as Setting;
  const groups = detectDuplicateGroups([left, right]);
  assert.equal(groups.length, 1);
  assert.ok(groups[0].reasons.includes("same-intent"));
  assert.equal(isStrongDuplicateGroup(groups[0]), false);
});

test("同一版・同一意図は正規記事1件と別名統合候補へ分ける", () => {
  const left = { ...setting("wifi-on"), title: "Windows 11でWi-Fiをオンにする", category: "network" } as Setting;
  const right = { ...setting("wifi-enable"), title: "Windows 11でWi-Fiを有効にする", category: "network", source_url: "https://support.microsoft.com/wifi", path: left.path } as Setting;
  left.source_url = "https://support.microsoft.com/wifi";
  const result = selectIntentAliasConsolidation([left, right]);
  assert.equal(result.aliasGroups.length, 1);
  assert.equal(result.aliasDuplicateIds.size, 1);
  assert.ok(result.canonicalByDuplicateId.has("wifi-enable") || result.canonicalByDuplicateId.has("wifi-on"));
});

test("異なるエラーコードをタイトル類似だけで重複扱いしない", () => {
  const left = { ...setting("error-1"), title: "Windows 11でエラーコード0x80070001が出るときの対処", steps: ["コード1固有の原因を確認する", "公式手順1を実行する"] } as Setting;
  const right = { ...setting("error-2"), title: "Windows 11でエラーコード0x80070002が出るときの対処", steps: ["コード2固有の原因を確認する", "公式手順2を実行する"] } as Setting;
  const groups = detectDuplicateGroups([left, right]);
  assert.equal(groups.some((group) => group.reasons.includes("similar-title")), false);
});
