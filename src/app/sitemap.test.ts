import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "./sitemap";
import { getAllSettings } from "@/lib/data";
import { isSettingIndexable } from "@/lib/content-quality";

test("サイトマップの記事URLは公開・indexable記事と一致し重複しない", async () => {
  const entries = await sitemap();
  const settingUrls = entries.map((entry) => entry.url).filter((url) => url.includes("/setting/"));
  assert.equal(new Set(settingUrls).size, settingUrls.length);

  const expected = (await getAllSettings())
    .filter((setting) => setting.status !== "draft" && isSettingIndexable(setting))
    .map((setting) => `https://settingdoko.vercel.app/setting/${setting.slug}?os=${setting.os}`)
    .sort();
  assert.deepEqual([...settingUrls].sort(), expected);
});
