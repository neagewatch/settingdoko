import { evaluateGuide } from "./content-operations";
import type { SourceHealth } from "./content-operations";
import { canonicalIntentKey } from "./duplicate-detection";
import type { Setting, SettingWriteInput } from "./types";

export type PublicationBlock = { code: string; message: string };

export type PublicationStateViolation = {
  code: "DRAFT_INDEXABLE" | "UNSAFE_INDEXABLE" | "BROKEN_SOURCE_VERIFIED" | "DUPLICATE_INDEXABLE" | "WORKFLOW_INDEXABLE";
  message: string;
};

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

/** 保存済みの公開状態と決定論的品質判定の矛盾を、書き込み前に検出する。 */
export function publicationStateViolations(
  input: SettingWriteInput | Setting,
  options: { sourceHealth?: SourceHealth; duplicate?: boolean; conflicting?: boolean } = {},
): PublicationStateViolation[] {
  const setting = "id" in input ? input : asSetting(input);
  const evaluation = evaluateGuide(setting, {
    sourceHealth: setting.source_url && options.sourceHealth ? new Map([[setting.source_url, options.sourceHealth]]) : undefined,
    duplicateIds: options.duplicate ? new Set([setting.id]) : undefined,
    conflictingIds: options.conflicting ? new Set([setting.id]) : undefined,
  });
  const requestedIndex = setting.index_status === "index" || (setting.index_status !== "noindex" && evaluation.indexable);
  const violations: PublicationStateViolation[] = [];
  if (setting.status === "draft" && requestedIndex) violations.push({ code: "DRAFT_INDEXABLE", message: "下書きはindex対象にできません" });
  if (evaluation.statuses.includes("UNSAFE_TO_PUBLISH") && requestedIndex) violations.push({ code: "UNSAFE_INDEXABLE", message: "安全性に問題がある記事をindex対象にできません" });
  const sourceHealthInvalid = options.sourceHealth && (
    ["broken", "invalid", "blocked"].includes(options.sourceHealth.status)
    || ["BROKEN", "BLOCKED", "GENERIC_HOME", "WRONG_DOCUMENT"].includes(options.sourceHealth.statusClass || "")
  );
  // noindexの記事は過去の検証日を履歴として保持したまま、再検証キューで扱える。
  // 矛盾としてブロックするのは、健全性を確認できない情報源を現在index指定している場合だけ。
  if (sourceHealthInvalid && setting.verified_at && requestedIndex) {
    violations.push({ code: "BROKEN_SOURCE_VERIFIED", message: "健全性を確認できない情報源をindex対象にせず、再検証キューへ送ります" });
  }
  if ((options.duplicate || evaluation.statuses.includes("DUPLICATE_CANDIDATE")) && requestedIndex) violations.push({ code: "DUPLICATE_INDEXABLE", message: "重複候補は正規記事の確定までindex対象にできません" });
  if (setting.workflow_status && !["verified", "published"].includes(setting.workflow_status) && requestedIndex) violations.push({ code: "WORKFLOW_INDEXABLE", message: "検証・公開前のワークフロー状態をindex対象にできません" });
  return violations;
}
