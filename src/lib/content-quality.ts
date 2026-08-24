import { CATEGORIES, getStepText, isOSType, type Setting } from "./types";
import { assessSource } from "./source-quality";

export type ArticleRiskLevel = "data-loss" | "security" | "admin" | "caution";

const BOILERPLATE_PATTERNS = [
  /公式情報ベースの下書き候補/,
  /該当する発生場面/,
  /発生場面：.*更新時.*インストール時.*サインイン時/,
  /設定・接続・権限・更新の順で原因を切り分ける手順です/,
];

const DATA_LOSS_PATTERN = /(初期化|工場出荷|完全に削除|データ.*削除|写真.*削除|アカウント.*削除|フォーマット|消去|ネットワーク.*リセット|設定.*リセット|プロファイル.*削除|資格情報.*削除)/i;
const SECURITY_PATTERN = /(ファイアウォール|ウイルス対策|暗号化|二要素|2段階|パスコード|パスワード|セキュリティ).*(無効|オフ|解除|削除|変更)/i;
const ADMIN_PATTERN = /(管理者権限|管理者として|PowerShell|コマンドプロンプト|ターミナル|Terminal|レジストリ|regedit|サービス\s*>|Windows Audioサービス)/i;

function articleText(setting: Setting): string {
  return [
    setting.title,
    setting.description,
    setting.caution || "",
    ...setting.path,
    ...setting.steps.map(getStepText),
  ].join(" ");
}

export function hasBoilerplateContent(setting: Setting): boolean {
  const text = [setting.title, setting.description, setting.device_scope || "", setting.rollback || ""].join(" ");
  return BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text));
}

export function getArticleRiskLevel(setting: Setting): ArticleRiskLevel | null {
  const text = articleText(setting);
  if (DATA_LOSS_PATTERN.test(text)) return "data-loss";
  if (SECURITY_PATTERN.test(text)) return "security";
  if (ADMIN_PATTERN.test(text)) return "admin";
  return setting.caution ? "caution" : null;
}

export function isReviewOverdue(setting: Setting, now = Date.now()): boolean {
  if (setting.review_due_at) {
    const due = Date.parse(setting.review_due_at);
    if (Number.isFinite(due) && due < now) return true;
  }
  if (!setting.verified_at) return false;
  const verified = Date.parse(setting.verified_at);
  return Number.isFinite(verified) && verified < now - 1000 * 60 * 60 * 24 * 548;
}

export function getSettingIndexingIssues(setting: Setting, now = Date.now()): string[] {
  const issues: string[] = [];
  if (setting.index_status === "noindex") issues.push("explicit-noindex");
  const description = setting.description.trim();
  const stepCharacters = setting.steps.map(getStepText).join("").trim().length;
  const verifiedAt = setting.verified_at ? Date.parse(setting.verified_at) : Number.NaN;
  const source = assessSource(setting.source_url);
  const risk = getArticleRiskLevel(setting);
  const securityDisable = risk === "security"
    && /(無効|オフ|解除|削除)/.test(`${setting.title} ${setting.steps.map(getStepText).join(" ")}`);

  if (!isOSType(setting.os)) issues.push("unsupported-platform");
  if (!CATEGORIES[setting.category]) issues.push("unknown-category");
  // 概要だけの文字数ではなく、実行可能な手順を含む本文全体で薄さを判定する。
  // 旧40文字条件は、具体的な5手順がある記事まで大量に除外していた。
  if (description.length < 24 || description.length + stepCharacters < 90) issues.push("thin-description");
  if (setting.path.length === 0 || setting.steps.length < 2 || stepCharacters < 45) issues.push("thin-steps");
  if (!source.secure || !source.authoritative) issues.push("missing-authoritative-source");
  if (source.generic) issues.push("generic-source");
  if (!Number.isFinite(verifiedAt) || verifiedAt > now + 1000 * 60 * 60 * 24) issues.push("unverified");
  if (isReviewOverdue(setting, now)) issues.push("review-overdue");
  if (hasBoilerplateContent(setting)) issues.push("boilerplate");
  if ((risk === "data-loss" || risk === "admin" || securityDisable) && !setting.caution?.trim()) {
    issues.push("missing-required-caution");
  }
  return issues;
}

export function isSettingIndexable(setting: Setting, now = Date.now()): boolean {
  return getSettingIndexingIssues(setting, now).length === 0;
}

export function sourceLabel(sourceUrl: string | null | undefined): "公式情報" | "参考情報" {
  return assessSource(sourceUrl).authoritative ? "公式情報" : "参考情報";
}
