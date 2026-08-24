import { evaluateGuide } from "./content-operations";
import { canonicalIntentKey } from "./duplicate-detection";
import type { Setting, SettingWriteInput } from "./types";

export type PublicationBlock = { code: string; message: string };

function asSetting(input: SettingWriteInput, id = "publication-candidate"): Setting {
  return {
    ...input,
    id,
    updated_at: new Date().toISOString(),
    aliases: input.aliases || [],
    keywords: input.keywords || [],
    path: input.path || [],
    steps: input.steps || [],
    related_slugs: input.related_slugs || [],
  };
}

export function publicationBlocks(input: SettingWriteInput | Setting): PublicationBlock[] {
  const setting = "id" in input ? input : asSetting(input);
  if (setting.status === "draft") return [];
  const evaluation = evaluateGuide(setting);
  const blocks: PublicationBlock[] = [];
  if (!setting.source_url) blocks.push({ code: "missing-source", message: "公開前に情報源URLが必要です" });
  if (!setting.verified_at) blocks.push({ code: "unverified", message: "公開前に検証日が必要です" });
  else if (!Number.isFinite(Date.parse(setting.verified_at))) {
    blocks.push({ code: "invalid-verification-date", message: "検証日をISO形式などの有効な日付で登録してください" });
  }
  if (evaluation.sourceType === "INVALID" || evaluation.sourceType === "UNKNOWN") blocks.push({ code: "untrusted-source", message: "情報源の信頼区分を確認してください" });
  if (evaluation.indexingIssues.includes("generic-source")) blocks.push({ code: "generic-source", message: "一般トップページではなく、手順を裏付ける個別の情報源が必要です" });
  if (evaluation.statuses.includes("MISSING_VERSION")) blocks.push({ code: "missing-version", message: "対応するOS・アプリのバージョンを登録してください" });
  if (evaluation.statuses.includes("UNSAFE_TO_PUBLISH")) blocks.push({ code: "unsafe", message: "安全性または必須データに問題があります" });
  if (evaluation.statuses.includes("MISSING_STEPS")) blocks.push({ code: "missing-steps", message: "具体的な手順と最短経路が不足しています" });
  if (evaluation.statuses.includes("LOW_VALUE")) blocks.push({ code: "low-value", message: "自動生成の定型文が残っています" });
  if (evaluation.requiresUndo && !setting.rollback?.trim()) blocks.push({ code: "missing-rollback", message: "設定変更を元に戻す方法を登録してください" });
  if (evaluation.requiresIfMissing && !setting.if_missing?.trim()) blocks.push({ code: "missing-if-missing", message: "設定項目が見つからない場合の案内を登録してください" });
  if (evaluation.completeness < 70) blocks.push({ code: "incomplete", message: `完全性が公開基準未満です（${evaluation.completeness}/100）` });
  return [...new Map(blocks.map((block) => [block.code, block])).values()];
}

export function intentCollisions(input: SettingWriteInput | Setting, existing: Setting[], currentId?: string): Setting[] {
  const setting = "id" in input ? input : asSetting(input);
  const intent = canonicalIntentKey(setting);
  if (!intent) return [];
  return existing.filter((candidate) => candidate.id !== currentId && canonicalIntentKey(candidate) === intent);
}
