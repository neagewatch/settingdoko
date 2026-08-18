import test from "node:test";
import assert from "node:assert/strict";
import { canonicalSlug, detectDuplicateGroups } from "./duplicate-detection";
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
});
