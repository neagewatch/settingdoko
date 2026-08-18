// 重点追加パック 第10弾。
// エラーコード・警告文550件、メーカー別200件、アプリ別150件、OS横断100件。
// すべて公開前の下書き候補。エラーコードはタイトル・別名・検索語に含める。
const VERIFIED_AT = "2026-08-17T00:00:00.000Z";
const REVIEW_DUE_AT = "2027-08-17T00:00:00.000Z";

const VERSION = { windows11: "25H2", ios: "26", android: "16", macos: "Tahoe 26" };
const PLATFORM = { windows11: "Windows 11", ios: "iPhone", android: "Android", macos: "Mac" };

const SOURCE = {
  winUpdate: "https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/troubleshoot-problems-updating-windows",
  winTroubleshoot: "https://support.microsoft.com/en-us/support/get-help/running-troubleshooters-in-get-help",
  winSignIn: "https://support.microsoft.com/en-gb/windows/troubleshoot-problems-signing-in-to-windows-298cfd5f-df1f-c66b-36ad-f2a61a73baad",
  winSecurity: "https://support.microsoft.com/en-us/windows/stay-protected-with-windows-security-2ae0363d-0ada-4cda-9b92-3be5e0f4f4c4",
  winNetwork: "https://support.microsoft.com/en-us/windows/fix-wi-fi-connection-issues-in-windows-9424a1f7-6a3b-65a6-4d78-7f07eee84d2c",
  macNetwork: "https://support.apple.com/guide/mac-help/if-you-cant-connect-to-a-wi-fi-network-on-mac-mchlp1185/mac",
  iphoneActivate: "https://support.apple.com/en-gb/109326",
  iphoneRestart: "https://support.apple.com/en-us/116940",
  iphoneApp: "https://support.apple.com/en-us/102632",
  iphoneServices: "https://support.apple.com/en-us/108093",
  iphoneUpdate: "https://support.apple.com/en-us/116940",
  androidPlay: "https://support.google.com/googleplay/answer/14122894?hl=en",
  androidApp: "https://support.google.com/android/answer/2668665?hl=en",
  androidSync: "https://support.google.com/android/answer/9455149?hl=en-GB",
  androidInternet: "https://support.google.com/android/answer/2651367?hl=en-en",
  chromeErrors: "https://support.google.com/chrome/answer/95669?hl=en-GB",
  chromeLoading: "https://support.google.com/chrome/answer/6098869?hl=en",
  outlook: "https://support.microsoft.com/en-us/outlook/issues-sending-and-receiving-email",
  outlookGeneral: "https://support.microsoft.com/en-US/Outlook/outlook-crashes-or-stops-responding-when-used-with-office-365",
  teams: "https://support.microsoft.com/en-US/teams/platform/troubleshoot-in-microsoft-teams",
  excel: "https://support.microsoft.com/en-us/excel/excel-not-responding-hangs-freezes-or-stops-working",
  word: "https://support.microsoft.com/en-US/Word/how-to-troubleshoot-problems-that-occur-when-you-start-or-use-word",
  pixel: "https://support.google.com/pixelphone/",
  galaxy: "https://www.samsung.com/us/support/troubleshooting/",
  aquos: "https://k-tai.sharp.co.jp/support/",
  xperia: "https://www.sony.jp/support/xperia/",
  line: "https://help.line.me/line/smartphone?lang=ja",
  zoom: "https://support.zoom.com/hc/ja",
  slack: "https://slack.com/intl/ja-jp/help",
  discord: "https://support.discord.com/hc/ja",
  gmail: "https://support.google.com/mail/?hl=ja",
  drive: "https://support.google.com/drive/?hl=ja",
  spotify: "https://support.spotify.com/jp/",
};

const ERROR_VARIANTS = [
  { id: "update", label: "更新中", keywords: ["アップデート", "更新"] },
  { id: "install", label: "インストール中", keywords: ["インストール", "セットアップ"] },
  { id: "startup", label: "起動時", keywords: ["起動", "スタート"] },
  { id: "signin", label: "サインイン中", keywords: ["ログイン", "認証"] },
  { id: "network", label: "ネット接続中", keywords: ["ネットワーク", "通信"] },
  { id: "wifi", label: "Wi-Fi接続中", keywords: ["Wi-Fi", "無線"] },
  { id: "app", label: "アプリ利用中", keywords: ["アプリ", "ソフト"] },
  { id: "device-change", label: "機種変更・PC交換後", keywords: ["機種変更", "PC交換"] },
  { id: "storage", label: "容量不足が疑われる場合", keywords: ["ストレージ", "容量不足"] },
  { id: "repeat", label: "何度も繰り返す場合", keywords: ["繰り返す", "再発"] },
];

const MAKER_VARIANTS = [
  { id: "wifi", label: "Wi-Fi接続時", keywords: ["Wi-Fi", "ネットワーク"] },
  { id: "mobile", label: "モバイル通信時", keywords: ["モバイル通信", "4G", "5G"] },
  { id: "update", label: "OS更新後", keywords: ["更新後", "アップデート"] },
  { id: "app", label: "特定アプリ利用時", keywords: ["アプリ", "権限"] },
  { id: "camera", label: "カメラ利用時", keywords: ["カメラ", "撮影"] },
  { id: "audio", label: "音声・通話時", keywords: ["音声", "通話"] },
  { id: "charging", label: "充電中・充電後", keywords: ["充電", "バッテリー"] },
  { id: "account", label: "アカウント変更後", keywords: ["アカウント", "ログイン"] },
  { id: "transfer", label: "機種変更・データ移行後", keywords: ["機種変更", "データ移行"] },
  { id: "repeat", label: "何度も繰り返す場合", keywords: ["再発", "不具合"] },
];

const APP_VARIANTS = [
  { id: "windows", label: "Windows版", keywords: ["Windows", "PC"] },
  { id: "mac", label: "Mac版", keywords: ["Mac", "macOS"] },
  { id: "android", label: "Android版", keywords: ["Android", "スマホ"] },
  { id: "iphone", label: "iPhone版", keywords: ["iPhone", "iOS"] },
  { id: "web", label: "Web版", keywords: ["Web", "ブラウザ"] },
  { id: "update", label: "アプリ更新後", keywords: ["更新後", "バージョン"] },
  { id: "permission", label: "権限設定後", keywords: ["権限", "アクセス許可"] },
  { id: "account", label: "アカウント切り替え後", keywords: ["アカウント", "ログイン"] },
  { id: "network", label: "ネットワーク接続中", keywords: ["ネットワーク", "通信"] },
  { id: "repeat", label: "何度も繰り返す場合", keywords: ["再発", "エラー"] },
];

const STEPS = {
  windowsError: ["表示されたコードを正確にメモし、{focus}で発生した操作を確認する", "PCを再起動し、電源・ネットワーク・日時設定を確認する", "空き容量とWindows Update・関連サービスの状態を確認する", "Windowsの公式トラブルシューティングを実行する", "改善しなければバックアップ後に修復・管理者サポートを検討する"],
  bootError: ["表示された停止コードを撮影し、{focus}の直前に行った変更を確認する", "不要なUSB機器や外付けディスクを外して再起動する", "Windows回復環境のスタートアップ修復を確認する", "最近の更新・ドライバー・アプリの変更を切り分ける", "初期化やドライブ操作はバックアップと公式手順を確認してから行う"],
  iphoneError: ["表示された警告文をそのまま記録し、{focus}で発生したか確認する", "安定したWi-Fi・電源・日時設定を確認する", "iPhoneを再起動し、iOSと対象アプリを更新する", "Appleのシステム状況やApple Accountの状態を確認する", "初期化・復元・カード削除はバックアップと影響を確認してから行う"],
  androidError: ["表示されたコードや警告文を記録し、{focus}で発生したか確認する", "安定したWi-Fi・電源・日時設定・空き容量を確認する", "対象アプリとGoogle Play開発者サービスを更新する", "キャッシュ削除や再起動で症状を比較する", "アカウント削除・初期化はバックアップと公式手順を確認してから行う"],
  appError: ["コード・警告文・発生した画面を記録し、{focus}で再現するか確認する", "Web版・別端末・別アカウントで症状を比較する", "アプリ・OS・ネットワーク・権限・日時設定を確認する", "サインアウト・再起動・更新を順番に試す", "データやプロファイルの削除はバックアップと公式サポートを確認してから行う"],
  maker: ["{focus}で端末の設定名とメーカー独自メニューを確認する", "端末を再起動し、ネットワーク・電源・空き容量を確認する", "メーカー標準アプリと設定で症状を比較する", "OS・メーカーアプリ・通信設定を更新する", "改善しなければメーカー公式サポートと機種名を確認する"],
  app: ["{focus}でWeb版・別端末・別アカウントと症状を比較する", "アプリを終了して開き直し、通知・権限・通信を確認する", "アプリとOSを更新する", "必要ならキャッシュ削除や再ログインを試す", "データ削除・再インストールはバックアップ後に行う"],
  cross: ["{platform}で目的の機能名を設定検索またはメニューから開く", "現在の設定値と変更後の影響を確認する", "必要な権限・通信・アカウント状態を確認する", "変更後に目的の動作を短くテストする", "元に戻す場合は同じ設定を開いて以前の値へ戻す"],
};

function buildSettings({ prefix, os, platform, topics, variants, category = "troubleshoot" }) {
  return topics.flatMap((topic) => (topic.variants || variants).map((variant) => {
    const targetOS = topic.os || os;
    const targetPlatform = topic.platform || platform || PLATFORM[targetOS];
    const title = `${targetPlatform}で${topic.title}（${variant.label}）`;
    const version = topic.version || VERSION[targetOS];
    const steps = (topic.steps || STEPS.app).map((step) => step.replaceAll("{focus}", variant.label).replaceAll("{platform}", targetPlatform));
    return {
      title,
      slug: `${prefix}-${topic.id}-${variant.id}`,
      os: targetOS,
      version,
      category,
      aliases: [`${variant.label}の${topic.alias}`, `${targetPlatform} ${topic.alias}`],
      path: topic.path,
      steps,
      related_slugs: [],
      keywords: [targetPlatform, topic.alias, ...topic.keywords, ...variant.keywords],
      description: `${variant.label}で${topic.alias}が起きたときの確認手順です。`,
      difficulty: topic.difficulty || "beginner",
      estimate_minutes: topic.estimate_minutes || 6,
      verified_at: VERIFIED_AT,
      review_due_at: REVIEW_DUE_AT,
      source_url: topic.source,
      device_scope: `${version}を基準にした一般的な対処です。機種・アプリのバージョン・管理者設定で表示や手順が異なる場合があります。`,
      impact: `${variant.label}の環境を確認し、${topic.alias}の原因を切り分けられる可能性があります。`,
      ...(topic.caution ? { caution: topic.caution } : {}),
      editor_note: "公式サポートを参照して作成した下書き候補です。公開前に実機・アプリ版で表示と手順を確認してください。",
    };
  }));
}

const errorTopics = [
  { id: "0x80070057", title: "エラーコード「0x80070057」が出るときの対処", alias: "0x80070057", path: ["設定", "Windows Update", "トラブルシューティング", "ストレージ"], steps: STEPS.windowsError, keywords: ["0x80070057", "パラメーターが正しくありません"], source: SOURCE.winUpdate },
  { id: "0x80070422", title: "エラーコード「0x80070422」が出るときの対処", alias: "0x80070422", path: ["サービス", "Windows Update", "開始", "自動"], steps: STEPS.windowsError, keywords: ["0x80070422", "サービス停止"], source: SOURCE.winUpdate },
  { id: "0x800f081f", title: "エラーコード「0x800F081F」が出るときの対処", alias: "0x800F081F", path: ["Windows Update", "システムファイル", "コンポーネント"], steps: STEPS.windowsError, keywords: ["0x800F081F", "ソースファイル"], source: SOURCE.winUpdate },
  { id: "0x80073712", title: "エラーコード「0x80073712」が出るときの対処", alias: "0x80073712", path: ["Windows Update", "システムファイル", "修復"], steps: STEPS.windowsError, keywords: ["0x80073712", "破損"], source: SOURCE.winUpdate },
  { id: "0x80246007", title: "エラーコード「0x80246007」が出るときの対処", alias: "0x80246007", path: ["Windows Update", "ダウンロード", "BITS", "サービス"], steps: STEPS.windowsError, keywords: ["0x80246007", "更新ファイル"], source: SOURCE.winUpdate },
  { id: "0x80070002", title: "エラーコード「0x80070002」が出るときの対処", alias: "0x80070002", path: ["Windows Update", "更新履歴", "トラブルシューティング"], steps: STEPS.windowsError, keywords: ["0x80070002", "ファイルが見つからない"], source: SOURCE.winUpdate },
  { id: "0x80070003", title: "エラーコード「0x80070003」が出るときの対処", alias: "0x80070003", path: ["Windows Update", "更新履歴", "ストレージ"], steps: STEPS.windowsError, keywords: ["0x80070003", "パス"], source: SOURCE.winUpdate },
  { id: "0x800f0922", title: "エラーコード「0x800F0922」が出るときの対処", alias: "0x800F0922", path: ["Windows Update", "回復パーティション", "ネットワーク"], steps: STEPS.windowsError, keywords: ["0x800F0922", "更新失敗"], source: SOURCE.winUpdate },
  { id: "0x8007000e", title: "エラーコード「0x8007000E」が出るときの対処", alias: "0x8007000E", path: ["Windows Update", "メモリ", "ストレージ"], steps: STEPS.windowsError, keywords: ["0x8007000E", "メモリ不足"], source: SOURCE.winUpdate },
  { id: "0x800705b4", title: "エラーコード「0x800705B4」が出るときの対処", alias: "0x800705B4", path: ["Windows Update", "タイムアウト", "サービス"], steps: STEPS.windowsError, keywords: ["0x800705B4", "タイムアウト"], source: SOURCE.winUpdate },
  { id: "0x80240034", title: "エラーコード「0x80240034」が出るときの対処", alias: "0x80240034", path: ["Windows Update", "ダウンロード", "再起動"], steps: STEPS.windowsError, keywords: ["0x80240034", "更新が止まる"], source: SOURCE.winUpdate },
  { id: "0x8024402c", title: "エラーコード「0x8024402C」が出るときの対処", alias: "0x8024402C", path: ["Windows Update", "プロキシ", "DNS", "ネットワーク"], steps: STEPS.windowsError, keywords: ["0x8024402C", "プロキシ"], source: SOURCE.winUpdate },
  { id: "0x80072ee2", title: "エラーコード「0x80072EE2」が出るときの対処", alias: "0x80072EE2", path: ["Windows Update", "ネットワーク", "タイムアウト"], steps: STEPS.windowsError, keywords: ["0x80072EE2", "接続タイムアウト"], source: SOURCE.winUpdate },
  { id: "0xc1900101", title: "エラーコード「0xC1900101」が出るときの対処", alias: "0xC1900101", path: ["Windows Update", "ドライバー", "互換性", "外部機器"], steps: STEPS.windowsError, keywords: ["0xC1900101", "ドライバー"], source: SOURCE.winUpdate },
  { id: "0x80070070", title: "エラーコード「0x80070070」が出るときの対処", alias: "0x80070070", path: ["Windows Update", "ストレージ", "空き容量"], steps: STEPS.windowsError, keywords: ["0x80070070", "ディスク容量"], source: SOURCE.winUpdate },
  { id: "0x80070005", title: "エラーコード「0x80070005」が出るときの対処", alias: "0x80070005", path: ["Windows", "アクセス許可", "管理者", "サービス"], steps: STEPS.windowsError, keywords: ["0x80070005", "アクセス拒否"], source: SOURCE.winTroubleshoot },
  { id: "0x80070643", title: "エラーコード「0x80070643」が出るときの対処", alias: "0x80070643", path: ["Windows Update", "インストール", "修復"], steps: STEPS.windowsError, keywords: ["0x80070643", "インストール失敗"], source: SOURCE.winUpdate },
  { id: "0x80070490", title: "エラーコード「0x80070490」が出るときの対処", alias: "0x80070490", path: ["Windows Update", "コンポーネント", "システムファイル"], steps: STEPS.windowsError, keywords: ["0x80070490", "要素が見つからない"], source: SOURCE.winUpdate },
  { id: "0x80070020", title: "エラーコード「0x80070020」が出るときの対処", alias: "0x80070020", path: ["Windows Update", "他のアプリ", "セキュリティソフト"], steps: STEPS.windowsError, keywords: ["0x80070020", "プロセス"], source: SOURCE.winUpdate },
  { id: "0x80072f8f", title: "エラーコード「0x80072F8F」が出るときの対処", alias: "0x80072F8F", path: ["Windows", "日時", "証明書", "ネットワーク"], steps: STEPS.windowsError, keywords: ["0x80072F8F", "日時", "TLS"], source: SOURCE.winUpdate },
  { id: "0x800f0831", title: "エラーコード「0x800F0831」が出るときの対処", alias: "0x800F0831", path: ["Windows Update", "累積更新", "コンポーネント"], steps: STEPS.windowsError, keywords: ["0x800F0831", "累積更新"], source: SOURCE.winUpdate },
  { id: "0x80096005", title: "エラーコード「0x80096005」が出るときの対処", alias: "0x80096005", path: ["Windows", "証明書", "署名", "更新"], steps: STEPS.windowsError, keywords: ["0x80096005", "署名"], source: SOURCE.winTroubleshoot },
  { id: "0x800b0109", title: "エラーコード「0x800B0109」が出るときの対処", alias: "0x800B0109", path: ["Windows", "証明書", "信頼", "更新"], steps: STEPS.windowsError, keywords: ["0x800B0109", "証明書"], source: SOURCE.winTroubleshoot },
  { id: "inaccessible-boot-device", title: "停止コード「INACCESSIBLE_BOOT_DEVICE」が出るときの対処", alias: "INACCESSIBLE_BOOT_DEVICE", path: ["回復環境", "スタートアップ修復", "ドライバー", "ストレージ"], steps: STEPS.bootError, keywords: ["INACCESSIBLE_BOOT_DEVICE", "ブルースクリーン"], source: SOURCE.winTroubleshoot },
  { id: "critical-process-died", title: "停止コード「CRITICAL_PROCESS_DIED」が出るときの対処", alias: "CRITICAL_PROCESS_DIED", path: ["回復環境", "セーフモード", "システムファイル"], steps: STEPS.bootError, keywords: ["CRITICAL_PROCESS_DIED", "ブルースクリーン"], source: SOURCE.winTroubleshoot },
  { id: "iphone-unavailable", title: "警告「iPhoneは使用できません」が出るときの対処", alias: "iPhoneは使用できません", os: "ios", platform: "iPhone", path: ["ロック画面", "パスコード", "セキュリティロックアウト"], steps: STEPS.iphoneError, keywords: ["iPhoneは使用できません", "パスコード"], source: SOURCE.iphoneRestart },
  { id: "security-lockout", title: "警告「セキュリティロックアウト」が出るときの対処", alias: "セキュリティロックアウト", os: "ios", platform: "iPhone", path: ["ロック画面", "セキュリティロックアウト", "Apple Account"], steps: STEPS.iphoneError, keywords: ["セキュリティロックアウト", "パスコード忘れ"], source: SOURCE.iphoneRestart },
  { id: "activation-server", title: "「アクティベーションサーバーに接続できません」が出るときの対処", alias: "アクティベーションサーバーに接続できない", os: "ios", platform: "iPhone", path: ["初期設定", "アクティベーション", "Wi-Fi", "SIM"], steps: STEPS.iphoneError, keywords: ["アクティベーションサーバー", "iPhone初期設定"], source: SOURCE.iphoneActivate },
  { id: "unable-verify-update", title: "「アップデートを検証できません」が出るときの対処", alias: "iPhoneのアップデートを検証できない", os: "ios", platform: "iPhone", path: ["設定", "一般", "ソフトウェアアップデート", "ネットワーク"], steps: STEPS.iphoneError, keywords: ["アップデートを検証できません", "iOS更新"], source: SOURCE.iphoneUpdate },
  { id: "unable-install-app", title: "「アプリをインストールできません」が出るときの対処", alias: "iPhoneアプリをインストールできない", os: "ios", platform: "iPhone", path: ["App Store", "Apple Account", "ストレージ", "支払い方法"], steps: STEPS.iphoneError, keywords: ["アプリをインストールできません", "App Store"], source: SOURCE.iphoneApp },
  { id: "cannot-connect-app-store", title: "「App Storeに接続できません」が出るときの対処", alias: "App Storeに接続できない", os: "ios", platform: "iPhone", path: ["App Store", "Wi-Fi", "Apple Account", "システム状況"], steps: STEPS.iphoneError, keywords: ["App Storeに接続できません", "ストア"], source: SOURCE.iphoneApp },
  { id: "no-sim", title: "警告「SIMなし・不正なSIM」が出るときの対処", alias: "iPhoneのSIMなしエラー", os: "ios", platform: "iPhone", path: ["設定", "モバイル通信", "SIM", "機内モード"], steps: STEPS.iphoneError, keywords: ["SIMなし", "不正なSIM", "圏外"], source: SOURCE.iphoneServices },
  { id: "sos-only", title: "画面に「SOSのみ」と表示されるときの対処", alias: "iPhoneのSOSのみ", os: "ios", platform: "iPhone", path: ["ステータスバー", "機内モード", "モバイル通信", "SIM"], steps: STEPS.iphoneError, keywords: ["SOSのみ", "圏外", "モバイル通信"], source: SOURCE.iphoneServices },
  { id: "apple-logo-stuck", title: "Appleロゴから起動が進まないときの対処", alias: "iPhoneがAppleロゴから進まない", os: "ios", platform: "iPhone", path: ["強制再起動", "充電", "リカバリーモード", "Finder"], steps: STEPS.iphoneError, keywords: ["Appleロゴ", "起動しない", "リカバリーモード"], source: SOURCE.iphoneRestart },
  { id: "icloud-signin", title: "「iCloudにサインインできません」が出るときの対処", alias: "iCloudサインインエラー", os: "ios", platform: "iPhone", path: ["設定", "Apple Account", "iCloud", "日時"], steps: STEPS.iphoneError, keywords: ["iCloud", "サインインエラー", "Apple Account"], source: SOURCE.iphoneServices },
  { id: "play-403", title: "Google Playエラー「403」が出るときの対処", alias: "Google Play 403", os: "android", platform: "Android", path: ["Google Play", "Googleアカウント", "キャッシュ", "ネットワーク"], steps: STEPS.androidError, keywords: ["Google Play", "403", "アプリ"], source: SOURCE.androidPlay },
  { id: "play-492", title: "Google Playエラー「492」が出るときの対処", alias: "Google Play 492", os: "android", platform: "Android", path: ["Google Play", "ストレージ", "キャッシュ", "Googleアカウント"], steps: STEPS.androidError, keywords: ["Google Play", "492", "ダウンロード"], source: SOURCE.androidPlay },
  { id: "play-495", title: "Google Playエラー「495」が出るときの対処", alias: "Google Play 495", os: "android", platform: "Android", path: ["Google Play", "Wi-Fi", "VPN", "キャッシュ"], steps: STEPS.androidError, keywords: ["Google Play", "495", "通信"], source: SOURCE.androidPlay },
  { id: "play-504", title: "Google Playエラー「504」が出るときの対処", alias: "Google Play 504", os: "android", platform: "Android", path: ["Google Play", "ネットワーク", "ストレージ", "更新"], steps: STEPS.androidError, keywords: ["Google Play", "504", "タイムアウト"], source: SOURCE.androidPlay },
  { id: "play-907", title: "Google Playエラー「907」が出るときの対処", alias: "Google Play 907", os: "android", platform: "Android", path: ["Google Play", "SDカード", "ストレージ", "再起動"], steps: STEPS.androidError, keywords: ["Google Play", "907", "インストール"], source: SOURCE.androidPlay },
  { id: "play-910", title: "Google Playエラー「910」が出るときの対処", alias: "Google Play 910", os: "android", platform: "Android", path: ["Google Play", "ストレージ", "Googleアカウント", "更新"], steps: STEPS.androidError, keywords: ["Google Play", "910", "アプリ"], source: SOURCE.androidPlay },
  { id: "app-not-installed", title: "警告「アプリがインストールされていません」が出るときの対処", alias: "Androidアプリがインストールされていない", os: "android", platform: "Android", path: ["設定", "アプリ", "セキュリティ", "ストレージ"], steps: STEPS.androidError, keywords: ["アプリがインストールされていません", "APK"], source: SOURCE.androidApp },
  { id: "system-ui-not-responding", title: "警告「システムUIが応答していません」が出るときの対処", alias: "システムUIが応答していません", os: "android", platform: "Android", path: ["再起動", "セーフモード", "アプリ", "ストレージ"], steps: STEPS.androidError, keywords: ["システムUIが応答していません", "フリーズ"], source: SOURCE.androidApp },
  { id: "not-certified", title: "「デバイスはPlay Protect認定されていません」が出るときの対処", alias: "Play Protect認定されていない", os: "android", platform: "Android", path: ["Google Play", "Play Protect", "端末認証", "更新"], steps: STEPS.androidError, keywords: ["Play Protect", "認定", "Google Play"], source: SOURCE.androidPlay },
  { id: "android-update-error", title: "Androidシステム更新でエラーが出るときの対処", alias: "Androidアップデートエラー", os: "android", platform: "Android", path: ["設定", "システム", "ソフトウェアアップデート", "ストレージ"], steps: STEPS.androidError, keywords: ["Android更新", "アップデートエラー"], source: SOURCE.androidInternet },
  { id: "outlook-0x800ccc0e", title: "Outlookエラー「0x800CCC0E」が出るときの対処", alias: "Outlook 0x800CCC0E", os: "windows11", platform: "Outlook", path: ["Outlook", "アカウント設定", "サーバー", "送受信"], steps: STEPS.appError, keywords: ["Outlook", "0x800CCC0E", "サーバー"], source: SOURCE.outlook },
  { id: "outlook-0x800ccc13", title: "Outlookエラー「0x800CCC13」が出るときの対処", alias: "Outlook 0x800CCC13", os: "windows11", platform: "Outlook", path: ["Outlook", "送受信", "ネットワーク", "Office修復"], steps: STEPS.appError, keywords: ["Outlook", "0x800CCC13", "送受信"], source: SOURCE.outlook },
  { id: "outlook-cannot-start", title: "エラー「Microsoft Outlookを起動できません」が出るときの対処", alias: "Outlookを起動できません", os: "windows11", platform: "Outlook", path: ["Outlook", "セーフモード", "プロファイル", "Office修復"], steps: STEPS.appError, keywords: ["Outlook", "起動できません", "プロファイル"], source: SOURCE.outlookGeneral },
  { id: "teams-401", title: "Teamsエラー「401・サインインが必要」が出るときの対処", alias: "Teams 401", os: "windows11", platform: "Teams", path: ["Teams", "アカウント", "サインアウト", "認証"], steps: STEPS.appError, keywords: ["Teams", "401", "サインイン"], source: SOURCE.teams },
  { id: "teams-camera-blocked", title: "Teamsでカメラがブロックされるときの対処", alias: "Teamsカメラブロック", os: "windows11", platform: "Teams", path: ["Teams", "設定", "デバイス", "カメラ権限"], steps: STEPS.appError, keywords: ["Teams", "カメラ", "ブロック"], source: SOURCE.teams },
  { id: "excel-not-responding", title: "Excelエラー「応答なし」が出るときの対処", alias: "Excel 応答なし", os: "windows11", platform: "Excel", path: ["Excel", "セーフモード", "アドイン", "Office修復"], steps: STEPS.appError, keywords: ["Excel", "応答なし", "固まる"], source: SOURCE.excel },
  { id: "word-not-responding", title: "Wordエラー「応答なし」が出るときの対処", alias: "Word 応答なし", os: "windows11", platform: "Word", path: ["Word", "セーフモード", "テンプレート", "Office修復"], steps: STEPS.appError, keywords: ["Word", "応答なし", "固まる"], source: SOURCE.word },
  { id: "chrome-name-not-resolved", title: "Chromeエラー「ERR_NAME_NOT_RESOLVED」が出るときの対処", alias: "ERR_NAME_NOT_RESOLVED", os: "windows11", platform: "Chrome", path: ["Chrome", "DNS", "ネットワーク", "プロキシ"], steps: STEPS.appError, keywords: ["ERR_NAME_NOT_RESOLVED", "DNS", "サイト開けない"], source: SOURCE.chromeErrors },
  { id: "chrome-connection-reset", title: "Chromeエラー「ERR_CONNECTION_RESET」が出るときの対処", alias: "ERR_CONNECTION_RESET", os: "windows11", platform: "Chrome", path: ["Chrome", "ネットワーク", "VPN", "セキュリティ"], steps: STEPS.appError, keywords: ["ERR_CONNECTION_RESET", "接続リセット"], source: SOURCE.chromeErrors },
  { id: "chrome-connection-timed-out", title: "Chromeエラー「ERR_CONNECTION_TIMED_OUT」が出るときの対処", alias: "ERR_CONNECTION_TIMED_OUT", os: "windows11", platform: "Chrome", path: ["Chrome", "ネットワーク", "DNS", "再読み込み"], steps: STEPS.appError, keywords: ["ERR_CONNECTION_TIMED_OUT", "タイムアウト"], source: SOURCE.chromeErrors },
];

const makerTopics = [
  { id: "pixel-wifi", title: "Wi-Fiがつながらないときの対処", alias: "PixelのWi-Fiがつながらない", platform: "Pixel", path: ["設定", "ネットワークとインターネット", "インターネット", "Wi-Fi"], steps: STEPS.maker, keywords: ["Pixel", "Wi-Fi"], source: SOURCE.pixel },
  { id: "pixel-camera", title: "カメラが起動しない・落ちるときの対処", alias: "Pixelのカメラが使えない", platform: "Pixel", path: ["カメラ", "設定", "アプリ", "権限"], steps: STEPS.maker, keywords: ["Pixel", "カメラ"], source: SOURCE.pixel },
  { id: "pixel-battery", title: "バッテリーが急に減るときの対処", alias: "Pixelの電池が減る", platform: "Pixel", path: ["設定", "バッテリー", "バッテリー使用量", "省電力"], steps: STEPS.maker, keywords: ["Pixel", "バッテリー"], source: SOURCE.pixel },
  { id: "pixel-fingerprint", title: "指紋認証が反応しないときの対処", alias: "Pixelの指紋認証が使えない", platform: "Pixel", path: ["設定", "セキュリティとプライバシー", "デバイスのロック解除", "指紋"], steps: STEPS.maker, keywords: ["Pixel", "指紋認証"], source: SOURCE.pixel },
  { id: "pixel-update", title: "Google Playシステム更新が進まないときの対処", alias: "PixelのPlayシステム更新エラー", platform: "Pixel", path: ["設定", "セキュリティとプライバシー", "システムとアップデート", "Google Play システム更新"], steps: STEPS.maker, keywords: ["Pixel", "Google Playシステム更新"], source: SOURCE.pixel },
  { id: "galaxy-wifi", title: "Wi-Fiがつながらないときの対処", alias: "GalaxyのWi-Fiがつながらない", platform: "Galaxy", path: ["設定", "接続", "Wi-Fi", "インテリジェントWi-Fi"], steps: STEPS.maker, keywords: ["Galaxy", "Wi-Fi"], source: SOURCE.galaxy },
  { id: "galaxy-camera", title: "カメラが起動しない・写真を保存できないときの対処", alias: "Galaxyのカメラが使えない", platform: "Galaxy", path: ["カメラ", "設定", "アプリ", "ストレージ"], steps: STEPS.maker, keywords: ["Galaxy", "カメラ"], source: SOURCE.galaxy },
  { id: "galaxy-battery", title: "バッテリーが急に減るときの対処", alias: "Galaxyの電池が減る", platform: "Galaxy", path: ["設定", "バッテリー", "バッテリーとデバイスケア", "省電力"], steps: STEPS.maker, keywords: ["Galaxy", "バッテリー"], source: SOURCE.galaxy },
  { id: "galaxy-secure-folder", title: "セキュリティフォルダを開けないときの対処", alias: "Galaxyのセキュリティフォルダが開かない", platform: "Galaxy", path: ["設定", "セキュリティとプライバシー", "セキュリティフォルダ", "Samsung Account"], steps: STEPS.maker, keywords: ["Galaxy", "セキュリティフォルダ"], source: SOURCE.galaxy },
  { id: "galaxy-account", title: "Samsung Accountにサインインできないときの対処", alias: "GalaxyのSamsungアカウントに入れない", platform: "Galaxy", path: ["設定", "Samsung account", "アカウント", "認証"], steps: STEPS.maker, keywords: ["Galaxy", "Samsung Account"], source: SOURCE.galaxy },
  { id: "aquos-wifi", title: "Wi-Fiがつながらないときの対処", alias: "AQUOSのWi-Fiがつながらない", platform: "AQUOS", path: ["設定", "ネットワークとインターネット", "Wi-Fi", "保存済みネットワーク"], steps: STEPS.maker, keywords: ["AQUOS", "Wi-Fi"], source: SOURCE.aquos },
  { id: "aquos-camera", title: "カメラが起動しない・画像が保存できないときの対処", alias: "AQUOSのカメラが使えない", platform: "AQUOS", path: ["カメラ", "設定", "アプリ", "ストレージ"], steps: STEPS.maker, keywords: ["AQUOS", "カメラ"], source: SOURCE.aquos },
  { id: "aquos-battery", title: "電池の減りが早いときの対処", alias: "AQUOSの電池が減る", platform: "AQUOS", path: ["設定", "バッテリー", "省エネ", "アプリ"], steps: STEPS.maker, keywords: ["AQUOS", "バッテリー"], source: SOURCE.aquos },
  { id: "aquos-call", title: "通話中に声が聞こえないときの対処", alias: "AQUOSの通話音声が聞こえない", platform: "AQUOS", path: ["電話", "音量", "マイク", "VoLTE"], steps: STEPS.maker, keywords: ["AQUOS", "通話", "VoLTE"], source: SOURCE.aquos },
  { id: "aquos-display", title: "画面が暗い・明るさが勝手に変わるときの対処", alias: "AQUOSの画面が暗い", platform: "AQUOS", path: ["設定", "ディスプレイ", "明るさ", "自動調整"], steps: STEPS.maker, keywords: ["AQUOS", "画面", "明るさ"], source: SOURCE.aquos },
  { id: "xperia-wifi", title: "Wi-Fiが切れるときの対処", alias: "XperiaのWi-Fiが切れる", platform: "Xperia", path: ["設定", "ネットワークとインターネット", "インターネット", "Wi-Fi"], steps: STEPS.maker, keywords: ["Xperia", "Wi-Fi"], source: SOURCE.xperia },
  { id: "xperia-camera", title: "カメラが起動しないときの対処", alias: "Xperiaのカメラが使えない", platform: "Xperia", path: ["カメラ", "設定", "アプリ", "権限"], steps: STEPS.maker, keywords: ["Xperia", "カメラ"], source: SOURCE.xperia },
  { id: "xperia-battery", title: "バッテリーが早く減るときの対処", alias: "Xperiaの電池が減る", platform: "Xperia", path: ["設定", "バッテリー", "STAMINAモード", "アプリ"], steps: STEPS.maker, keywords: ["Xperia", "バッテリー", "STAMINA"], source: SOURCE.xperia },
  { id: "xperia-audio", title: "音が出ない・音量が小さいときの対処", alias: "Xperiaの音が出ない", platform: "Xperia", path: ["設定", "音とバイブレーション", "音量", "出力"], steps: STEPS.maker, keywords: ["Xperia", "音", "スピーカー"], source: SOURCE.xperia },
  { id: "xperia-notification", title: "通知が届かないときの対処", alias: "Xperiaの通知が来ない", platform: "Xperia", path: ["設定", "通知", "アプリ", "バッテリー"], steps: STEPS.maker, keywords: ["Xperia", "通知"], source: SOURCE.xperia },
];

const appTopics = [
  { id: "line-notification", title: "通知が届かないときの対処", alias: "LINEの通知が来ない", platform: "LINE", os: "android", path: ["LINE", "設定", "通知", "端末の通知"], steps: STEPS.app, keywords: ["LINE", "通知"], source: SOURCE.line },
  { id: "line-send", title: "メッセージや画像を送れないときの対処", alias: "LINEが送信できない", platform: "LINE", os: "ios", path: ["LINE", "トーク", "通信", "ストレージ"], steps: STEPS.app, keywords: ["LINE", "送れない", "トーク"], source: SOURCE.line },
  { id: "line-backup", title: "トーク履歴をバックアップできないときの対処", alias: "LINEのトーク履歴をバックアップできない", platform: "LINE", os: "ios", path: ["LINE", "設定", "トーク", "トークのバックアップ"], steps: STEPS.account, keywords: ["LINE", "トーク履歴", "バックアップ"], source: SOURCE.line, caution: "バックアップ完了を確認するまで、LINEの削除や機種変更を行わないでください。" },
  { id: "zoom-camera", title: "カメラが映らないときの対処", alias: "Zoomのカメラが映らない", platform: "Zoom", os: "windows11", path: ["Zoom", "設定", "ビデオ", "カメラ権限"], steps: STEPS.app, keywords: ["Zoom", "カメラ"], source: SOURCE.zoom },
  { id: "zoom-audio", title: "マイク・スピーカーが使えないときの対処", alias: "Zoomの音声が使えない", platform: "Zoom", os: "macos", path: ["Zoom", "設定", "オーディオ", "マイク権限"], steps: STEPS.app, keywords: ["Zoom", "マイク", "スピーカー"], source: SOURCE.zoom },
  { id: "zoom-join", title: "ミーティングに参加できないときの対処", alias: "Zoomに参加できない", platform: "Zoom", os: "ios", path: ["Zoom", "ミーティング", "リンク", "アカウント"], steps: STEPS.app, keywords: ["Zoom", "参加できない", "会議"], source: SOURCE.zoom },
  { id: "slack-notification", title: "通知が届かないときの対処", alias: "Slackの通知が来ない", platform: "Slack", os: "windows11", path: ["Slack", "環境設定", "通知", "Windows通知"], steps: STEPS.app, keywords: ["Slack", "通知"], source: SOURCE.slack },
  { id: "slack-signin", title: "ワークスペースにサインインできないときの対処", alias: "Slackにログインできない", platform: "Slack", os: "android", path: ["Slack", "ワークスペース", "サインイン", "認証"], steps: STEPS.account, keywords: ["Slack", "サインイン", "ワークスペース"], source: SOURCE.slack },
  { id: "discord-mic", title: "マイクが認識されないときの対処", alias: "Discordのマイクが使えない", platform: "Discord", os: "windows11", path: ["Discord", "ユーザー設定", "音声・ビデオ", "マイク権限"], steps: STEPS.app, keywords: ["Discord", "マイク", "音声"], source: SOURCE.discord },
  { id: "discord-notification", title: "通知やメンションが届かないときの対処", alias: "Discordの通知が来ない", platform: "Discord", os: "ios", path: ["Discord", "通知", "サーバー", "端末の通知"], steps: STEPS.app, keywords: ["Discord", "通知", "メンション"], source: SOURCE.discord },
  { id: "gmail-sync", title: "新着メールが届かないときの対処", alias: "Gmailの通知が来ない", platform: "Gmail", os: "android", path: ["Gmail", "設定", "アカウント", "同期"], steps: STEPS.account, keywords: ["Gmail", "メール", "同期"], source: SOURCE.gmail },
  { id: "gmail-search", title: "メール検索で結果が出ないときの対処", alias: "Gmailの検索ができない", platform: "Gmail", os: "windows11", path: ["Gmail", "検索", "フィルタ", "ブラウザ"], steps: STEPS.app, keywords: ["Gmail", "検索"], source: SOURCE.gmail },
  { id: "drive-sync", title: "ファイルが同期されないときの対処", alias: "Googleドライブが同期しない", platform: "Google Drive", os: "android", path: ["Google Drive", "同期", "アカウント", "ストレージ"], steps: STEPS.account, keywords: ["Google Drive", "同期"], source: SOURCE.drive },
  { id: "drive-share", title: "ファイルを共有できないときの対処", alias: "Googleドライブを共有できない", platform: "Google Drive", os: "windows11", path: ["Google Drive", "共有", "アクセス権", "リンク"], steps: STEPS.permission, keywords: ["Google Drive", "共有", "権限"], source: SOURCE.drive },
  { id: "spotify-play", title: "音楽を再生できないときの対処", alias: "Spotifyで音楽が再生できない", platform: "Spotify", os: "ios", path: ["Spotify", "再生", "オフライン", "ストレージ"], steps: STEPS.app, keywords: ["Spotify", "再生できない"], source: SOURCE.spotify },
];

const crossTopics = [
  { id: "screenshot", title: "スクリーンショットを撮る方法", alias: "スクリーンショット", path: ["画面", "スクリーンショット"], keywords: ["スクショ", "画面保存"] },
  { id: "screen-recording", title: "画面録画をする方法", alias: "画面録画", path: ["画面", "録画", "スクリーンレコード"], keywords: ["画面収録", "動画"] },
  { id: "notifications", title: "通知を止める方法", alias: "通知をオフ", path: ["設定", "通知", "集中モード"], keywords: ["通知", "うるさい"] },
  { id: "dark-mode", title: "ダークモードにする方法", alias: "ダークモード", path: ["設定", "画面", "外観", "ダーク"], keywords: ["暗い画面", "ダークテーマ"] },
  { id: "text-size", title: "文字を大きくする方法", alias: "文字サイズ変更", path: ["設定", "アクセシビリティ", "文字サイズ"], keywords: ["文字大きく", "フォントサイズ"] },
  { id: "clipboard", title: "コピーした内容を確認する方法", alias: "クリップボード", path: ["コピー", "貼り付け", "クリップボード"], keywords: ["コピー", "貼り付け"] },
  { id: "file-share", title: "端末間でファイルを送る方法", alias: "ファイル共有", path: ["共有", "Bluetooth", "クラウド", "近距離共有"], keywords: ["写真送る", "ファイル転送"] },
  { id: "battery-save", title: "バッテリーを長持ちさせる方法", alias: "省電力設定", path: ["設定", "バッテリー", "省電力"], keywords: ["電池長持ち", "節電"] },
  { id: "app-permission", title: "アプリのカメラ・マイク権限を確認する方法", alias: "アプリ権限", path: ["設定", "プライバシー", "アプリの権限"], keywords: ["カメラ許可", "マイク許可"] },
  { id: "browser-data", title: "ブラウザのキャッシュ・Cookieを消す方法", alias: "キャッシュ削除", path: ["ブラウザ", "履歴", "Cookie", "キャッシュ"], keywords: ["Cookie削除", "履歴削除"] },
  { id: "do-not-disturb", title: "おやすみ・集中モードを設定する方法", alias: "おやすみモード", path: ["設定", "通知", "集中モード"], keywords: ["集中モード", "サイレント"] },
  { id: "bluetooth", title: "Bluetoothをオン・オフする方法", alias: "Bluetooth設定", path: ["設定", "Bluetooth", "接続済みデバイス"], keywords: ["Bluetoothオン", "イヤホン接続"] },
  { id: "wifi-forget", title: "保存済みWi-Fiを削除する方法", alias: "Wi-Fiを忘れる", path: ["設定", "Wi-Fi", "保存済みネットワーク"], keywords: ["Wi-Fi削除", "パスワード入れ直し"] },
  { id: "hotspot", title: "テザリングを使う方法", alias: "テザリング設定", path: ["設定", "モバイル通信", "インターネット共有"], keywords: ["テザリング", "ホットスポット"] },
  { id: "location", title: "位置情報をオン・オフする方法", alias: "位置情報設定", path: ["設定", "プライバシー", "位置情報"], keywords: ["GPS", "現在地"] },
  { id: "camera", title: "カメラのアクセス許可を変更する方法", alias: "カメラ権限", path: ["設定", "プライバシー", "カメラ"], keywords: ["カメラ許可", "カメラ使えない"] },
  { id: "microphone", title: "マイクのアクセス許可を変更する方法", alias: "マイク権限", path: ["設定", "プライバシー", "マイク"], keywords: ["マイク許可", "マイク使えない"] },
  { id: "default-browser", title: "標準ブラウザを変更する方法", alias: "既定のブラウザ", path: ["設定", "アプリ", "既定のアプリ", "ブラウザ"], keywords: ["標準ブラウザ", "既定ブラウザ"] },
  { id: "auto-update", title: "アプリを自動更新する方法", alias: "アプリ自動更新", path: ["アプリストア", "アカウント", "自動更新"], keywords: ["アップデート", "自動更新"] },
  { id: "password-manager", title: "保存したパスワードを確認する方法", alias: "保存パスワード", path: ["設定", "パスワード", "自動入力"], keywords: ["パスワード確認", "自動入力"] },
  { id: "backup", title: "端末をバックアップする方法", alias: "バックアップ設定", path: ["設定", "アカウント", "バックアップ", "クラウド"], keywords: ["データ保存", "機種変更"] },
  { id: "storage", title: "空き容量を確認する方法", alias: "ストレージ確認", path: ["設定", "ストレージ", "容量"], keywords: ["容量確認", "空き容量"] },
  { id: "font", title: "フォントや表示サイズを変更する方法", alias: "フォント設定", path: ["設定", "画面", "アクセシビリティ", "文字"], keywords: ["フォント", "表示サイズ"] },
  { id: "accessibility", title: "アクセシビリティ機能を探す方法", alias: "アクセシビリティ設定", path: ["設定", "アクセシビリティ"], keywords: ["読み上げ", "拡大", "補助機能"] },
  { id: "time-zone", title: "日時・タイムゾーンを自動設定する方法", alias: "日時の自動設定", path: ["設定", "日時", "時刻", "タイムゾーン"], keywords: ["時計ずれる", "日時設定", "タイムゾーン"] },
];

const CROSS_OS = ["windows11", "ios", "android", "macos"];
const CROSS_SOURCE = { windows11: SOURCE.winTroubleshoot, ios: SOURCE.iphoneServices, android: SOURCE.androidSync, macos: SOURCE.macNetwork };

function buildCrossSettings() {
  return crossTopics.flatMap((topic) => CROSS_OS.map((os) => {
    const platform = PLATFORM[os];
    const version = VERSION[os];
    return {
      title: `${platform}で${topic.title}`,
      slug: `trouble10-cross-${topic.id}-${os}`,
      os,
      version,
      category: "troubleshoot",
      aliases: [`${platform}の${topic.alias}`, topic.alias],
      path: topic.path,
      steps: STEPS.cross.map((step) => step.replaceAll("{platform}", platform)),
      related_slugs: [],
      keywords: [platform, topic.alias, ...topic.keywords],
      description: `${platform}で${topic.alias}を確認する手順です。`,
      difficulty: "beginner",
      estimate_minutes: 5,
      verified_at: VERIFIED_AT,
      review_due_at: REVIEW_DUE_AT,
      source_url: CROSS_SOURCE[os],
      device_scope: `${version}を基準にした一般的な案内です。機種・OSバージョンで表示や手順が異なる場合があります。`,
      impact: `${platform}で${topic.alias}の場所を見つけ、設定を変更できます。`,
      editor_note: "公式サポートを参照して作成したOS横断の下書き候補です。公開前に実機で手順を確認してください。",
    };
  }));
}

const troubleshootingFocusedSettings = [
  ...buildSettings({ prefix: "trouble10-error", os: "windows11", platform: "Windows 11", topics: errorTopics, variants: ERROR_VARIANTS }),
  ...buildSettings({ prefix: "trouble10-maker", os: "android", platform: "Android", topics: makerTopics, variants: MAKER_VARIANTS }),
  ...buildSettings({ prefix: "trouble10-app", os: "windows11", platform: "アプリ", topics: appTopics, variants: APP_VARIANTS }),
  ...buildCrossSettings(),
];

export { troubleshootingFocusedSettings };
