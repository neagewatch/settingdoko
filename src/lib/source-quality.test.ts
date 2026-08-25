import assert from "node:assert/strict";
import test from "node:test";
import { assessSource } from "./source-quality";

test("地域コード付きのサポートトップを個別資料と誤認しない", () => {
  assert.equal(assessSource("https://support.microsoft.com/en-us/windows/").generic, true);
  assert.equal(assessSource("https://support.microsoft.com/en-gb/windows").generic, true);
});

test("地域コード付きでも個別の公式資料はgeneric扱いにしない", () => {
  assert.equal(
    assessSource("https://support.microsoft.com/en-us/windows/fix-wi-fi-connection-issues-in-windows").generic,
    false,
  );
});

test("メーカーのサポート入口は個別資料と判定しない", () => {
  assert.equal(assessSource("https://support.google.com/pixelphone/").generic, true);
  assert.equal(assessSource("https://k-tai.sharp.co.jp/support/").generic, true);
  assert.equal(assessSource("https://www.sony.jp/support/xperia/").generic, true);
});
