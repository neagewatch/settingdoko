import { revalidatePath } from "next/cache";
import { clearPublicSettingsCache } from "@/lib/data";

// 公開記事の状態が変わったときに、件数・一覧・導線を同時に更新する。
// Route Handlerから呼ぶため、次回アクセス時に各ページを再生成する。
const PUBLIC_SETTING_PATHS: Array<{ path: string; type?: "page" }> = [
  { path: "/", type: "page" },
  { path: "/os/[os]", type: "page" },
  { path: "/category/[cat]", type: "page" },
  { path: "/setting/[slug]", type: "page" },
  { path: "/compare/[slug]", type: "page" },
  { path: "/feature/[id]", type: "page" },
  { path: "/diagnose", type: "page" },
  { path: "/sitemap.xml" },
];

export function revalidatePublicSettings() {
  clearPublicSettingsCache();
  for (const target of PUBLIC_SETTING_PATHS) {
    if (target.type) revalidatePath(target.path, target.type);
    else revalidatePath(target.path);
  }
}
