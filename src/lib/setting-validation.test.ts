import assert from "node:assert/strict";
import test from "node:test";
import { parseSettingWriteInput } from "./setting-validation";

const base = {
  title: "Wi-Fiをオンにする",
  slug: "wifi-on",
  os: "windows11",
  version: "Windows 11 24H2",
  category: "network",
  aliases: ["wifi", "Wi-Fi"],
  path: ["設定", "ネットワーク"],
  steps: ["設定を開きます。", "Wi-Fiをオンにします。"],
  related_slugs: [],
  keywords: ["Wi-Fi", "無線LAN"],
  description: "Windows 11でWi-Fiをオンにする手順です。",
  status: "draft",
};

test("情報源URLはHTTPSだけを受け付ける", () => {
  assert.equal(parseSettingWriteInput({ ...base, source_url: "http://support.microsoft.com/example" }), null);
  assert.ok(parseSettingWriteInput({ ...base, source_url: "https://support.microsoft.com/example" }));
});

test("公開運用の明示状態は許可された値だけを受け付ける", () => {
  assert.equal(parseSettingWriteInput({ ...base, index_status: "always-index" }), null);
  const parsed = parseSettingWriteInput({ ...base, index_status: "noindex", content_type: "troubleshooting", workflow_status: "candidate" });
  assert.equal(parsed?.index_status, "noindex");
  assert.equal(parsed?.content_type, "troubleshooting");
  assert.equal(parsed?.workflow_status, "candidate");
});
