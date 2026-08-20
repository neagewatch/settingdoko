import assert from "node:assert/strict";
import test from "node:test";
import { allSampleSettings } from "./sample-data-export";
import { searchSettings } from "./search";
import { Setting } from "./types";

const settings: Setting[] = allSampleSettings.map((setting, index) => ({
  ...setting,
  id: `test-${index}`,
  updated_at: "2026-08-13T00:00:00.000Z",
}));

test("口語の拡張子検索はWindows 11の答えを先頭に返す", () => {
  const result = searchSettings(settings, "拡張子見たい");
  assert.equal(result[0]?.slug, "show-file-extensions");
  assert.equal(result[0]?.os, "windows11");
});

test("Wi-Fiの接続トラブルは専用の対処ページを先頭に返す", () => {
  const result = searchSettings(settings, "WiFi切れる");
  assert.equal(result[0]?.slug, "wifi-troubleshoot-windows11");
  assert.equal(searchSettings(settings, "WiFi切れる", "ios")[0]?.slug, "wifi-troubleshoot-ios");
  assert.equal(searchSettings(settings, "WiFi切れる", "android")[0]?.slug, "wifi-troubleshoot-android");
});

test("OS名と口語を組み合わせたAndroid検索に対応する", () => {
  const result = searchSettings(settings, "Android 通知うるさい");
  assert.equal(result[0]?.slug, "disable-notifications-android");
});

test("よくあるBluetoothのタイポを補正する", () => {
  const result = searchSettings(settings, "bluetooh");
  assert.equal(result[0]?.category, "bluetooth");
});

test("端末名を含む口語の明るさ検索を拾う", () => {
  const result = searchSettings(settings, "パソコン暗い");
  assert.equal(result[0]?.slug, "change-brightness");
});

test("Wordの余白検索はアプリ名と目的語を同時に使う", () => {
  const result = searchSettings([...settings, {
    ...settings[0], id: "word-margin", slug: "word-change-margins", os: "word",
    title: "Wordの余白を変更する", aliases: ["Word余白"], keywords: ["Word", "余白"],
    path: ["Word", "レイアウト", "余白"], description: "Word文書の上下左右の余白を変更する方法です。",
  }], "word 余白");
  assert.equal(result[0]?.slug, "word-change-margins");
});
