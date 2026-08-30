import { inferContentType, type ContentType } from "./content-operations";
import { getStepText, OS_LABELS, type Setting } from "./types";
import { getArticleRiskLevel } from "./content-quality";
import { getReviewedSetting } from "./editorial-review";

export type ArticleCopy = {
  contentType: ContentType;
  kindLabel: string;
  description: string;
  lead: string;
  scope: string;
  stepSummary: string;
  firstAction: string;
  lastAction: string;
  process: string;
  preflight: string;
  outcome: string;
  outcomeHeading: string;
  missing: string;
  missingHeading: string;
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  SETTING_GUIDE: "設定ガイド",
  TROUBLESHOOTING_GUIDE: "トラブル解決",
  ERROR_CODE_GUIDE: "エラーコード",
};

const GENERIC_PATH_SEGMENTS = new Set([
  "設定",
  "システム設定",
  "一般",
  "確認",
  "手順",
  "トラブルシューティング",
  "トラブル解決",
]);

function targetLabel(setting: Setting): string {
  const target = [...setting.path]
    .reverse()
    .map((segment) => segment.trim())
    .find((segment) => segment && !GENERIC_PATH_SEGMENTS.has(segment));
  return target || setting.title;
}

function platformScope(setting: Setting): string {
  const platform = OS_LABELS[setting.os] || setting.os;
  const version = setting.version.trim();
  return `${platform}${version ? `（${version}）` : ""}を基準にしています。OSやアプリの版、機種・メーカーによって、項目名や表示位置が異なる場合があります。`;
}

function summarizeStep(step: Setting["steps"][number] | undefined): string {
  if (!step) return "";
  const text = getStepText(step).replace(/\s+/g, " ").replace(/[。．]+$/u, "").trim();
  if (text.length <= 88) return text;
  return `${text.slice(0, 85)}…`;
}

function improveDescription(setting: Setting): string {
  const current = setting.description.trim();
  const first = summarizeStep(setting.steps[0]);
  const last = summarizeStep(setting.steps[setting.steps.length - 1]);
  const isThin = current.length < 55;
  const isBoilerplate = /確認手順です\.?$|設定方法です\.?$/u.test(current);
  if (!isThin && !isBoilerplate) return current;

  const route = first && last && first !== last
    ? `最初に「${first}」を確認し、最後に「${last}」まで進めます。`
    : first
      ? `「${first}」から順番に進めます。`
      : "記事内の手順を上から順番に確認します。";
  const base = current || `${setting.title}について案内します。`;
  return `${base.replace(/[。．]+$/u, "")}。${route}`;
}

function safetyNote(setting: Setting): string {
  if (setting.caution?.trim()) return setting.caution.trim();
  const risk = getArticleRiskLevel(setting);
  if (risk === "data-loss") return "削除・初期化・リセットを行う前に、必要なデータのバックアップと元に戻せる範囲を確認してください。";
  if (risk === "security") return "保護機能や権限を変更する場合は、必要な範囲だけにし、変更後の影響を確認してください。";
  if (risk === "admin") return "管理者権限や組織のポリシーが関係する場合は、会社・学校の端末では管理者に確認してください。";
  return "操作前に、対象の端末・アプリと現在の設定を確認してください。";
}

function missingGuidance(setting: Setting, contentType: ContentType): string {
  if (setting.if_missing?.trim()) return setting.if_missing.trim();

  const target = targetLabel(setting);
  const platform = OS_LABELS[setting.os] || setting.os;
  const version = setting.version.trim();
  const versionNote = `${platform}${version ? `（${version}）` : ""}と異なる版や、機種・メーカーによって項目名や場所が異なることがあります。`;

  if (contentType === "ERROR_CODE_GUIDE") {
    return `表示されたエラーコードと一致する項目が見つからない場合は、コード・表示文言・発生したアプリを控えて、公式サポートで検索してください。${versionNote}`;
  }
  if (contentType === "TROUBLESHOOTING_GUIDE") {
    return `症状に対応する「${target}」が見つからない場合は、設定画面やアプリ内の検索で項目名を探してください。${versionNote}`;
  }
  return `「${target}」が見つからない場合は、設定画面やアプリ内の検索で項目名を探してください。${versionNote}`;
}

export function getArticleCopy(setting: Setting): ArticleCopy {
  const reviewedSetting = getReviewedSetting(setting);
  const contentType = inferContentType(reviewedSetting);
  const stepCount = reviewedSetting.steps.length;
  const firstAction = summarizeStep(reviewedSetting.steps[0]) || "対象の設定画面を開く";
  const lastAction = summarizeStep(reviewedSetting.steps[reviewedSetting.steps.length - 1]) || "変更後の状態を確認する";
  const stepSummary = stepCount > 0
    ? `${stepCount}手順${setting.estimate_minutes ? `・目安${setting.estimate_minutes}分` : ""}`
    : "手順を確認してください";

  const lead = contentType === "ERROR_CODE_GUIDE"
    ? "表示されたエラーコードや文言と記事の対象が一致するか確認してから、手順を上から試します。"
    : contentType === "TROUBLESHOOTING_GUIDE"
      ? "症状が出ている端末やアプリで、下の手順を上から一つずつ試します。途中で改善したら、残りの操作は不要です。"
      : "設定場所と操作手順を確認してから、下のチェックリストを上から進めます。";

  const process = contentType === "ERROR_CODE_GUIDE"
    ? "操作前に、エラーコード・表示文言・発生したアプリを控えておくと、再発時の確認や問い合わせに役立ちます。"
    : contentType === "TROUBLESHOOTING_GUIDE"
      ? "一度に複数の変更をせず、各手順のあとに症状が変わったか確認します。"
      : "設定場所を開いて、変更前の状態を確認してから操作します。";

  const outcome = reviewedSetting.impact?.trim()
    || (contentType === "TROUBLESHOOTING_GUIDE"
      ? "各手順のあとに症状が改善したか確認し、直らなければ次の手順へ進みます。"
      : contentType === "ERROR_CODE_GUIDE"
        ? "同じエラーが再発するか、対象の操作を最後まで完了できるか確認してください。"
        : "設定後に、目的の動作が反映されたか確認してください。");
  const outcomeHeading = contentType === "TROUBLESHOOTING_GUIDE"
    ? "改善したか確認する"
    : contentType === "ERROR_CODE_GUIDE"
      ? "再発しないか確認する"
      : "設定後に確認すること";
  const missingHeading = contentType === "ERROR_CODE_GUIDE"
    ? "エラーコードが一致しない場合"
    : "項目が見つからない場合";

  return {
    contentType,
    kindLabel: CONTENT_TYPE_LABELS[contentType],
    description: improveDescription(reviewedSetting),
    lead,
    scope: reviewedSetting.device_scope?.trim() || platformScope(reviewedSetting),
    stepSummary,
    firstAction,
    lastAction,
    process,
    preflight: safetyNote(reviewedSetting),
    outcome,
    outcomeHeading,
    missing: missingGuidance(reviewedSetting, contentType),
    missingHeading,
  };
}
