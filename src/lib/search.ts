import { getStepText, Setting, OSType, ALIAS_MAP } from "./types";

/** 設定名を知らない人の「目的」を、検索に使える言葉へ展開する。 */
const PURPOSE_TERMS: Array<{ matches: RegExp; terms: string[] }> = [
  { matches: /バッテリ|電池|長持ち|充電.*(節約|抑え)/i, terms: ["バッテリー", "電池", "省電力", "充電"] },
  { matches: /通知.*(消|止|オフ|うるさ)|通知を/i, terms: ["通知", "集中モード"] },
  { matches: /(画面|ディスプレイ).*(暗|明る)|明るさ/i, terms: ["明るさ", "暗い", "ディスプレイ"] },
  { matches: /充電.*80|80.*充電/i, terms: ["充電", "バッテリー", "上限"] },
  { matches: /(wi-?fi|wifi|ワイファイ).*(切|繋|つなが|不安定)|ネット.*切/i, terms: ["Wi-Fi", "ネットワーク"] },
  { matches: /通信量|ギガ|データ.*(節約|減)|モバイル.*データ/i, terms: ["通信量", "モバイルデータ", "データ通信"] },
  { matches: /拡張子|ファイル.*(種類|見え)|txt|jpg/i, terms: ["拡張子", "ファイル名", "ファイルの種類", "エクスプローラー"] },
  { matches: /マイク|音声|声.*(使え|出な)|会議.*音/i, terms: ["マイク", "音声", "許可", "権限"] },
  { matches: /bluetooth|ブルートゥース|イヤホン|ペアリング/i, terms: ["Bluetooth", "接続", "ペアリング", "イヤホン"] },
  { matches: /カメラ|写真.*撮れ|ビデオ.*使え/i, terms: ["カメラ", "許可", "権限", "プライバシー"] },
];

const INTENT_TERMS = [
  "拡張子", "ファイル名", "通知", "明るさ", "Wi-Fi", "Bluetooth", "マイク", "カメラ",
  "位置情報", "バッテリー", "充電", "音量", "スリープ", "画面ロック", "ストレージ", "スクリーンショット",
  "パスコード", "文字サイズ", "DNS", "プライバシー", "権限", "ネットワーク", "接続",
];

const OS_TERMS: Array<{ os: OSType; terms: string[] }> = [
  { os: "windows11", terms: ["windows", "windows11", "win11", "pc"] },
  { os: "ios", terms: ["iphone", "ios", "あいふぉん"] },
  { os: "android", terms: ["android", "アンドロイド", "あんどろいど"] },
  { os: "macos", terms: ["mac", "macos", "macbook"] },
];

const OS_SORT_ORDER: OSType[] = ["windows11", "ios", "android", "macos", "windows10"];

function expandPurposeTerms(query: string): string[] {
  return PURPOSE_TERMS
    .filter((intent) => intent.matches.test(query))
    .flatMap((intent) => intent.terms);
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

  const tokens = buildTerms(q);
  if (!tokens.length && detectedOS) return settings.filter((s) => s.os === detectedOS);
  const scored = settings
    .filter((s) => !detectedOS || s.os === detectedOS)
    .map((s) => {
      const title = normalizeQuery(s.title);
      const aliases = s.aliases.map(normalizeQuery);
      const keywords = s.keywords.map(normalizeQuery);
      const description = normalizeQuery(s.description);
      const allFields = [...aliases, ...keywords, ...s.path.map(normalizeQuery), ...s.steps.map(getStepText).map(normalizeQuery), normalizeQuery(s.category)].join(" ");
      let score = 0;
      let matched = 0;
      for (const t of tokens) {
        const titleMatch = title.includes(t);
        const aliasMatch = aliases.some((a) => a.includes(t));
        const keywordMatch = keywords.some((k) => k.includes(t));
        const descriptionMatch = description.includes(t);
        const fieldMatch = allFields.includes(t);
        if (titleMatch) score += 20;
        if (aliasMatch) score += 14;
        if (keywordMatch) score += 10;
        if (descriptionMatch) score += 5;
        if (fieldMatch) score += 2;
        // 複数語検索では、手順本文に偶然含まれる語だけの候補を除外する。
        if (titleMatch || aliasMatch || keywordMatch || descriptionMatch) matched++;
        if (t.length >= 4 && aliases.some((a) => a.length >= 4 && levenshtein(a, t) <= 1)) score += 5;
      }
      if (q.length >= 2 && title === q) score += 60;
      if (title.includes(q)) score += 25;
      if (aliases.some((alias) => alias === q)) score += 30;
      score += matched * 3;
      return { setting: s, score, matched };
    })
    .filter((r) => r.score > 0 && (tokens.length <= 1 || r.matched >= 1))
    .sort((a, b) => {
      const scoreDifference = b.score - a.score;
      if (scoreDifference) return scoreDifference;
      const verificationDifference = new Date(b.setting.verified_at || b.setting.updated_at).getTime() - new Date(a.setting.verified_at || a.setting.updated_at).getTime();
      if (verificationDifference) return verificationDifference;
      return OS_SORT_ORDER.indexOf(a.setting.os) - OS_SORT_ORDER.indexOf(b.setting.os);
    });

  return scored.map((r) => r.setting);
}
