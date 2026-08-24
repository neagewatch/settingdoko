import assert from "node:assert/strict";
import test from "node:test";
import { loadLocalCandidateSettings } from "../../scripts/candidate-dataset";
import { searchSettings } from "./search";

const settings = loadLocalCandidateSettings();

const cases: Array<{ query: string; expected: RegExp; top: number }> = [
  { query: "文字でかくしたい", expected: /(文字|テキスト).*(サイズ|大き)/, top: 3 },
  { query: "パスワード変える", expected: /(パスワード|パスコード).*(変更|変)/, top: 3 },
  { query: "wifiつながらない", expected: /Wi-?Fi.*(つながらない|接続できない|切れる)/i, top: 3 },
  { query: "wifi 切れる", expected: /Wi-?Fi.*(切れる|不安定|つながらない)/i, top: 3 },
  { query: "bluetooth 見つからない", expected: /Bluetooth.*(見つからない|検出|接続できない)/i, top: 3 },
  { query: "音出ない", expected: /(音が出ない|スピーカー.*音)/, top: 3 },
  { query: "マイク使えない", expected: /マイク.*(使えない|許可|アクセス)/, top: 3 },
  { query: "通知うるさい", expected: /通知.*(オフ|止|おやすみ|集中)/, top: 3 },
  { query: "拡張子出したい", expected: /拡張子.*表示|拡張子を表示/, top: 3 },
  { query: "画面暗い", expected: /明るさを変更/, top: 3 },
  { query: "容量ない", expected: /(ストレージ|空き容量|容量不足)/, top: 3 },
];

for (const item of cases) {
  test(`検索回帰: ${item.query}`, () => {
    const results = searchSettings(settings, item.query).slice(0, item.top);
    assert.ok(results.some((setting) => item.expected.test(setting.title)), `上位${item.top}件: ${results.map((setting) => setting.title).join(" / ")}`);
  });
}
