import { inferContentType, type ContentType } from "./content-operations";
import { getArticleRiskLevel } from "./content-quality";
import { getStepText, OS_LABELS, type Setting, type SettingStep } from "./types";

/**
 * 公開画面に出す前の、記事本文に対する決定的な編集パス。
 *
 * ここで補うのは、記事にすでにあるタイトル・設定経路・手順から
 * 作れる説明と安全案内だけです。出典・検証日・公開状態は変更しません。
 * DBへ書き戻す処理も持たせず、管理画面の原稿を上書きしないようにします。
 */
export type EditorialTopic =
  | "error"
  | "network"
  | "bluetooth"
  | "audio"
  | "camera"
  | "display"
  | "storage"
  | "account"
  | "browser"
  | "printer"
  | "input"
  | "notification"
  | "battery"
  | "update"
  | "security"
  | "app"
  | "generic";

export type EditorialField =
  | "title"
  | "description"
  | "steps"
  | "device_scope"
  | "impact"
  | "rollback"
  | "caution"
  | "if_missing";

export type EditorialReview = {
  setting: Setting;
  contentType: ContentType;
  topic: EditorialTopic;
  changedFields: EditorialField[];
  reasons: string[];
  requiresHumanCheck: boolean;
};

const ERROR_PATTERN = /(?:0x[0-9a-f]{4,}|\b(?:err|error|caa)[-_ ]?[a-z]*\d{2,}\b|エラーコード|停止コード|警告)/i;
const GENERIC_DESCRIPTION_PATTERN = /確認手順です|設定方法です|設定・接続・権限・更新の順|該当する発生場面|発生場面：|公式情報ベース|下書き候補|が起きたの原因/;
const GENERIC_IMPACT_PATTERN = /該当する発生場面|公式情報ベース|下書き候補|起きたの原因|入口になります|^設定変更後、対象アプリを再起動すると反映される場合があります。$/u;
const GENERIC_ROLLBACK_PATTERN = /^同じ画面で変更前の値に戻せます。$/u;
const GENERIC_STEP_PATTERN = /該当する発生場面|目的の機能名を設定検索|端末の設定名とメーカー独自メニュー|発生時刻、直前の更新|症状がこのPCだけか|対象アプリだけの(?:問題|症状)|表示された(?:コード|警告文).*該当する発生場面|コードを大文字.*該当する発生場面|停止コードを撮影.*該当する発生場面|機種変更・PC交換後で|Office更新後で|直前のアプリ導入・更新・設定変更|再起動後で|再起動後の環境|設定 > システム（または端末情報）|Web版・デスクトップ版・スマートフォン版|Wi-Fiだけかモバイル通信だけか|相手・自分の通信状態|機器の電源・ケーブル・電池・物理スイッチ|設定値だけの問題か|対象の写真・動画が|表示された警告と対象ファイル|Apple Account・iCloud・メディアと購入|通知が届かないアプリ、遅れるアプリ|標準キーボードだけか|カメラ・マイク・画面収録・ファイルへのアクセス|対象ファイルの場所、iCloud Drive/;
const DRAFT_SCOPE_PATTERN = /公式情報ベースの下書き候補|下書き候補|公開前に.*確認してください/;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanSentence(value: string): string {
  return normalizeText(value)
    .replaceAll("該当する発生場面", "症状が起きた環境")
    .replaceAll("公式情報ベースの下書き候補", "一般的な案内")
    .replaceAll("公式情報ベース", "一般的な案内")
    .replaceAll("下書き候補", "案内")
    .replace(/が起きたの原因/g, "が起きたときの原因")
    .replace(/\.{2,}/g, "。");
}

function platformLabel(setting: Setting): string {
  return OS_LABELS[setting.os] || setting.os;
}

function versionLabel(setting: Setting): string {
  const platform = platformLabel(setting);
  return `${platform}${setting.version.trim() ? `（${setting.version.trim()}）` : ""}`;
}

function pathLabel(setting: Setting): string {
  const path = setting.path.map(normalizeText).filter(Boolean);
  if (!path.length) return `${platformLabel(setting)}の設定画面`;
  return path.slice(-5).join(" → ");
}

function cleanTitle(title: string): string {
  let next = normalizeText(title);
  next = next.replace(
    /^(OneDrive|Outlook|Teams|Chrome|Edge|Office|プリンター|Windows Installer)で\1(?:の)?(エラー|警告)/u,
    (_match, product: string, kind: string) => `${product}で${kind}`,
  );
  next = next.replace(
    /^(iPhone|iPad|Android|Mac)で(Safari|Chrome|Edge|Firefox)で/u,
    (_match, device: string, browser: string) => `${device}の${browser}で`,
  );
  next = next.replace(/^(Windows 11|Windows 10|iPhone|iPad|Android|Mac)で\1の/u, "$1の");
  next = next.replace(/^ブラウザでブラウザで/u, "ブラウザで");
  return next;
}

function articleSubject(setting: Setting): string {
  const title = cleanTitle(setting.title).replace(/\s*[（(][^（）()]+[）)]\s*$/u, "");
  const prefixes = [
    `${platformLabel(setting)}で`,
    `${platformLabel(setting)}の`,
    "ブラウザで",
    "ブラウザの",
    "Pixelで",
    "Galaxyで",
  ];
  let subject = title;
  for (const prefix of prefixes) {
    if (subject.startsWith(prefix)) {
      subject = subject.slice(prefix.length);
      break;
    }
  }
  subject = subject
    .replace(/(?:とき|場合)の(?:対処|確認)$/u, "")
    .replace(/を確認する$/u, "")
    .replace(/(?:を|の)?(?:設定|変更|許可|接続|追加|削除|固定|保存|選択|作成|共有|登録|解除|利用|使用|オン|オフ)(?:にする|する|できる)?$/u, "")
    .replace(/を(?:手動で|自動で)$/u, "")
    .replace(/方法$/u, "")
    .replace(/が出る$/u, "")
    .replace(/が表示される$/u, "");
  return subject.trim() || title || "この設定・症状";
}

function quotedSubject(subject: string): string {
  return subject.includes("「") ? subject : `「${subject}」`;
}

function searchableText(setting: Setting): string {
  return normalizeText([
    setting.title,
    setting.slug,
    ...setting.path,
  ].join(" ")).toLocaleLowerCase("ja-JP");
}

export function classifyEditorialTopic(setting: Setting, contentType = inferContentType(setting)): EditorialTopic {
  if (contentType === "ERROR_CODE_GUIDE" || ERROR_PATTERN.test(`${setting.title} ${setting.slug}`)) return "error";
  const text = searchableText(setting);
  if (/(chrome|edge|firefox|safari|ブラウザ|閲覧|Cookie|クッキー|キャッシュ)/i.test(text)) return "browser";
  if (/(bluetooth|airdrop|quick share|クイックシェア|ニアバイシェア)/i.test(text)) return "bluetooth";
  if (/(wifi|wi-fi|ワイファイ|無線|有線lan|イーサネット|dns|vpn|プロキシ|ネットワーク|インターネット|ホットスポット|テザリング|モバイルデータ|apn|sim|nfc|キャスト)/i.test(text)) return "network";
  if (/(通知|notification|集中モード|おやすみモード)/i.test(text)) return "notification";
  if (/(バッテリー|電池|充電|電源|battery|power(?!point))/i.test(text)) return "battery";
  if (/(マイク|microphone|スピーカー|イヤホン|音が|音声|サウンド|音量|ミュート)/i.test(text)) return "audio";
  if (/(カメラ|camera|webカメラ|face id|顔認証)/i.test(text)) return "camera";
  if (/(プリンター|印刷|printer)/i.test(text)) return "printer";
  if (/(キーボード|keyboard|マウス|mouse|タッチパッド|touchpad|入力|クリック|usb|周辺機器|外付け)/i.test(text)) return "input";
  if (/(スクリーンショット|画面録画|画面収録|ディスプレイ|明るさ|hdr|night light|夜間モード|外部モニター|画面が|画面を|画面ちらつ|表示が乱れ)/i.test(text)) return "display";
  if (/(サインイン|ログイン|アカウント|パスワード|パスコード|pin|認証|ライセンス|資格情報)/i.test(text)) return "account";
  if (/(ストレージ|空き容量|容量不足|ディスク|バックアップ|同期)/i.test(text)) return "storage";
  if (/(ファイル|フォルダー)/i.test(text) && /(保存|容量|削除|同期|バックアップ|ドライブ|OneDrive|iCloud|Google.?フォト)/i.test(text)) return "storage";
  if (/(更新|アップデート|インストール|ダウンロード|upgrade)/i.test(text)) return "update";
  if (/(権限|許可|プライバシー|ファイアウォール|暗号化|セキュリティ|保護)/i.test(text)) return "security";
  if (/(アプリ|application|microsoft store|google play|word|excel|powerpoint|outlook|teams|line|zoom|slack)/i.test(text)) return "app";
  return "generic";
}

function isSettingActionGuide(setting: Setting, contentType: ContentType): boolean {
  if (contentType === "ERROR_CODE_GUIDE") return false;
  if (/(できない|つながらない|表示されない|見つからない|使えない|動かない|開かない|届かない|出ない|遅い|落ちる|失敗|不具合|対処|ちらつ|白っぽ|暗い|明るくなら|勝手に|繰り返|固ま|フリーズ|反応しない|認識しない|止まる|消える|おかしい|異常|発熱|減り)/.test(setting.title)) return false;
  return /(方法|設定|変更|確認|使う|利用|オン|オフ|有効|無効|許可|接続|追加|削除|固定|保存|選択|作成|登録|解除|撮る|録画|共有|隠す|切り替)/.test(setting.title);
}

function isGenericStepSet(steps: SettingStep[]): boolean {
  const text = steps.map(getStepText).join(" ");
  return GENERIC_STEP_PATTERN.test(text);
}

function preserveStepMetadata(original: SettingStep | undefined, text: string): SettingStep {
  if (!original || typeof original === "string") return text;
  return { ...original, text };
}

function buildMethodSteps(setting: Setting, topic: EditorialTopic): string[] {
  const platform = platformLabel(setting);
  const subject = articleSubject(setting);
  const location = pathLabel(setting);
  if (/スクリーンショット/.test(subject)) {
    const captureTarget = subject.replace(/を撮る$/u, "");
    return [
      `${captureTarget}を撮りたい画面を表示する`,
      `${platform}のスクリーンショット操作を実行する`,
      `保存された画像または表示されたプレビューを開き、目的の画面が写っているか確認する`,
      `必要なら画像を編集・共有し、保存先を確認する`,
      `不要な画像を削除する場合は、対象を間違えていないか確認してから削除する`,
    ];
  }
  if (/(画面録画|画面収録)/.test(subject)) {
    return [
      `録画したい画面を表示し、通知や個人情報が映らない状態にする`,
      `${platform}の画面録画・画面収録を開始する`,
      `必要に応じてマイクや音声の扱いを選び、録画を実行する`,
      `録画を停止し、保存された動画を開いて内容を確認する`,
      `共有する前に、映り込んだ情報と保存先を確認する`,
    ];
  }
  if (topic === "notification") {
    return [
      `「${location}」を開き、${subject}に関係する通知項目を表示する`,
      `通知を受けたいアプリ・機能と、現在の通知状態を確認する`,
      `必要な通知だけをオンまたはオフに変更する`,
      `対象アプリで通知を送る操作を行い、表示や音が反映されるか確認する`,
      `元に戻す場合は同じ画面を開き、変更前の通知状態へ戻す`,
    ];
  }
  if (topic === "battery") {
    return [
      `「${location}」を開き、${subject}に関係する電源・バッテリー項目を表示する`,
      `現在の電池残量・使用状況と、変更による影響を確認する`,
      `対象の省電力・充電・バックグラウンド設定を必要な範囲だけ変更する`,
      `変更後に電池残量や目的の動作が変わったか確認する`,
      `元に戻す場合は同じ項目を開き、変更前の設定へ戻す`,
    ];
  }
  if (topic === "browser") {
    return [
      `${platform}で${subject}に関係するブラウザー設定を開く`,
      `対象サイトや対象機能を確認し、現在の設定値を記録する`,
      `必要な項目だけを変更し、サイトを再読み込みする`,
      `目的のページや機能が正常に動作するか確認する`,
      `元に戻す場合は同じ設定画面で変更前の値へ戻す`,
    ];
  }
  return [
    `「${location}」を開き、${subject}に関係する項目を表示する`,
    `変更前の値と、変更した場合に影響する機能を確認する`,
    `対象項目を変更または実行し、画面の案内に従って必要な確認を行う`,
    `変更後に、${subject}に関係する目的の動作が反映されたか確認する`,
    `元に戻す場合は同じ項目を開き、変更前の値へ戻す`,
  ];
}

function buildTroubleshootingSteps(setting: Setting, topic: EditorialTopic): string[] {
  const subject = articleSubject(setting);
  const location = pathLabel(setting);
  const version = setting.version.trim() || "対象バージョン";
  switch (topic) {
    case "error":
      return [
        `表示された${quotedSubject(subject)}と、発生した画面や操作を記録する`,
        `同じ操作が別の画面・別端末・Web版などでも再現するか確認する`,
        `「${location}」を開き、エラーに関係する接続・権限・空き容量・更新状態を確認する`,
        `変更・再インストール・初期化の前に、必要なデータと復旧方法を確認する`,
        `改善しなければ、記録したコードと環境（${version}・機種・アプリ版）を添えて公式サポートへ相談する`,
      ];
    case "network":
      return [
        `「${subject}」がこの端末だけか、同じネットワークの別端末でも起きるか確認する`,
        `「${location}」を開き、対象のWi-Fi・有線LAN・モバイル通信・VPN・プロキシの状態を確認する`,
        `接続をいったん切断して再接続し、機内モード・ルーター・ケーブルなど対象機器側も確認する`,
        `ネットワーク設定をリセットする前に、保存済みWi-Fi・VPN・APNなど再設定に必要な情報を控える`,
        `改善しなければ別回線や通信会社・管理者・メーカー側の障害と切り分ける`,
      ];
    case "bluetooth":
      return [
        `「${subject}」が起きる機器の電源・充電・距離とペアリング状態を確認する`,
        `「${location}」を開き、BluetoothやAirDropなど対象機能がオンか確認する`,
        `古い登録を削除する前に、必要な接続情報を確認してから機器を再追加する`,
        `別の機器や別の端末でも症状を比較し、OS・ドライバー・機器の更新を確認する`,
        `改善しなければ機器名・OS版・表示された文言を記録してメーカーへ相談する`,
      ];
    case "audio":
      return [
        `${quotedSubject(subject)}が特定のアプリだけか、端末全体で起きるかを比較する`,
        `「${location}」を開き、ミュート・音量・入力または出力先が正しいか確認する`,
        `対象アプリのマイク・音声権限と、アプリごとの音量設定を確認する`,
        `イヤホン・スピーカー・マイクを接続し直し、別の機器でも症状を確認する`,
        `改善しなければアプリ・OS・ドライバーを更新して再起動する`,
      ];
    case "camera":
      return [
        `「${subject}」が起きる端末のレンズ・カバー・接続状態を確認する`,
        `「${location}」を開き、カメラまたは顔認証に必要な権限を確認する`,
        `対象アプリで正しいカメラを選び、別のカメラアプリでも症状を比較する`,
        `他のアプリがカメラを使っていないか確認し、アプリを終了して再起動する`,
        `改善しなければアプリ・OS・カメラドライバーの更新とメーカー案内を確認する`,
      ];
    case "display":
      return [
        `「${subject}」が内蔵画面だけか、外部画面・別アプリでも起きるか比較する`,
        `「${location}」を開き、入力切替・明るさ・表示モード・拡大率を確認する`,
        `ケーブル・アダプター・電源・外部画面の入力先を確認する`,
        `表示ドライバーやOSの更新履歴を確認し、直前の変更があれば記録する`,
        `改善しなければ画面の損傷や機器側の問題と切り分け、メーカーへ相談する`,
      ];
    case "storage":
      return [
        `「${subject}」が起きる場所と、端末・クラウド・外部ドライブのどこで起きるか分ける`,
        `「${location}」を開き、空き容量・同期状態・アクセス権を確認する`,
        `削除や整理の前に、必要なファイルを別の場所へバックアップする`,
        `不要な項目だけを整理し、ごみ箱や同期先にも変更が反映されたか確認する`,
        `改善しなければファイル名・保存場所・サービス側の障害と切り分ける`,
      ];
    case "account":
      return [
        `「${subject}」が端末だけか、Web版・別端末でも起きるか確認する`,
        `「${location}」を開き、アカウント・サインイン状態・サービス障害を確認する`,
        `パスワード・多要素認証・日時設定・アカウントの利用制限を確認する`,
        `古い資格情報を削除する前に、再サインインに必要な情報と同期状態を確認する`,
        `改善しなければ、個人情報を伏せてエラー文と環境を公式サポートまたは管理者へ伝える`,
      ];
    case "browser":
      return [
        `「${subject}」が特定サイトだけか、別サイト・別ブラウザーでも起きるか比較する`,
        `ページを再読み込みし、ブラウザーを更新してシークレットウィンドウでも確認する`,
        `拡張機能・Cookie・キャッシュ・サイト権限・ポップアップ設定を確認する`,
        `ネットワーク・VPN・プロキシ・セキュリティソフトの影響を切り分ける`,
        `閲覧データを削除する前に、必要なログイン情報と同期状態を確認する`,
      ];
    case "printer":
      return [
        `プリンターの電源・用紙・インクまたはトナー・ケーブル接続を確認する`,
        `「${location}」を開き、PCとプリンターが同じネットワークで認識されているか確認する`,
        `既定のプリンターと印刷キューを確認し、停止中のジョブだけを整理する`,
        `テスト印刷を行い、プリンタードライバーとOSの更新を確認する`,
        `改善しなければプリンターの型番・表示文言・接続方法を記録してメーカーへ相談する`,
      ];
    case "input":
      return [
        `入力機器の電源・電池・ケーブル・物理スイッチを確認する`,
        `別のポート・ケーブル・入力機器で症状を比較する`,
        `「${location}」を開き、入力言語・キー設定・権限・デバイス認識を確認する`,
        `ドライバーやOSの更新履歴を確認し、必要なら機器を再接続する`,
        `異常発熱・膨張・破損がある場合は使用を止め、メーカーへ相談する`,
      ];
    case "notification":
      return [
        `「${subject}」が特定のアプリだけか、端末全体で起きるか比較する`,
        `「${location}」を開き、通知・集中モード・おやすみモードの状態を確認する`,
        `対象アプリの通知権限、音量、バックグラウンド動作、省電力設定を確認する`,
        `対象アプリで通知を発生させ、画面・音・バッジのどこまで反映されるか確認する`,
        `改善しなければアプリ・OSを更新し、サービス障害や管理者設定を切り分ける`,
      ];
    case "battery":
      return [
        `「${subject}」が起きた日時と、充電中・通信中・高温時などの条件を記録する`,
        `「${location}」を開き、バッテリー使用量・充電状態・省電力設定を確認する`,
        `不要なバックグラウンド動作や高負荷のアプリを確認し、必要なものだけ設定を見直す`,
        `充電器・ケーブル・端子・本体温度を確認し、異常な発熱や膨張がないか確認する`,
        `改善しなければOS・アプリを更新し、電池の劣化やメーカー案内を確認する`,
      ];
    case "update":
      return [
        `「${subject}」が起きた画面と表示されたコード・更新履歴を記録する`,
        `電源・安定したネットワーク・日時・空き容量・必要な権限を確認する`,
        `対象アプリまたはOSを再起動し、公式の更新トラブルシューティングを確認する`,
        `更新前のバックアップと、失敗した場合に戻す方法を確認してから再試行する`,
        `改善しなければ、記録した環境とコードを添えて公式サポートまたは管理者へ相談する`,
      ];
    case "security":
      return [
        `「${subject}」が起きた画面と、直前に変更した権限・保護設定を記録する`,
        `「${location}」を開き、対象アプリ・アカウント・端末に必要な権限だけを確認する`,
        `保護機能をオフにする前に、代替手段と変更後の影響を確認する`,
        `変更した設定を一つずつ戻し、目的の動作と保護状態を同時に確認する`,
        `会社・学校の端末や不審な警告では、自己判断で回避せず管理者・公式サポートへ相談する`,
      ];
    case "app":
      return [
        `「${subject}」が対象アプリだけか、Web版・別アプリ・別端末でも起きるか比較する`,
        `アプリのサインイン状態・権限・ネットワーク・空き容量を確認する`,
        `アプリとOSを更新し、アプリを終了してから再起動する`,
        `キャッシュ削除や再インストールの前に、保存データと同期状態をバックアップする`,
        `改善しなければアプリ名・版・表示文言・発生条件を記録して提供元へ相談する`,
      ];
    default:
      return [
        `「${subject}」がこの端末だけか、別の端末・アプリでも起きるか確認する`,
        `「${location}」を開き、対象項目の現在値と表示状態を確認する`,
        `直前の更新・アプリ導入・機器接続・設定変更があれば記録する`,
        `変更・削除・リセットの前に、必要なデータと元に戻す方法を確認する`,
        `改善しなければOS・アプリの版と表示文言を記録して公式サポートへ相談する`,
      ];
  }
}

function buildFocusedTroubleshootingSteps(setting: Setting, topic: EditorialTopic): string[] | null {
  const text = searchableText(setting);
  const subject = articleSubject(setting);
  const location = pathLabel(setting);

  if (topic === "network" && /(apn|モバイルデータ|sim|デュアルsim|テザリング|ホットスポット)/i.test(text)) {
    if (/(apn|モバイルデータ|sim|デュアルsim)/i.test(text)) {
      return [
        `「${subject}」がWi-Fiではなくモバイル通信・SIM回線だけで起きるか確認する`,
        `「${location}」を開き、モバイルデータ通信・使用するSIM・機内モードの状態を確認する`,
        `電波表示・データ残量・通信会社の障害と、別の場所での再現を確認する`,
        `APNやキャリア設定を変更する前に、通信会社の案内と現在の値を記録する`,
        `改善しなければSIM・契約・端末の対応状況を通信会社またはメーカーへ相談する`,
      ];
    }
    return [
      `「${subject}」が起きる端末と接続先の組み合わせを確認し、接続台数を減らして比較する`,
      `「${location}」を開き、テザリング・ホットスポット、モバイルデータ、接続パスワードを確認する`,
      `接続先のWi-Fi設定をいったん削除して再接続し、別の端末でも利用できるか確認する`,
      `データ残量・電波状態・省電力・VPNの影響を切り分ける`,
      `改善しなければ通信会社の制限、端末メーカー、接続先の対応条件を確認する`,
    ];
  }
  if (topic === "network" && /(private[- ]?dns|プライベートdns|dns)/i.test(text)) {
    return [
      `「${subject}」が特定のサイトだけか、複数のアプリ・別回線でも起きるか確認する`,
      `「${location}」を開き、DNSの自動設定・指定値・VPN・プロキシの状態を確認する`,
      `DNSを変更する前に、現在の値と会社・学校・回線事業者の指定を記録する`,
      `別のDNSまたは自動設定で一時的に比較し、名前解決と接続の変化を確認する`,
      `改善しなければルーター・回線・DNSサービス側の障害と切り分ける`,
    ];
  }
  if (topic === "bluetooth" && /(airdrop|quick share|クイックシェア|ニアバイシェア)/i.test(text)) {
    return [
      `「${subject}」の送受信相手が近くにいて、両方の端末がロック解除されているか確認する`,
      `「${location}」を開き、Bluetooth・Wi-Fi・機内モードと共有範囲を確認する`,
      `送信側と受信側で表示名・連絡先条件・受信許可を確認してから再送する`,
      `別のファイルや別の相手で比較し、サイズ・形式・空き容量の影響を切り分ける`,
      `改善しなければOS更新、端末間の対応条件、管理者設定を確認する`,
    ];
  }
  if (topic === "display" && /(外部|モニター|ディスプレイ|airplay|sidecar|universal-control|hdr|明るさ|夜間|true-tone)/i.test(text)) {
    return [
      `「${subject}」が内蔵画面だけか、外部ディスプレイ・別アプリでも起きるか比較する`,
      `「${location}」を開き、検出・入力切替・解像度・明るさ・表示モードを確認する`,
      `電源・ケーブル・ハブ・変換アダプターを確認し、可能なら直接接続で比較する`,
      `OS・グラフィックドライバー・ディスプレイ側の更新と対応条件を確認する`,
      `表示設定を初期化する前に現在の配置や色・拡大率を記録し、改善しなければメーカーへ相談する`,
    ];
  }
  if (topic === "storage" && /(写真|photo|icloud|google.?フォト|sdカード|外付け|ディスク|ファイル)/i.test(text)) {
    return [
      `「${subject}」の対象データが端末本体・クラウド・SDカード・外付けドライブのどこにあるか確認する`,
      `「${location}」を開き、空き容量・同期・バックアップ・アクセス権の状態を確認する`,
      `削除・同期解除・初期化の前に、別の端末やWeb版で必要なデータを開けるか確認する`,
      `小さなファイルまたはコピーで保存・同期を試し、対象データ固有の問題か比較する`,
      `改善しなければ保存先・ファイル形式・サービス障害・ドライブの状態を切り分ける`,
    ];
  }
  if (topic === "input" && /(keyboard|キーボード|ime|入力|マウス|mouse|タッチパッド|touchpad|usb|周辺機器)/i.test(text)) {
    return [
      `「${subject}」が対象機器・対象アプリだけか、別の機器や入力欄でも起きるか比較する`,
      `「${location}」を開き、入力言語・配列・権限・デバイス認識の状態を確認する`,
      `電池・ケーブル・ポート・ペアリング・物理スイッチを確認し、別の接続方法で試す`,
      `ドライバー・OS・対象アプリを更新し、変更前の入力設定を記録する`,
      `初期化や登録削除の前に、辞書・割り当て・機器設定の復元方法を確認する`,
    ];
  }
  if (topic === "notification" && /(通知|notification|リマインダー|着信|sms|メッセージ)/i.test(text)) {
    return [
      `「${subject}」が特定のアプリ・連絡先だけか、端末全体で起きるか比較する`,
      `「${location}」を開き、通知権限・サウンド・バッジ・ロック画面の状態を確認する`,
      `集中モード・通知の要約・省電力・バックグラウンド更新の影響を切り分ける`,
      `対象アプリやサービス側で通知を発生させ、画面・音・バッジのどこまで届くか確認する`,
      `通知履歴や設定を消去する前に、重要な通知を見逃さない代替手段を用意する`,
    ];
  }
  if (topic === "battery" && /(充電|charging|バッテリー|電池|発熱|温度)/i.test(text)) {
    return [
      `「${subject}」が充電中・高温時・通信中など、どの条件で起きるか記録する`,
      `「${location}」を開き、使用量・充電状態・温度・省電力設定を確認する`,
      `充電器・ケーブル・端子・ケース・対応規格を確認し、別の組み合わせで比較する`,
      `高負荷アプリ・バックグラウンド動作・画面設定を一つずつ切り分ける`,
      `膨張・異常発熱・破損があれば使用を止め、改善しなければメーカーへ相談する`,
    ];
  }
  return null;
}

function reviewedSteps(setting: Setting, contentType: ContentType, topic: EditorialTopic): { steps: SettingStep[]; changed: boolean; reason?: string } {
  const current = setting.steps.map((step) => getStepText(step).trim()).filter(Boolean);
  const focused = !isSettingActionGuide(setting, contentType) && buildFocusedTroubleshootingSteps(setting, topic);
  if (isGenericStepSet(setting.steps) || focused) {
    const replacement = focused || (isSettingActionGuide(setting, contentType)
      ? buildMethodSteps(setting, topic)
      : buildTroubleshootingSteps(setting, topic));
    return {
      steps: replacement.map((step, index) => preserveStepMetadata(setting.steps[index], step)),
      changed: replacement.join("\u0001") !== current.join("\u0001"),
      reason: focused ? "共有テンプレート手順を記事テーマ別に再構成" : "汎用テンプレート手順を記事テーマ別に再構成",
    };
  }
  if (current.length === 1) {
    const appended = `${isSettingActionGuide(setting, contentType) ? "操作後" : "改善しない場合"}の状態を確認し、必要なら公式サポートへ相談する`;
    return { steps: [...setting.steps, appended], changed: true, reason: "1手順の記事に確認分岐を追加" };
  }
  return { steps: setting.steps, changed: false };
}

function troubleshootingPhrase(topic: EditorialTopic): string {
  switch (topic) {
    case "network": return "端末・別ネットワークとの比較、接続設定、リセット前の情報";
    case "bluetooth": return "機器の状態・ペアリング・再接続・更新";
    case "audio": return "音量・入出力先・権限・接続機器";
    case "camera": return "カメラの状態・権限・アプリ";
    case "display": return "表示条件・接続・ドライバー";
    case "storage": return "保存場所・空き容量・同期状態";
    case "account": return "アカウント状態・認証・サービス障害";
    case "browser": return "別サイト・別ブラウザーとの比較、権限、閲覧データ";
    case "printer": return "電源・接続・印刷キュー・ドライバー";
    case "input": return "電源・接続・入力設定・ドライバー";
    case "notification": return "通知権限・集中モード・バックグラウンド設定";
    case "battery": return "使用状況・充電状態・省電力設定";
    case "update": return "電源・通信・空き容量・更新履歴";
    case "security": return "権限・保護機能・管理ポリシー";
    case "app": return "アプリ・アカウント・権限・通信";
    case "error": return "表示されたコード・画面・発生条件";
    default: return "発生条件と設定状態";
  }
}

function reviewedDescription(setting: Setting, title: string, contentType: ContentType, topic: EditorialTopic): { value: string; changed: boolean; reason?: string } {
  const current = normalizeText(setting.description || "");
  const cleaned = cleanSentence(current);
  const meaningful = current.length >= 24 && !GENERIC_DESCRIPTION_PATTERN.test(current);
  if (meaningful) {
    if (cleaned.length >= 72) return { value: cleaned, changed: cleaned !== current };
    const route = pathLabel(setting);
    const detail = contentType === "ERROR_CODE_GUIDE"
      ? `表示されたコードと発生画面を記録し、「${route}」を順に確認します。`
      : contentType === "TROUBLESHOOTING_GUIDE" && !isSettingActionGuide(setting, contentType)
        ? `「${route}」を確認し、症状の変化を見ながら次の切り分けに進みます。`
        : `「${route}」で設定を確認し、操作後に目的の動作を確かめます。`;
    const value = `${cleaned.replace(/[。．]+$/u, "")}。${detail}`;
    return { value, changed: value !== current, reason: "具体的な既存概要を保持し、確認対象と完了条件を補足" };
  }
  const subject = articleSubject({ ...setting, title });
  const methodGuide = isSettingActionGuide(setting, contentType);
  const value = contentType === "ERROR_CODE_GUIDE"
    ? `${quotedSubject(subject)}が表示されたときに、表示画面・発生した操作・関連するアカウントや接続状態を確認し、原因を切り分ける手順です。`
    : contentType === "TROUBLESHOOTING_GUIDE" && !methodGuide
      ? `「${subject}」で困ったときに、${troubleshootingPhrase(topic)}を順番に確認し、改善しなければ公式サポートへ相談する手順です。`
      : `「${subject}」の設定場所と操作を確認し、変更後に目的の動作が反映されたか確かめる手順です。`;
  return { value, changed: value !== current, reason: "短文・定型文・発生場面テンプレートを記事別の概要へ修正" };
}

function reviewedScope(setting: Setting): { value: string; changed: boolean; reason?: string } {
  const current = normalizeText(setting.device_scope || "");
  const weakScope = /^(?:PC|スマホ|スマートフォン|パソコン|端末|モバイル)$/u.test(current) || current.length < 18;
  const version = setting.version.trim();
  const hasUnlabeledVersion = Boolean(version && /^(?:\d|25H2|Tahoe)/u.test(version) && current.startsWith(version));
  if (current && !DRAFT_SCOPE_PATTERN.test(current) && !weakScope) {
    if (hasUnlabeledVersion) {
      const value = `${versionLabel(setting)}${current.slice(version.length)}`;
      return { value, changed: value !== current, reason: "適用範囲にOS・端末種別を補足" };
    }
    return { value: current, changed: false };
  }
  if (current && DRAFT_SCOPE_PATTERN.test(current)) {
    let value = current
      .replace(/公式情報ベースの下書き候補です。?/g, "一般的な案内です。")
      .replace(/下書き候補です。?/g, "一般的な案内です。")
      .replace(/公開前に.*?確認してください。?/g, "表示名や場所が異なる場合があります。\u3000");
    if (hasUnlabeledVersion) value = `${versionLabel(setting)}${value.slice(version.length)}`;
    return { value: normalizeText(value), changed: value !== current, reason: "公開前候補の内部文言を利用者向けの適用範囲へ修正" };
  }
  return {
    value: `${versionLabel(setting)}を基準にした一般的な案内です。OS・アプリの版、機種・メーカーによって項目名や表示位置が異なる場合があります。`,
    changed: true,
    reason: current ? "短い適用範囲を対象と差異の案内へ補足" : "適用範囲がない記事に対象と差異の案内を追加",
  };
}

function reviewedImpact(setting: Setting, contentType: ContentType, subject: string): { value: string; changed: boolean; reason?: string } {
  const current = normalizeText(setting.impact || "");
  if (current && !GENERIC_IMPACT_PATTERN.test(current)) return { value: current, changed: false };
  const methodGuide = isSettingActionGuide(setting, contentType);
  const value = contentType === "ERROR_CODE_GUIDE"
    ? `${quotedSubject(subject)}の発生条件と表示画面を整理し、対象サービスや設定の切り分けに使います。`
    : contentType === "TROUBLESHOOTING_GUIDE" && !methodGuide
      ? `手順ごとに「${subject}」の変化を確認し、改善しない場合は次の切り分けへ進みます。`
      : `変更後に「${subject}」に関係する動作が目的どおりになったか確認します。`;
  return { value, changed: value !== current, reason: "影響欄を記事の目的と確認方法に修正" };
}

function reviewedRollback(setting: Setting, topic: EditorialTopic): { value: string; changed: boolean; reason?: string } {
  const current = normalizeText(setting.rollback || "");
  if (current && !GENERIC_ROLLBACK_PATTERN.test(current)) return { value: current, changed: false };
  const value = topic === "network"
    ? "変更した接続・VPN・プロキシなどは、記録した変更前の値へ戻します。リセットや再登録の前に、再設定に必要な情報を確認してください。"
    : "変更した項目は同じ画面を開き、記録した変更前の値へ戻します。削除・初期化・サインアウトの前に、バックアップと再設定方法を確認してください。";
  return { value, changed: true, reason: "元に戻す方法を追加" };
}

function reviewedCaution(setting: Setting, contentType: ContentType): { value: string; changed: boolean; reason?: string } {
  const current = normalizeText(setting.caution || "");
  const articleText = searchableText(setting);
  const mismatchedSharedCaution = /^新しいOutlook・クラシックOutlook/u.test(current) && !/outlook/i.test(articleText);
  if (current && !mismatchedSharedCaution) return { value: current, changed: false };
  const methodGuide = isSettingActionGuide(setting, contentType);
  const risk = getArticleRiskLevel(setting);
  if (risk === "data-loss") {
    return { value: "削除・初期化・リセットを行う前に、必要なデータのバックアップと元に戻せる範囲を確認してください。", changed: true, reason: "データ消失の可能性に対する注意を追加" };
  }
  if (risk === "security") {
    return { value: "保護機能や権限を変更する場合は、必要な範囲だけにし、変更後の影響を確認してください。", changed: true, reason: "セキュリティ変更に対する注意を追加" };
  }
  if (risk === "admin") {
    return { value: "管理者権限や組織のポリシーが関係する場合は、会社・学校の端末では管理者に確認してください。", changed: true, reason: "管理者操作に対する注意を追加" };
  }
  if (contentType === "ERROR_CODE_GUIDE") {
    return { value: "エラーコードの確認だけで原因を断定せず、初期化・アカウント削除・保護機能の無効化は公式手順を確認してから行ってください。", changed: true, reason: "エラー記事の危険な近道を防ぐ注意を追加" };
  }
  if (contentType === "TROUBLESHOOTING_GUIDE" && !methodGuide) {
    return { value: "症状が改善したら、残りのリセットや再インストールは行わず、変更した項目を記録して終了してください。", changed: true, reason: "トラブル解決記事の不要な追加操作を防ぐ注意を追加" };
  }
  return { value: "OS・アプリ版や機種によって表示名が異なる場合があります。変更前の値を確認してから操作してください。", changed: true, reason: "設定変更前の確認事項を追加" };
}

function reviewedIfMissing(setting: Setting, contentType: ContentType, subject: string): { value: string; changed: boolean; reason?: string } {
  const current = normalizeText(setting.if_missing || "");
  if (current) return { value: current, changed: false };
  const scope = `${versionLabel(setting)}と異なる版や、機種・メーカーによって項目名や場所が異なることがあります。`;
  const value = contentType === "ERROR_CODE_GUIDE"
    ? `表示された${quotedSubject(subject)}と一致する項目が見つからない場合は、コード・表示文言・発生したアプリを控えて、公式サポートで検索してください。${scope}`
    : `「${subject}」に対応する項目が見つからない場合は、設定画面やアプリ内検索で項目名を探してください。${scope}`;
  return { value, changed: true, reason: "項目が見つからない場合の分岐を追加" };
}

export function reviewArticle(setting: Setting): EditorialReview {
  const contentType = inferContentType(setting);
  const topic = classifyEditorialTopic(setting, contentType);
  const title = cleanTitle(setting.title);
  const stepsResult = reviewedSteps(setting, contentType, topic);
  const descriptionResult = reviewedDescription(setting, title, contentType, topic);
  const scopeResult = reviewedScope(setting);
  const subject = articleSubject({ ...setting, title });
  const impactResult = reviewedImpact(setting, contentType, subject);
  const rollbackResult = reviewedRollback(setting, topic);
  const cautionResult = reviewedCaution(setting, contentType);
  const ifMissingResult = reviewedIfMissing(setting, contentType, subject);
  const changes: Array<[EditorialField, boolean]> = [
    ["title", title !== setting.title],
    ["description", descriptionResult.changed],
    ["steps", stepsResult.changed],
    ["device_scope", scopeResult.changed],
    ["impact", impactResult.changed],
    ["rollback", rollbackResult.changed],
    ["caution", cautionResult.changed],
    ["if_missing", ifMissingResult.changed],
  ];
  const changedFields = changes.filter(([, changed]) => changed).map(([field]) => field);
  const reasons = [
    descriptionResult.reason,
    stepsResult.reason,
    scopeResult.reason,
    impactResult.reason,
    rollbackResult.reason,
    cautionResult.reason,
    ifMissingResult.reason,
  ].filter((reason): reason is string => Boolean(reason));
  const reviewedSetting: Setting = {
    ...setting,
    title,
    description: descriptionResult.value,
    steps: stepsResult.steps,
    device_scope: scopeResult.value,
    impact: impactResult.value,
    rollback: rollbackResult.value,
    caution: cautionResult.value,
    if_missing: ifMissingResult.value,
  };
  return {
    setting: reviewedSetting,
    contentType,
    topic,
    changedFields,
    reasons,
    requiresHumanCheck: Boolean(!setting.source_url || !setting.verified_at || changedFields.includes("steps") || changedFields.includes("title")),
  };
}

export function getReviewedSetting(setting: Setting): Setting {
  return reviewArticle(setting).setting;
}
