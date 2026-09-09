import assert from "node:assert/strict";
import test from "node:test";
import { allSampleSettings } from "./sample-data-export";
import { searchSettings } from "./search";
import { Setting } from "./types";
import { loadLocalCandidateSettings } from "../../scripts/candidate-dataset";

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

test("定型トラブル記事より具体的な設定記事を優先する", () => {
  const direct = {
    ...settings[0], id: "direct-brightness", slug: "direct-brightness", title: "画面の明るさを変更する",
    description: "画面の明るさを変更する方法です。",
    aliases: ["画面暗く", "明るさ"], keywords: ["明るさ", "ディスプレイ"],
    path: ["設定", "システム", "ディスプレイ", "明るさ"], verified_at: "2026-08-19T00:00:00.000Z",
  } satisfies Setting;
  const boilerplate = {
    ...direct, id: "template-brightness", slug: "template-brightness",
    title: "Windows 11で画面の明るさを変更できないときの対処",
    description: "該当する発生場面でWindowsの明るさが変えられないが起きたときの確認手順です。 発生場面：更新時、インストール時、サインイン時。",
  } satisfies Setting;
  assert.equal(searchSettings([boilerplate, direct], "パソコン暗い")[0]?.slug, "direct-brightness");
});

test("口語の文字サイズ検索とパスワード変更検索を展開する", () => {
  const textSize = {
    ...settings[0], id: "text-size", slug: "change-text-size", title: "Windows 11で文字を大きくする",
    aliases: ["文字でかくしたい"], keywords: ["文字サイズ", "表示サイズ"],
    path: ["設定", "アクセシビリティ", "テキストのサイズ"],
  } satisfies Setting;
  const password = {
    ...settings[0], id: "password", slug: "change-password", title: "パスワードを変更する",
    aliases: ["パスワード変える"], keywords: ["パスワード", "アカウント"],
    path: ["設定", "アカウント", "サインイン オプション"],
  } satisfies Setting;
  assert.equal(searchSettings([textSize], "文字でかくしたい")[0]?.slug, "change-text-size");
  assert.equal(searchSettings([password], "パスワード変える")[0]?.slug, "change-password");
});

test("一致しない検索語は0件で返し、検証済み記事を代わりに表示しない", () => {
  assert.deepEqual(searchSettings(settings, "zzzxqv987654"), []);
  assert.deepEqual(searchSettings(settings, "あいうえお存在しない設定"), []);
});

test("通知を止めたい検索に、通知が届かない記事を混ぜない", () => {
  const results = searchSettings(settings, "通知うるさい");
  assert.equal(results[0]?.slug, "disable-notifications-ios");
  assert.ok(results.some((setting) => setting.slug === "disable-notifications"));
  assert.equal(results.some((setting) => /届かない|来ない|表示されない/.test(setting.title)), false);
});

test("通知が届かない検索は、通知をオフにする記事へ逆案内しない", () => {
  const results = searchSettings(loadLocalCandidateSettings(), "通知が届かない");
  assert.ok(results.length > 0);
  assert.equal(results.some((setting) => /disable-notifications/.test(setting.slug)), false);
  assert.ok(results.some((setting) => /通知/.test(setting.title) && /届|来|表示/.test(setting.title)));
});

test("通知音だけの検索は、通知音・サウンドの案内を優先する", () => {
  const results = searchSettings(loadLocalCandidateSettings(), "通知音だけ消したい");
  assert.ok(results.length > 0);
  assert.match(results[0]?.title || "", /通知音|サウンド|着信音/);
  assert.ok(results.some((setting) => /通知音|サウンド/.test(setting.title)));
  assert.equal(results.some((setting) => setting.slug === "change-ringtone-android"), false);
});

test("告知前の主要な困りごとは、目的に対応する候補を返す", () => {
  const candidateSettings = loadLocalCandidateSettings();
  const cases: Array<{ query: string; title: RegExp }> = [
    { query: "通知が届かない", title: /通知.*(届か|来な|表示)/ },
    { query: "通知音だけ消したい", title: /(通知音|サウンド|着信音)/ },
    { query: "文字を大きくしたい", title: /(文字|フォント|テキスト).*(サイズ|大き)/ },
    { query: "画面を暗くしたい", title: /明るさ/ },
    { query: "Wi-Fiがつながらない", title: /Wi-?Fi/i },
    { query: "Bluetoothにつながらない", title: /Bluetooth/i },
    { query: "マイクが使えない", title: /マイク/ },
    { query: "拡張子を表示したい", title: /拡張子/ },
  ];

  for (const item of cases) {
    const results = searchSettings(candidateSettings, item.query);
    assert.ok(results.length > 0, `${item.query} が0件`);
    assert.ok(results.slice(0, 5).some((setting) => item.title.test(setting.title)), `${item.query} の上位候補が目的と不一致`);
  }

  const iosResults = searchSettings(candidateSettings, "通知が届かない", "ios");
  assert.ok(iosResults.length > 0);
  assert.ok(iosResults.every((setting) => setting.os === "ios"));
  assert.equal(iosResults.some((setting) => /disable-notifications/.test(setting.slug)), false);
});

test("同一目的の統合候補は検索結果に正規URLだけを出す", () => {
  const candidateSettings = loadLocalCandidateSettings();
  const textResults = searchSettings(candidateSettings, "文字サイズ iPhone");
  assert.ok(textResults.some((setting) => setting.slug === "iphone-text-size"));
  assert.equal(textResults.some((setting) => setting.slug === "change-text-size-ios"), false);

  const notificationResults = searchSettings(candidateSettings, "通知履歴");
  assert.ok(notificationResults.some((setting) => setting.slug === "android-notification-history"));
  assert.equal(notificationResults.some((setting) => setting.slug === "android-wave4-notification-history"), false);
});

test("内蔵サンプルでも通知の症状別・音だけの分岐を解決できる", () => {
  const iosMissing = searchSettings(settings, "通知が届かない", "ios");
  const androidMissing = searchSettings(settings, "通知が届かない", "android");
  const sound = searchSettings(settings, "通知音だけ消したい");

  assert.ok(iosMissing.some((setting) => setting.slug === "trouble-iphone-notifications"));
  assert.ok(androidMissing.some((setting) => setting.slug === "trouble-android-notifications"));
  assert.ok(sound.some((setting) => setting.slug === "iphone-notification-sounds"));
  assert.ok(sound.some((setting) => setting.slug === "android-guide-notification-channels"));
  assert.ok(sound.some((setting) => setting.slug === "teams-notification-sounds"));
});

test("接続トラブルの端末絞り込みは、選択したOSを維持して具体的な対処を返す", () => {
  const cases: Array<[string, string, string]> = [
    ["Wi-Fiがつながらない", "macos", "trouble-mac-wifi"],
    ["Bluetoothにつながらない", "ios", "trouble-iphone-bluetooth"],
    ["Bluetoothにつながらない", "android", "trouble-android-bluetooth"],
  ];

  for (const [query, os, slug] of cases) {
    const results = searchSettings(settings, query, os as Setting["os"]);
    assert.equal(results[0]?.slug, slug);
    assert.ok(results.every((setting) => setting.os === os));
  }
});
