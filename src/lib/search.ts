import { getStepText, Setting, OSType, ALIAS_MAP, PLATFORM_TYPES } from "./types";
import { hasBoilerplateContent } from "./content-quality";
import { canonicalSlug } from "./duplicate-detection";

/** 設定名を知らない人の「目的」を、検索に使える言葉へ展開する。 */
const PURPOSE_TERMS: Array<{ matches: RegExp; terms: string[] }> = [
  { matches: /バッテリ|電池|長持ち|充電.*(節約|抑え)/i, terms: ["バッテリー", "電池", "省電力", "充電"] },
  { matches: /通知.*(音|サウンド).*(だけ|消|止|オフ|小さ|鳴)/i, terms: ["通知", "通知音", "サウンド", "音量", "バイブレーション"] },
  { matches: /通知.*(届か|来な|表示されな|受け取れ|遅れ)/i, terms: ["通知", "届かない", "表示", "受け取る", "通知履歴"] },
  { matches: /通知.*(消|止|オフ|うるさ)|通知を/i, terms: ["通知", "集中モード"] },
  { matches: /(画面|ディスプレイ).*(暗|明る)|明るさ/i, terms: ["明るさ", "暗い", "暗く", "ディスプレイ"] },
  { matches: /(暗い|暗く|まぶしい)/i, terms: ["画面", "明るさ", "暗い", "暗く", "ディスプレイ"] },
  { matches: /(文字|字|フォント).*(大き|小さ|でか|おおき|ちいさ|見づら|読みにく)/i, terms: ["文字サイズ", "フォントサイズ", "表示サイズ", "アクセシビリティ"] },
  { matches: /(パスワード|パスコード|暗証番号).*(変|変更|忘|再設定|リセット)/i, terms: ["パスワード", "パスコード", "アカウント", "セキュリティ"] },
  { matches: /(スリープ|自動ロック|画面.*消え|画面.*消灯).*(時間|遅|早|変|設定)?/i, terms: ["スリープ", "自動ロック", "画面ロック", "電源"] },
  { matches: /充電.*80|80.*充電/i, terms: ["充電", "バッテリー", "上限"] },
  { matches: /(wi-?fi|wifi|ワイファイ).*(切|繋|つなが|不安定)|ネット.*切/i, terms: ["Wi-Fi", "ネットワーク"] },
  { matches: /通信量|ギガ|データ.*(節約|減)|モバイル.*データ/i, terms: ["通信量", "モバイルデータ", "データ通信"] },
  { matches: /拡張子|ファイル.*(種類|見え)|txt|jpg/i, terms: ["拡張子", "ファイル名", "ファイルの種類", "エクスプローラー"] },
  { matches: /マイク|音声|声.*(使え|出な)|会議.*音/i, terms: ["マイク", "音声", "許可", "権限"] },
  { matches: /bluetooth|ブルートゥース|イヤホン|ペアリング/i, terms: ["Bluetooth", "接続", "ペアリング", "イヤホン"] },
  { matches: /カメラ|写真.*撮れ|ビデオ.*使え/i, terms: ["カメラ", "許可", "権限", "プライバシー"] },
  { matches: /(写真|画像|ビデオ).*(消した|消す|削除|捨て)/i, terms: ["写真", "削除", "最近削除した項目", "容量"] },
  { matches: /(容量|空き容量|ストレージ).*(ない|不足|いっぱい|少な)|容量ない/i, terms: ["ストレージ", "空き容量", "容量不足", "いっぱい"] },
  { matches: /(音|サウンド|スピーカー).*(出ない|出な|聞こえ|鳴らない)/i, terms: ["音", "サウンド", "スピーカー", "出力"] },
  { matches: /(word|ワード).*(余白|マージン)|余白.*(word|ワード)/i, terms: ["Word", "余白", "レイアウト", "ページ設定"] },
];

const INTENT_TERMS = [
  "拡張子", "ファイル名", "通知", "通知音", "明るさ", "Wi-Fi", "Bluetooth", "マイク", "カメラ",
  "位置情報", "バッテリー", "充電", "音量", "スリープ", "画面ロック", "ストレージ", "スクリーンショット",
  "パスコード", "文字サイズ", "DNS", "プライバシー", "権限", "ネットワーク", "接続",
];

const OS_TERMS: Array<{ os: OSType; terms: string[] }> = [
  { os: "windows11", terms: ["windows", "windows11", "win11", "pc"] },
  { os: "ios", terms: ["iphone", "ios", "あいふぉん"] },
  { os: "android", terms: ["android", "アンドロイド", "あんどろいど"] },
  { os: "macos", terms: ["mac", "macos", "macbook"] },
];

const OS_SORT_ORDER: readonly OSType[] = PLATFORM_TYPES;
const ERROR_CODE_PATTERN = /(?:0x[0-9a-f]{4,}|\b\d{3,5}(?:-\d{3,5})?\b)/i;

export type SearchIntentDomain =
  | "notification"
  | "text-size"
  | "brightness"
  | "network"
  | "bluetooth"
  | "microphone"
  | "extension"
  | "generic";

export type SearchIntentGoal = "quiet" | "missing" | "sound";

export type SearchIntent = {
  domain: SearchIntentDomain;
  goal?: SearchIntentGoal;
};

function expandPurposeTerms(query: string): string[] {
  return PURPOSE_TERMS
    .filter((intent) => intent.matches.test(query))
    .flatMap((intent) => intent.terms);
}

const NOTIFICATION_QUIET_PATTERN = /(通知.*(うるさ|多い|止|消|オフ|減|少なく|邪魔|静か)|集中モード|おやすみモード|通知をミュート)/i;
const NOTIFICATION_MISSING_PATTERN = /(通知.*(届か|来な|表示されな|受け取れ|遅れ|見えな)|通知がない|通知されな)/i;
const NOTIFICATION_SOUND_PATTERN = /(通知.*(音|サウンド).*(だけ|消|止|オフ|小さ|鳴)|通知音|通知サウンド)/i;
const NOTIFICATION_OPPOSITE_QUIET_PATTERN = /(通知.*(届か|来な|表示されな|受け取れ|遅れ|見えな|鳴らな|出な|隠して)|通知音.*(鳴らな|出な))/i;
const NOTIFICATION_OPPOSITE_MISSING_PATTERN = /(通知.*(オフ|消|止|ミュート|非表示|表示しない|隠)|通知.*(うるさ|多い|邪魔))/i;
const NOTIFICATION_BLOCKER_TROUBLESHOOT_PATTERN = /(集中モード|応答不可|フォーカス).*(通知).*(隠している|隠れている|表示されな|届かな|来な)/i;
const NOTIFICATION_SOUND_ONLY_PATTERN = /(通知音|通知サウンド|通知.*音.*だけ|音.*だけ.*通知|サウンド.*だけ)/i;
const NOTIFICATION_HISTORY_PATTERN = /(通知履歴|消した通知|最近.*通知)/i;
const FAILURE_INTENT_PATTERN = /(できない|つながらない|繋がらない|切れる|途切れる|不安定|見つからない|認識しない|使えない|届かない|表示されない|動かない|エラー|失敗)/i;

/**
 * 検索語の対象と目的を分ける。対象だけで検索する場合は候補を広めに残すが、
 * 「止めたい」と「届かない」のように方向が明確な場合は、反対の目的の記事を
 * 結果へ混ぜないために後段で利用する。
 */
export function analyzeSearchIntent(query: string): SearchIntent {
  const normalized = normalizeQuery(query);
  if (/通知|notification|集中モード|おやすみモード|通知音/i.test(normalized)) {
    const goal: SearchIntentGoal | undefined = NOTIFICATION_SOUND_PATTERN.test(normalized)
      ? "sound"
      : NOTIFICATION_MISSING_PATTERN.test(normalized)
        ? "missing"
        : NOTIFICATION_QUIET_PATTERN.test(normalized)
          ? "quiet"
          : undefined;
    return { domain: "notification", ...(goal ? { goal } : {}) };
  }
  if (/(文字|フォント|テキスト).*(大き|小さ|サイズ|拡大|縮小|見づら|読みにく)|文字サイズ|フォントサイズ/i.test(normalized)) {
    return { domain: "text-size" };
  }
  if (/(画面|ディスプレイ|明るさ).*(暗|明る|まぶし)|画面が暗い|画面を暗く|明るさ/i.test(normalized)) {
    return { domain: "brightness" };
  }
  if (/bluetooth|ブルートゥース|イヤホン|ペアリング/i.test(normalized)) return { domain: "bluetooth" };
  if (/(wi-?fi|wifi|ワイファイ|ネット|インターネット|無線lan)/i.test(normalized)) return { domain: "network" };
  if (/マイク|microphone/i.test(normalized)) return { domain: "microphone" };
  if (/拡張子|ファイル.*(種類|見え)|\.txt|\.jpg/i.test(normalized)) return { domain: "extension" };
  return { domain: "generic" };
}

/** 表記ゆれ・タイポ補正 */
export function normalizeQuery(query: string): string {
  let q = query.normalize("NFKC").toLowerCase().trim().replace(/[\u3000\s]+/g, " ");
  for (const [from, to] of Object.entries(ALIAS_MAP)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    q = q.replace(new RegExp(escaped, "gi"), to);
  }
  return q.toLowerCase();
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function buildTerms(query: string): string[] {
  const normalized = normalizeQuery(query);
  const purposeTerms = expandPurposeTerms(normalized).map((term) => normalizeQuery(term));
  const intentTerms = INTENT_TERMS.filter((term) => normalized.includes(normalizeQuery(term))).map(normalizeQuery);
  const osTerms = new Set(OS_TERMS.flatMap(({ terms }) => terms.map(normalizeQuery)));
  const terms = [
    ...normalized.split(/\s+/).filter((term) => term && !osTerms.has(term)),
    ...purposeTerms,
    ...intentTerms,
  ];
  return [...new Set(terms)].filter((term) => term.length > 0);
}

function inferredOS(query: string): OSType | undefined {
  const normalized = normalizeQuery(query);
  return OS_TERMS.find(({ terms }) => terms.some((term) => normalized.includes(normalizeQuery(term))))?.os;
}

function candidateSearchText(setting: Setting): string {
  return normalizeQuery([
    setting.title,
    setting.slug,
    setting.category,
    setting.description,
    ...setting.aliases,
    ...setting.keywords,
    ...setting.path,
    ...setting.steps.map(getStepText),
  ].join(" "));
}

function candidateIntentText(setting: Setting): string {
  return normalizeQuery([
    setting.title,
    setting.slug,
    setting.category,
    ...setting.aliases,
    ...setting.keywords,
  ].join(" "));
}

function matchesIntentDomain(setting: Setting, intent: SearchIntent): boolean {
  if (intent.domain === "generic") return true;
  const text = candidateSearchText(setting);
  switch (intent.domain) {
    case "notification":
      return /(通知|notification|集中モード|おやすみモード)/i.test(text);
    case "text-size":
      return /(文字(?:サイズ)?|テキスト(?:のサイズ)?|フォントサイズ|表示サイズ|表示倍率|拡大鏡|文字.*(大き|小さ))/i.test(text);
    case "brightness":
      return /(明るさ|輝度|brightness|画面.*(暗|明る)|暗い|まぶしい|夜間モード|Night Shift)/i.test(text);
    case "network":
      return /(wi-?fi|wifi|ワイファイ|ネットワーク|インターネット|無線lan|モバイルデータ|テザリング)/i.test(text);
    case "bluetooth":
      return /(bluetooth|ブルートゥース|ペアリング|イヤホン)/i.test(text);
    case "microphone":
      return /(マイク|microphone)/i.test(text);
    case "extension":
      return /(拡張子|ファイル名|ファイルの種類|extension)/i.test(text);
  }
}

function matchesNotificationGoal(setting: Setting, goal: SearchIntentGoal | undefined): boolean {
  if (!goal) return true;
  // パスの「集中モード」など、別機能の階層名だけでは目的一致とみなさない。
  const text = candidateIntentText(setting);
  if (goal === "quiet") {
    if (NOTIFICATION_OPPOSITE_QUIET_PATTERN.test(text)
      || NOTIFICATION_BLOCKER_TROUBLESHOOT_PATTERN.test(text)
      || NOTIFICATION_SOUND_ONLY_PATTERN.test(text)
      || NOTIFICATION_HISTORY_PATTERN.test(text)) return false;
    return NOTIFICATION_QUIET_PATTERN.test(text) || /(通知を止|通知をオフ|通知を消|通知を減|通知.*静か)/i.test(text);
  }
  if (goal === "missing") {
    if (NOTIFICATION_OPPOSITE_MISSING_PATTERN.test(text) && !NOTIFICATION_BLOCKER_TROUBLESHOOT_PATTERN.test(text)) return false;
    return NOTIFICATION_MISSING_PATTERN.test(text) || /(通知.*(届|来|表示|受信|遅れ|見え))/i.test(text);
  }
  if (NOTIFICATION_OPPOSITE_QUIET_PATTERN.test(text)) return false;
  // 「通知音だけ」は着信音・アラームなど端末全体の音量設定へ逸らさない。
  if (/着信音/.test(setting.title) && !/通知音/.test(setting.title)) return false;
  return NOTIFICATION_SOUND_PATTERN.test(text) || /(通知音|通知サウンド|音量|バイブレーション|着信音)/i.test(text);
}

function matchesFailureIntent(setting: Setting, intent: SearchIntent, troubleshootingQuery: boolean): boolean {
  if (!troubleshootingQuery || !["network", "bluetooth", "microphone"].includes(intent.domain)) return true;
  const text = candidateIntentText(setting);
  if (FAILURE_INTENT_PATTERN.test(text)) return true;
  // マイクが使えない場合は、症状記事だけでなく権限を許可する直接解決も残す。
  return intent.domain === "microphone" && /(マイク|microphone).*(許可|アクセス)/i.test(text);
}

/** Simple full-text search scoring */
export function searchSettings(
  settings: Setting[],
  query: string,
  osFilter?: OSType
): Setting[] {
  const normalized = normalizeQuery(query);
  const q = normalized.toLowerCase().trim();
  const detectedOS = osFilter || inferredOS(q);
  if (!q) return detectedOS ? settings.filter((s) => s.os === detectedOS) : settings;
  const troubleshootingQuery = /(できない|つながらない|繋がらない|見つからない|表示されない|エラー|失敗|動かない|出ない|使えない|遅い|消えた|困る|不具合)/i.test(q);
  const intent = analyzeSearchIntent(q);

  const tokens = buildTerms(q);
  if (!tokens.length && detectedOS) return settings.filter((s) => s.os === detectedOS);
  const scored = settings
    .filter((s) => !detectedOS || s.os === detectedOS)
    .filter((s) => matchesIntentDomain(s, intent))
    .filter((s) => intent.domain !== "notification" || matchesNotificationGoal(s, intent.goal))
    .filter((s) => matchesFailureIntent(s, intent, troubleshootingQuery))
    // 既知の統合候補は、正規URLが同じデータセットにある場合だけ検索結果から重複表示しない。
    .filter((s) => canonicalSlug(s.slug) === s.slug || !settings.some((other) => other.os === s.os && other.slug === canonicalSlug(s.slug)))
    .map((s) => {
      const title = normalizeQuery(s.title);
      const aliases = s.aliases.map(normalizeQuery);
      const keywords = s.keywords.map(normalizeQuery);
      const primaryIntentText = candidateIntentText(s);
      const description = normalizeQuery(s.description);
      const metadataFields = [
        ...aliases,
        ...keywords,
        ...s.path.map(normalizeQuery),
        description,
        normalizeQuery(s.category),
        normalizeQuery(s.slug),
      ].join(" ");
      const allFields = [...metadataFields, ...s.steps.map(getStepText).map(normalizeQuery)].join(" ");
      let score = 0;
      let matched = 0;
      for (const t of tokens) {
        const titleMatch = title.includes(t);
        const aliasMatch = aliases.some((a) => a.includes(t));
        const keywordMatch = keywords.some((k) => k.includes(t));
        const descriptionMatch = description.includes(t);
        const primaryMatch = titleMatch || aliasMatch || keywordMatch;
        const fieldMatch = allFields.includes(t);
        if (titleMatch) score += 20;
        if (aliasMatch) score += 14;
        if (keywordMatch) score += 10;
        if (descriptionMatch) score += 5;
        if (fieldMatch) score += 2;
        // 複数語検索では、手順本文に偶然含まれる語だけの候補を除外する。
        // カテゴリ名や手順中の共通語だけで候補を成立させず、タイトル・別名・
        // キーワードのいずれかで利用者の検索語を説明できる記事だけを残す。
        if (primaryMatch) matched++;
        if (t.length >= 4 && aliases.some((a) => a.length >= 4 && levenshtein(a, t) <= 1)) score += 5;
      }
      if (q.length >= 2 && title === q) score += 60;
      if (title.includes(q)) score += 25;
      if (aliases.some((alias) => alias === q)) score += 30;
      if (ERROR_CODE_PATTERN.test(q) && (title.includes(q) || aliases.some((alias) => alias.includes(q)))) score += 80;
      // 自動生成の発生場面テンプレートは検索可能なままにするが、
      // 具体的な設定記事より先に出て初心者を迷わせないよう減点する。
      if (hasBoilerplateContent(s)) score -= 18;
      // 「画面暗い」「写真消したい」は設定・操作の目的語であり、
      // トラブル記事を先頭に出すと解決したい操作へ遠回りになる。
      if (s.category === "troubleshoot") score += troubleshootingQuery ? 4 : -35;
      if (troubleshootingQuery && ["network", "bluetooth", "microphone"].includes(intent.domain) && FAILURE_INTENT_PATTERN.test(primaryIntentText)) {
        score += 38;
      }
      if (intent.domain === "microphone" && /(マイク|microphone).*(許可|アクセス)/i.test(primaryIntentText)) {
        score += 28;
      }
      if (intent.domain === "text-size") {
        if (/(文字|テキスト|フォント).*(サイズ|大き|小さ)|表示サイズ|表示倍率/.test(title)) score += 90;
        if (/(アクセシビリティ).*(バックアップ|ショートカット|クイック)|音声認識|ナレーター|ライブキャプション/.test(title)) score -= 45;
      }
      if (!troubleshootingQuery && /(暗い|暗く|まぶしい)/i.test(q)) {
        if (title.includes("明るさを変更")) score += 100;
        if (title.includes("自動調整")) score -= 60;
      }
      if (!troubleshootingQuery && /通知.*(うるさ|止|消|オフ)/i.test(q)) {
        if (title.includes("通知をオフ") || aliases.some((alias) => alias.includes("通知を止"))) score += 70;
      }
      score += matched * 3;
      return { setting: s, score, matched };
    })
    // 検証済みというだけでは検索一致にならない。未知語は0件として返し、
    // 結果があるように見せるための無関係な記事のフォールバックを防ぐ。
    .filter((r) => r.score > 0 && r.matched >= 1)
    .sort((a, b) => {
      const scoreDifference = b.score - a.score;
      if (scoreDifference) return scoreDifference;
      const verificationDifference = new Date(b.setting.verified_at || b.setting.updated_at).getTime() - new Date(a.setting.verified_at || a.setting.updated_at).getTime();
      if (verificationDifference) return verificationDifference;
      return OS_SORT_ORDER.indexOf(a.setting.os) - OS_SORT_ORDER.indexOf(b.setting.os);
    });

  return scored.map((r) => r.setting);
}
