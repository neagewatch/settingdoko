// エラーコード拡張パック。
// 100個のコード・警告文を、検索されやすい10の発生場面に展開した
// 1,000件の下書き候補。公開前に実機・対象バージョンで確認する。
const VERIFIED_AT = "2026-08-17T00:00:00.000Z";
const REVIEW_DUE_AT = "2027-08-17T00:00:00.000Z";

const VERSION = {
  windows11: "25H2",
  ios: "26",
  android: "16",
  macos: "Tahoe 26",
};

const PLATFORM = {
  windows11: "Windows 11",
  ios: "iPhone",
  android: "Android",
  macos: "Mac",
};

const SOURCE = {
  deviceManager: "https://support.microsoft.com/en-US/Windows/Hardware/Drivers/error-codes-in-device-manager-in-windows",
  blueScreen: "https://support.microsoft.com/en-US/windows/resolving-blue-screen-errors-in-windows-60b01860-58f2-be66-7516-5c45a66ae3c6",
  update: "https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/troubleshoot-problems-updating-windows",
  activation: "https://support.microsoft.com/en-us/windows/activate-windows-c39005d4-95ee-b91e-b399-2820b51c7a2c",
  officeActivation: "https://support.microsoft.com/en-us/microsoft-365-activation-licensing/product-key-is-not-valid-error-when-activating-office",
  officePreinstalled: "https://support.microsoft.com/en-us/microsoft-365-activation-licensing/an-error-occurs-when-you-activate-pre-installed-office-on-a-new-pc-0xc004f200",
  outlook: "https://support.microsoft.com/en-us/outlook/issues-sending-and-receiving-email",
  outlookGeneral: "https://support.microsoft.com/en-US/Outlook/outlook-crashes-or-stops-responding-when-used-with-office-365",
  word: "https://support.microsoft.com/en-US/Word/how-to-troubleshoot-problems-that-occur-when-you-start-or-use-word",
  excel: "https://support.microsoft.com/en-us/excel/excel-not-responding-hangs-freezes-or-stops-working",
  iphoneActivation: "https://support.apple.com/en-gb/109326",
  iphoneUpdate: "https://support.apple.com/en-us/116940",
  iphoneServices: "https://support.apple.com/en-us/108093",
  iphoneApp: "https://support.apple.com/en-us/102632",
  androidPlay: "https://support.google.com/googleplay/answer/14122894?hl=en",
  androidApp: "https://support.google.com/googleplay/answer/2668665?hl=en",
  chromeErrors: "https://support.google.com/chrome/answer/95669?hl=en-GB",
  chromeLoading: "https://support.google.com/chrome/answer/6098869?hl=en",
};

const ERROR_VARIANTS = [
  { id: "update", label: "更新時", keywords: ["アップデート", "更新"] },
  { id: "install", label: "インストール時", keywords: ["インストール", "セットアップ"] },
  { id: "startup", label: "起動時", keywords: ["起動", "スタート"] },
  { id: "signin", label: "サインイン時", keywords: ["サインイン", "ログイン", "認証"] },
  { id: "network", label: "ネット接続時", keywords: ["ネットワーク", "通信"] },
  { id: "wifi", label: "Wi-Fi接続時", keywords: ["Wi-Fi", "無線"] },
  { id: "app", label: "アプリ利用時", keywords: ["アプリ", "ソフト"] },
  { id: "transfer", label: "機種変更・PC交換後", keywords: ["機種変更", "データ移行", "PC交換"] },
  { id: "storage", label: "容量不足が疑われるとき", keywords: ["ストレージ", "空き容量"] },
  { id: "repeat", label: "何度も繰り返すとき", keywords: ["再発", "繰り返す"] },
];

const STEPS = {
  deviceManager: [
    "表示されたコードとデバイス名を記録し、{focus}の直前に行った変更を確認する",
    "デバイスを一度取り外せる場合は安全に外し、PCを再起動して再接続する",
    "デバイスマネージャーで対象デバイスを開き、ドライバーの状態と更新日時を確認する",
    "Windows UpdateとPCメーカー・デバイスメーカーの公式ドライバーを確認する",
    "改善しなければ、ロールバック・再インストール・メーカーサポートを順番に検討する",
  ],
  blueScreen: [
    "停止コードを撮影し、{focus}の直前に追加したドライバー・機器・アプリを確認する",
    "不要なUSB機器や外付けディスクを外して再起動し、同じコードが出るか確認する",
    "Windows Updateとデバイスドライバーを更新し、最近の更新が原因なら復元を検討する",
    "起動できない場合はWindows回復環境のセーフモードやスタートアップ修復を確認する",
    "バックアップを取ってから、メモリ・ストレージ診断やメーカーサポートを利用する",
  ],
  windowsError: [
    "コードを大文字・小文字や0xを含めて記録し、{focus}のどの画面で出たか確認する",
    "PCを再起動し、日時・ネットワーク・管理者権限・空き容量を確認する",
    "Windows Update、関連サービス、セキュリティソフトやプロキシの状態を確認する",
    "Windowsの公式トラブルシューティングとシステムファイル修復を順番に試す",
    "改善しなければ、更新前のバックアップを確認して公式サポートへ相談する",
  ],
  activation: [
    "表示されたコードと、Windowsのエディション・プロダクトキーの購入元を確認する",
    "安定したネットワーク、日時、自動時刻、Microsoftアカウントの状態を確認する",
    "設定のシステム・ライセンス認証を開き、トラブルシューティングを実行する",
    "PCを交換・大幅変更した場合は、ライセンスの再認証やエディションの一致を確認する",
    "キーの再入力や初期化を繰り返さず、購入証明を用意してMicrosoftへ相談する",
  ],
  iphone: [
    "表示された警告文をそのまま記録し、{focus}のどの画面で出たか確認する",
    "安定したWi-Fi・電源・日時設定・空き容量を確認し、iPhoneを再起動する",
    "iOSと対象アプリを更新し、Appleのシステム状況で障害がないか確認する",
    "Apple Account・SIM・バックアップ・権限など、警告に関係する設定を確認する",
    "初期化・復元・アカウント削除はバックアップと影響を確認してから行う",
  ],
  android: [
    "表示されたコードや警告文を記録し、{focus}に発生したかを確認する",
    "安定したWi-Fi・電源・日時設定・空き容量を確認して端末を再起動する",
    "対象アプリ、Google Play ストア、Google Play 開発者サービスを更新する",
    "アプリのキャッシュ削除や権限確認を試し、データ削除の前にバックアップする",
    "改善しなければ機種メーカーの手順を確認し、初期化は最後に検討する",
  ],
  office: [
    "エラーコード・警告文・ファイル名を記録し、Officeの製品名とバージョンを確認する",
    "OfficeとWindowsを更新し、PCを再起動して同じファイル・別ファイルで比較する",
    "Microsoftアカウント、ライセンス、保存場所、ネットワーク、空き容量を確認する",
    "Officeの修復、セーフモード、アドイン無効化を公式手順に沿って試す",
    "再インストールやファイル修復の前にバックアップを作り、公式サポートへ相談する",
  ],
  outlook: [
    "コードと送受信のどちらで発生するか、メールアドレス・サーバー名を記録する",
    "ネットワーク、日時、メールボックス容量、パスワード変更の有無を確認する",
    "Web版Outlookで送受信できるかを確認し、アプリ固有の問題か切り分ける",
    "アカウント修復、プロファイルの再作成、Office更新をバックアップ後に試す",
    "メール削除やアカウント再登録を急がず、組織の管理者や公式サポートへ相談する",
  ],
  chrome: [
    "アドレスバーに表示されたエラー文字列を省略せず記録し、他のサイトでも再現するか確認する",
    "シークレットウィンドウ・別ブラウザ・別ネットワークで比較し、拡張機能の影響を切り分ける",
    "Wi-Fi・DNS・プロキシ・VPN・端末の日時を確認し、Chromeを最新版へ更新する",
    "キャッシュ・Cookie、セキュリティソフト、拡張機能を確認して変更前に状態を記録する",
    "証明書警告を無理に回避せず、サイト管理者・ネットワーク管理者へ確認する",
  ],
};

function topic(id, title, alias, os, platform, kind, path, keywords, source, extra = {}) {
  return {
    id,
    title,
    alias,
    os,
    platform,
    kind,
    path,
    keywords,
    source,
    ...extra,
  };
}

const deviceManagerTopics = [
  topic("dm-code-1", "デバイスマネージャー「コード1：このデバイスは正しく構成されていません」", "デバイスマネージャー コード1", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "対象デバイス", "ドライバー"], ["コード1", "Code 1", "正しく構成されていません"], SOURCE.deviceManager),
  topic("dm-code-3", "デバイスマネージャー「コード3：ドライバーが壊れているかメモリ不足」", "デバイスマネージャー コード3", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバー", "メモリ"], ["コード3", "Code 3", "メモリ不足"], SOURCE.deviceManager),
  topic("dm-code-9", "デバイスマネージャー「コード9：無効なデバイスID」", "デバイスマネージャー コード9", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "デバイスID", "ドライバー"], ["コード9", "Code 9", "無効なデバイスID"], SOURCE.deviceManager),
  topic("dm-code-10", "デバイスマネージャー「コード10：このデバイスを開始できません」", "デバイスマネージャー コード10", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "デバイス開始", "ドライバー"], ["コード10", "Code 10", "開始できません"], SOURCE.deviceManager),
  topic("dm-code-14", "デバイスマネージャー「コード14：コンピューターを再起動する必要があります」", "デバイスマネージャー コード14", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "再起動", "ドライバー"], ["コード14", "Code 14", "再起動"], SOURCE.deviceManager),
  topic("dm-code-16", "デバイスマネージャー「コード16：Windowsがすべてのリソースを識別できません」", "デバイスマネージャー コード16", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "リソース", "ハードウェア"], ["コード16", "Code 16", "リソース"], SOURCE.deviceManager),
  topic("dm-code-19", "デバイスマネージャー「コード19：構成情報が不完全または破損しています」", "デバイスマネージャー コード19", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "レジストリ", "構成"], ["コード19", "Code 19", "構成情報"], SOURCE.deviceManager),
  topic("dm-code-24", "デバイスマネージャー「コード24：デバイスが存在しないか正常に動作していません」", "デバイスマネージャー コード24", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "デバイス未接続", "ドライバー"], ["コード24", "Code 24", "デバイスが存在しない"], SOURCE.deviceManager),
  topic("dm-code-28", "デバイスマネージャー「コード28：このデバイスのドライバーがインストールされていません」", "デバイスマネージャー コード28", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバーインストール", "不明なデバイス"], ["コード28", "Code 28", "ドライバーがインストールされていません"], SOURCE.deviceManager),
  topic("dm-code-29", "デバイスマネージャー「コード29：ファームウェアが必要なリソースを提供していません」", "デバイスマネージャー コード29", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ファームウェア", "BIOS"], ["コード29", "Code 29", "ファームウェア"], SOURCE.deviceManager),
  topic("dm-code-31", "デバイスマネージャー「コード31：必要なドライバーを読み込めません」", "デバイスマネージャー コード31", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバー", "デバイスエラー"], ["コード31", "Code 31", "ドライバーを読み込めません"], SOURCE.deviceManager),
  topic("dm-code-32", "デバイスマネージャー「コード32：このデバイスのドライバーが無効になっています」", "デバイスマネージャー コード32", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバー", "無効"], ["コード32", "Code 32", "ドライバーが無効"], SOURCE.deviceManager),
  topic("dm-code-33", "デバイスマネージャー「コード33：デバイスに必要なリソースを判定できません」", "デバイスマネージャー コード33", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "リソース", "ハードウェア"], ["コード33", "Code 33", "リソースを判定できません"], SOURCE.deviceManager),
  topic("dm-code-34", "デバイスマネージャー「コード34：デバイスの設定を判定できません」", "デバイスマネージャー コード34", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "デバイス設定", "リソース"], ["コード34", "Code 34", "設定を判定できません"], SOURCE.deviceManager),
  topic("dm-code-37", "デバイスマネージャー「コード37：ドライバーの初期化に失敗しました」", "デバイスマネージャー コード37", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバー初期化", "デバイス"], ["コード37", "Code 37", "初期化に失敗"], SOURCE.deviceManager),
  topic("dm-code-38", "デバイスマネージャー「コード38：以前のドライバーのインスタンスがメモリに残っています」", "デバイスマネージャー コード38", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバー", "メモリ"], ["コード38", "Code 38", "以前のインスタンス"], SOURCE.deviceManager),
  topic("dm-code-39", "デバイスマネージャー「コード39：ドライバーが破損または見つかりません」", "デバイスマネージャー コード39", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "ドライバー破損", "デバイス"], ["コード39", "Code 39", "ドライバーが破損"], SOURCE.deviceManager),
  topic("dm-code-40", "デバイスマネージャー「コード40：レジストリの情報が無効です」", "デバイスマネージャー コード40", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "レジストリ", "デバイス"], ["コード40", "Code 40", "レジストリ情報"], SOURCE.deviceManager),
  topic("dm-code-43", "デバイスマネージャー「コード43：問題が報告されたため停止しました」", "デバイスマネージャー コード43", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "USB", "グラフィック", "デバイス停止"], ["コード43", "Code 43", "問題が報告されたため停止"], SOURCE.deviceManager),
  topic("dm-code-45", "デバイスマネージャー「コード45：ハードウェアデバイスが接続されていません」", "デバイスマネージャー コード45", "windows11", "Windows 11", "deviceManager", ["デバイスマネージャー", "デバイス未接続", "USB"], ["コード45", "Code 45", "接続されていません"], SOURCE.deviceManager),
];

const blueScreenTopics = [
  topic("bsod-page-fault", "停止コード「PAGE_FAULT_IN_NONPAGED_AREA」が出るときの対処", "PAGE_FAULT_IN_NONPAGED_AREA", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ドライバー", "メモリ"], ["PAGE_FAULT_IN_NONPAGED_AREA", "ページフォールト", "BSOD"], SOURCE.blueScreen),
  topic("bsod-memory-management", "停止コード「MEMORY_MANAGEMENT」が出るときの対処", "MEMORY_MANAGEMENT", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "メモリ診断"], ["MEMORY_MANAGEMENT", "メモリ管理", "BSOD"], SOURCE.blueScreen),
  topic("bsod-system-service", "停止コード「SYSTEM_SERVICE_EXCEPTION」が出るときの対処", "SYSTEM_SERVICE_EXCEPTION", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "システムファイル"], ["SYSTEM_SERVICE_EXCEPTION", "システムサービス例外", "BSOD"], SOURCE.blueScreen),
  topic("bsod-irql", "停止コード「IRQL_NOT_LESS_OR_EQUAL」が出るときの対処", "IRQL_NOT_LESS_OR_EQUAL", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ドライバー"], ["IRQL_NOT_LESS_OR_EQUAL", "IRQL", "BSOD"], SOURCE.blueScreen),
  topic("bsod-kernel-security", "停止コード「KERNEL_SECURITY_CHECK_FAILURE」が出るときの対処", "KERNEL_SECURITY_CHECK_FAILURE", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "カーネル", "ドライバー"], ["KERNEL_SECURITY_CHECK_FAILURE", "カーネルセキュリティ", "BSOD"], SOURCE.blueScreen),
  topic("bsod-driver-irql", "停止コード「DRIVER_IRQL_NOT_LESS_OR_EQUAL」が出るときの対処", "DRIVER_IRQL_NOT_LESS_OR_EQUAL", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ドライバー"], ["DRIVER_IRQL_NOT_LESS_OR_EQUAL", "ドライバー", "BSOD"], SOURCE.blueScreen),
  topic("bsod-dpc-watchdog", "停止コード「DPC_WATCHDOG_VIOLATION」が出るときの対処", "DPC_WATCHDOG_VIOLATION", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ストレージ", "ドライバー"], ["DPC_WATCHDOG_VIOLATION", "DPCウォッチドッグ", "BSOD"], SOURCE.blueScreen),
  topic("bsod-video-tdr", "停止コード「VIDEO_TDR_FAILURE」が出るときの対処", "VIDEO_TDR_FAILURE", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "グラフィックドライバー"], ["VIDEO_TDR_FAILURE", "画面ドライバー", "BSOD"], SOURCE.blueScreen),
  topic("bsod-whea", "停止コード「WHEA_UNCORRECTABLE_ERROR」が出るときの対処", "WHEA_UNCORRECTABLE_ERROR", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ハードウェア"], ["WHEA_UNCORRECTABLE_ERROR", "WHEA", "ハードウェアエラー"], "https://support.microsoft.com/en-us/windows/experience/performance-optimization/how-to-fix-whea-uncorrectable-error"),
  topic("bsod-system-thread", "停止コード「SYSTEM_THREAD_EXCEPTION_NOT_HANDLED」が出るときの対処", "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ドライバー"], ["SYSTEM_THREAD_EXCEPTION_NOT_HANDLED", "システムスレッド", "BSOD"], SOURCE.blueScreen),
  topic("bsod-kmode", "停止コード「KMODE_EXCEPTION_NOT_HANDLED」が出るときの対処", "KMODE_EXCEPTION_NOT_HANDLED", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ドライバー", "メモリ"], ["KMODE_EXCEPTION_NOT_HANDLED", "KMODE", "BSOD"], SOURCE.blueScreen),
  topic("bsod-unexpected-kernel", "停止コード「UNEXPECTED_KERNEL_MODE_TRAP」が出るときの対処", "UNEXPECTED_KERNEL_MODE_TRAP", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "カーネル", "メモリ"], ["UNEXPECTED_KERNEL_MODE_TRAP", "カーネルモードトラップ", "BSOD"], SOURCE.blueScreen),
  topic("bsod-unexpected-store", "停止コード「UNEXPECTED_STORE_EXCEPTION」が出るときの対処", "UNEXPECTED_STORE_EXCEPTION", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "ストレージ"], ["UNEXPECTED_STORE_EXCEPTION", "ストア例外", "BSOD"], SOURCE.blueScreen),
  topic("bsod-bad-system-config", "停止コード「BAD_SYSTEM_CONFIG_INFO」が出るときの対処", "BAD_SYSTEM_CONFIG_INFO", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "起動", "レジストリ"], ["BAD_SYSTEM_CONFIG_INFO", "システム構成", "BSOD"], SOURCE.blueScreen),
  topic("bsod-clock-watchdog", "停止コード「CLOCK_WATCHDOG_TIMEOUT」が出るときの対処", "CLOCK_WATCHDOG_TIMEOUT", "windows11", "Windows 11", "blueScreen", ["ブルースクリーン", "停止コード", "CPU", "ハードウェア"], ["CLOCK_WATCHDOG_TIMEOUT", "クロックウォッチドッグ", "BSOD"], SOURCE.blueScreen),
];

const updateTopics = [
  topic("win-0x8007000d", "Windows更新のエラーコード「0x8007000D」が出るときの対処", "0x8007000D", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "更新ファイル"], ["0x8007000D", "データが無効", "Windows Update"], SOURCE.update),
  topic("win-0x80070570", "Windows更新のエラーコード「0x80070570」が出るときの対処", "0x80070570", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "ファイル"], ["0x80070570", "ファイル破損", "Windows Update"], SOURCE.update),
  topic("win-0x800703ee", "Windows更新のエラーコード「0x800703EE」が出るときの対処", "0x800703EE", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "ファイル"], ["0x800703EE", "ファイル操作", "Windows Update"], SOURCE.update),
  topic("win-0x800f0920", "Windows更新のエラーコード「0x800F0920」が出るときの対処", "0x800F0920", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "更新"], ["0x800F0920", "更新失敗", "Windows Update"], SOURCE.update),
  topic("win-0x800f0988", "Windows更新のエラーコード「0x800F0988」が出るときの対処", "0x800F0988", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "累積更新"], ["0x800F0988", "累積更新", "Windows Update"], SOURCE.update),
  topic("win-0x80240020", "Windows更新のエラーコード「0x80240020」が出るときの対処", "0x80240020", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "再起動"], ["0x80240020", "更新保留", "Windows Update"], SOURCE.update),
  topic("win-0x80240022", "Windows更新のエラーコード「0x80240022」が出るときの対処", "0x80240022", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "更新"], ["0x80240022", "更新ファイル", "Windows Update"], SOURCE.update),
  topic("win-0x8024002e", "Windows更新のエラーコード「0x8024002E」が出るときの対処", "0x8024002E", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "管理ポリシー"], ["0x8024002E", "更新が無効", "Windows Update"], SOURCE.update),
  topic("win-0x80240031", "Windows更新のエラーコード「0x80240031」が出るときの対処", "0x80240031", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "更新"], ["0x80240031", "更新ファイル", "Windows Update"], SOURCE.update),
  topic("win-0x8024200d", "Windows更新のエラーコード「0x8024200D」が出るときの対処", "0x8024200D", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "ダウンロード"], ["0x8024200D", "再ダウンロード", "Windows Update"], SOURCE.update),
  topic("win-0x80244018", "Windows更新のエラーコード「0x80244018」が出るときの対処", "0x80244018", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "プロキシ"], ["0x80244018", "プロキシ", "Windows Update"], SOURCE.update),
  topic("win-0x80244019", "Windows更新のエラーコード「0x80244019」が出るときの対処", "0x80244019", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "サーバー"], ["0x80244019", "サーバー応答", "Windows Update"], SOURCE.update),
  topic("win-0x8024401c", "Windows更新のエラーコード「0x8024401C」が出るときの対処", "0x8024401C", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "接続"], ["0x8024401C", "タイムアウト", "Windows Update"], SOURCE.update),
  topic("win-0x80244022", "Windows更新のエラーコード「0x80244022」が出るときの対処", "0x80244022", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "サーバー"], ["0x80244022", "サーバー過負荷", "Windows Update"], SOURCE.update),
  topic("win-0x80072efe", "Windows更新のエラーコード「0x80072EFE」が出るときの対処", "0x80072EFE", "windows11", "Windows 11", "windowsError", ["Windows Update", "エラーコード", "ネットワーク"], ["0x80072EFE", "接続切断", "Windows Update"], SOURCE.update),
];

const activationTopics = [
  topic("win-0xc004c003", "Windowsライセンス認証のエラーコード「0xC004C003」が出るときの対処", "0xC004C003", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "プロダクトキー"], ["0xC004C003", "キーがブロック", "ライセンス認証"], SOURCE.activation),
  topic("win-0xc004f050", "Windowsライセンス認証のエラーコード「0xC004F050」が出るときの対処", "0xC004F050", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "エディション"], ["0xC004F050", "プロダクトキー", "エディション"], SOURCE.activation),
  topic("win-0xc004f034", "Windowsライセンス認証のエラーコード「0xC004F034」が出るときの対処", "0xC004F034", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "ネットワーク"], ["0xC004F034", "ライセンスサーバー", "ライセンス認証"], SOURCE.activation),
  topic("win-0x803f7001", "Windowsライセンス認証のエラーコード「0x803F7001」が出るときの対処", "0x803F7001", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "Microsoftアカウント"], ["0x803F7001", "デジタルライセンス", "ライセンス認証"], SOURCE.activation),
  topic("win-0x8007232b", "Windowsライセンス認証のエラーコード「0x8007232B」が出るときの対処", "0x8007232B", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "DNS"], ["0x8007232B", "DNS", "KMS", "ライセンス認証"], SOURCE.activation),
  topic("win-0xc004f074", "Windowsライセンス認証のエラーコード「0xC004F074」が出るときの対処", "0xC004F074", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "組織"], ["0xC004F074", "KMS", "組織のライセンス"], SOURCE.activation),
  topic("win-0xc004e016", "Windowsライセンス認証のエラーコード「0xC004E016」が出るときの対処", "0xC004E016", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "プロダクトキー"], ["0xC004E016", "ライセンスキー", "エディション"], SOURCE.activation),
  topic("win-0xc004f211", "Windowsライセンス認証のエラーコード「0xC004F211」が出るときの対処", "0xC004F211", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "ハードウェア変更"], ["0xC004F211", "ハードウェア変更", "デジタルライセンス"], SOURCE.activation),
  topic("win-0x803fa067", "Windowsライセンス認証のエラーコード「0x803FA067」が出るときの対処", "0x803FA067", "windows11", "Windows 11", "activation", ["設定", "システム", "ライセンス認証", "エディション"], ["0x803FA067", "エディション変更", "ライセンス認証"], SOURCE.activation),
  topic("office-0xc004f200", "Officeのライセンス認証エラー「0xC004F200」が出るときの対処", "Office 0xC004F200", "windows11", "Office", "office", ["Office", "アカウント", "ライセンス認証", "プロダクトキー"], ["0xC004F200", "Office", "ライセンス認証"], SOURCE.officePreinstalled),
];

const iphoneTopics = [
  topic("iphone-unable-check-update", "「アップデートを確認できません」が出るときの対処", "iPhone アップデートを確認できない", "ios", "iPhone", "iphone", ["設定", "一般", "ソフトウェアアップデート", "ネットワーク"], ["アップデートを確認できません", "iOS更新", "ソフトウェアアップデート"], SOURCE.iphoneUpdate),
  topic("iphone-unable-install-update", "「アップデートをインストールできません」が出るときの対処", "iPhone アップデートをインストールできない", "ios", "iPhone", "iphone", ["設定", "一般", "ソフトウェアアップデート", "空き容量"], ["アップデートをインストールできません", "iOS更新", "空き容量"], SOURCE.iphoneUpdate),
  topic("iphone-download-update-error", "「iOSのダウンロード中にエラーが起きました」が出るときの対処", "iPhone iOSダウンロードエラー", "ios", "iPhone", "iphone", ["設定", "一般", "ソフトウェアアップデート", "Wi-Fi"], ["iOSのダウンロード中にエラー", "iOS更新", "Wi-Fi"], SOURCE.iphoneUpdate),
  topic("iphone-disabled", "「iPhoneは使用できません。iTunesに接続」が出るときの対処", "iPhoneは使用できません iTunesに接続", "ios", "iPhone", "iphone", ["ロック画面", "パスコード", "iPhoneの復元"], ["iPhoneは使用できません", "iTunesに接続", "パスコード"], SOURCE.iphoneServices),
  topic("iphone-connect-itunes", "「iPhoneをiTunesに接続してください」が出るときの対処", "iPhone iTunesに接続", "ios", "iPhone", "iphone", ["iPhone", "リカバリーモード", "MacまたはWindows"], ["iTunesに接続", "リカバリーモード", "iPhone復元"], SOURCE.iphoneServices),
  topic("iphone-restore-support", "「support.apple.com/iphone/restore」が表示されるときの対処", "support.apple.com/iphone/restore", "ios", "iPhone", "iphone", ["iPhone", "リカバリーモード", "アップデートまたは復元"], ["support.apple.com/iphone/restore", "iPhone復元", "リカバリーモード"], SOURCE.iphoneServices),
  topic("iphone-activation-lock", "「アクティベーションロック」が表示されるときの対処", "iPhone アクティベーションロック", "ios", "iPhone", "iphone", ["初期設定", "Apple Account", "アクティベーションロック"], ["アクティベーションロック", "Activation Lock", "Apple Account"], SOURCE.iphoneActivation),
  topic("iphone-verification-failed", "「確認できませんでした」がApple Accountで出るときの対処", "Apple Account 確認できませんでした", "ios", "iPhone", "iphone", ["設定", "Apple Account", "サインイン", "認証"], ["確認できませんでした", "Apple Account", "認証"], SOURCE.iphoneServices),
  topic("iphone-server-identity", "「サーバーの識別情報を確認できません」が出るときの対処", "iPhone サーバーの識別情報を確認できない", "ios", "iPhone", "iphone", ["メール", "アカウント", "証明書", "日時"], ["サーバーの識別情報を確認できません", "証明書", "メール"], SOURCE.iphoneServices),
  topic("iphone-itunes-store", "「iTunes Storeに接続できません」が出るときの対処", "iPhone iTunes Storeに接続できない", "ios", "iPhone", "iphone", ["App Store", "Apple Account", "ネットワーク"], ["iTunes Storeに接続できません", "App Store", "ネットワーク"], SOURCE.iphoneApp),
];

const androidTopics = [
  topic("play-506", "Google Playのエラー「506」が出るときの対処", "Google Play エラー506", "android", "Android", "android", ["Google Play ストア", "アプリ", "インストール"], ["Google Play 506", "エラー506", "アプリインストール"], SOURCE.androidPlay),
  topic("play-905", "Google Playのエラー「905」が出るときの対処", "Google Play エラー905", "android", "Android", "android", ["Google Play ストア", "ダウンロード", "キャッシュ"], ["Google Play 905", "エラー905", "アプリ更新"], SOURCE.androidPlay),
  topic("play-906", "Google Playのエラー「906」が出るときの対処", "Google Play エラー906", "android", "Android", "android", ["Google Play ストア", "アプリ", "ストレージ"], ["Google Play 906", "エラー906", "アプリインストール"], SOURCE.androidPlay),
  topic("play-919", "Google Playのエラー「919」が出るときの対処", "Google Play エラー919", "android", "Android", "android", ["Google Play ストア", "アプリ", "空き容量"], ["Google Play 919", "エラー919", "空き容量"], SOURCE.androidPlay),
  topic("play-920", "Google Playのエラー「920」が出るときの対処", "Google Play エラー920", "android", "Android", "android", ["Google Play ストア", "アプリ", "アカウント"], ["Google Play 920", "エラー920", "Googleアカウント"], SOURCE.androidPlay),
  topic("play-921", "Google Playのエラー「921」が出るときの対処", "Google Play エラー921", "android", "Android", "android", ["Google Play ストア", "キャッシュ", "ストレージ"], ["Google Play 921", "エラー921", "キャッシュ"], SOURCE.androidPlay),
  topic("play-923", "Google Playのエラー「923」が出るときの対処", "Google Play エラー923", "android", "Android", "android", ["Google Play ストア", "アカウント", "同期"], ["Google Play 923", "エラー923", "アカウント"], SOURCE.androidPlay),
  topic("play-924", "Google Playのエラー「924」が出るときの対処", "Google Play エラー924", "android", "Android", "android", ["Google Play ストア", "アプリ", "更新"], ["Google Play 924", "エラー924", "アプリ更新"], SOURCE.androidPlay),
  topic("play-927", "Google Playのエラー「927」が出るときの対処", "Google Play エラー927", "android", "Android", "android", ["Google Play ストア", "更新", "ダウンロード"], ["Google Play 927", "エラー927", "更新中"], SOURCE.androidPlay),
  topic("play-944", "Google Playのエラー「944」が出るときの対処", "Google Play エラー944", "android", "Android", "android", ["Google Play ストア", "サーバー", "通信"], ["Google Play 944", "エラー944", "サーバー"], SOURCE.androidPlay),
];

const appErrorTopics = [
  topic("outlook-0x800ccc0d", "Outlookのエラー「0x800CCC0D」が出るときの対処", "Outlook 0x800CCC0D", "windows11", "Outlook", "outlook", ["Outlook", "送受信", "サーバー名"], ["0x800CCC0D", "Outlook", "ホストが見つからない"], SOURCE.outlook),
  topic("outlook-0x800ccc67", "Outlookのエラー「0x800CCC67」が出るときの対処", "Outlook 0x800CCC67", "windows11", "Outlook", "outlook", ["Outlook", "送信", "SMTP"], ["0x800CCC67", "Outlook", "送信できない"], SOURCE.outlook),
  topic("outlook-0x800ccc92", "Outlookのエラー「0x800CCC92」が出るときの対処", "Outlook 0x800CCC92", "windows11", "Outlook", "outlook", ["Outlook", "パスワード", "認証"], ["0x800CCC92", "Outlook", "パスワード"], SOURCE.outlook),
  topic("outlook-0x800ccc90", "Outlookのエラー「0x800CCC90」が出るときの対処", "Outlook 0x800CCC90", "windows11", "Outlook", "outlook", ["Outlook", "認証", "アカウント"], ["0x800CCC90", "Outlook", "認証エラー"], SOURCE.outlook),
  topic("outlook-0x8004010f", "Outlookのエラー「0x8004010F」が出るときの対処", "Outlook 0x8004010F", "windows11", "Outlook", "outlook", ["Outlook", "データファイル", "送受信"], ["0x8004010F", "Outlook", "データファイル"], SOURCE.outlookGeneral),
  topic("outlook-0x80040154", "Outlookのエラー「0x80040154」が出るときの対処", "Outlook 0x80040154", "windows11", "Outlook", "outlook", ["Outlook", "プロファイル", "起動"], ["0x80040154", "Outlook", "クラスが登録されていない"], SOURCE.outlookGeneral),
  topic("outlook-0x80040600", "Outlookのエラー「0x80040600」が出るときの対処", "Outlook 0x80040600", "windows11", "Outlook", "outlook", ["Outlook", "データファイル", "修復"], ["0x80040600", "Outlook", "データファイル破損"], SOURCE.outlookGeneral),
  topic("outlook-0x80042108", "Outlookのエラー「0x80042108」が出るときの対処", "Outlook 0x80042108", "windows11", "Outlook", "outlook", ["Outlook", "受信", "POP3", "サーバー"], ["0x80042108", "Outlook", "受信サーバー"], SOURCE.outlook),
  topic("office-unlicensed-product", "Officeの警告「ライセンスのない製品」が出るときの対処", "Office ライセンスのない製品", "windows11", "Office", "office", ["Office", "アカウント", "ライセンス認証"], ["ライセンスのない製品", "Unlicensed Product", "Office"], SOURCE.officeActivation),
  topic("office-product-key-invalid", "Officeの警告「プロダクトキーは無効です」が出るときの対処", "Office プロダクトキーは無効です", "windows11", "Office", "office", ["Office", "プロダクトキー", "ライセンス認証"], ["プロダクトキーは無効です", "Product key is not valid", "Office"], SOURCE.officeActivation),
  topic("office-something-wrong-1001", "Officeのエラー「Something went wrong [1001]」が出るときの対処", "Office Something went wrong 1001", "windows11", "Office", "office", ["Office", "サインイン", "エラー1001"], ["Something went wrong 1001", "Office 1001", "サインイン"], SOURCE.officeActivation),
  topic("office-verify-license", "Officeの警告「ライセンスを確認できません」が出るときの対処", "Office ライセンスを確認できない", "windows11", "Office", "office", ["Office", "アカウント", "ライセンス"], ["ライセンスを確認できません", "Office", "認証"], SOURCE.officeActivation),
  topic("word-cannot-open-document", "Wordの警告「ファイルを開けません」が出るときの対処", "Word ファイルを開けない", "windows11", "Word", "office", ["Word", "ファイル", "保護ビュー", "修復"], ["ファイルを開けません", "Word", "文書"], SOURCE.word),
  topic("excel-unreadable-content", "Excelの警告「読み取れない内容があります」が出るときの対処", "Excel 読み取れない内容があります", "windows11", "Excel", "office", ["Excel", "ファイル", "修復", "ブック"], ["読み取れない内容があります", "Excel", "ブック修復"], SOURCE.excel),
  topic("office-send-command", "Officeのエラー「プログラムにコマンドを送信しているときにエラー」が出るときの対処", "Office プログラムにコマンドを送信中にエラー", "windows11", "Office", "office", ["Office", "Excel", "Word", "ファイル"], ["コマンドを送信しているときにエラー", "Office", "DDE"], SOURCE.word),
  topic("chrome-ssl-protocol", "Chromeのエラー「ERR_SSL_PROTOCOL_ERROR」が出るときの対処", "Chrome ERR_SSL_PROTOCOL_ERROR", "windows11", "Chrome", "chrome", ["Chrome", "SSL", "証明書", "日時"], ["ERR_SSL_PROTOCOL_ERROR", "Chrome", "SSLエラー"], SOURCE.chromeErrors),
  topic("chrome-cert-authority", "Chromeのエラー「NET::ERR_CERT_AUTHORITY_INVALID」が出るときの対処", "Chrome NET::ERR_CERT_AUTHORITY_INVALID", "windows11", "Chrome", "chrome", ["Chrome", "証明書", "安全な接続"], ["NET::ERR_CERT_AUTHORITY_INVALID", "Chrome", "証明書エラー"], SOURCE.chromeErrors),
  topic("chrome-too-many-redirects", "Chromeのエラー「ERR_TOO_MANY_REDIRECTS」が出るときの対処", "Chrome ERR_TOO_MANY_REDIRECTS", "windows11", "Chrome", "chrome", ["Chrome", "Cookie", "リダイレクト", "サイト"], ["ERR_TOO_MANY_REDIRECTS", "Chrome", "リダイレクト"], SOURCE.chromeLoading),
  topic("chrome-blocked-by-client", "Chromeのエラー「ERR_BLOCKED_BY_CLIENT」が出るときの対処", "Chrome ERR_BLOCKED_BY_CLIENT", "windows11", "Chrome", "chrome", ["Chrome", "拡張機能", "広告ブロック"], ["ERR_BLOCKED_BY_CLIENT", "Chrome", "拡張機能"], SOURCE.chromeErrors),
  topic("chrome-dns-nxdomain", "Chromeのエラー「DNS_PROBE_FINISHED_NXDOMAIN」が出るときの対処", "Chrome DNS_PROBE_FINISHED_NXDOMAIN", "windows11", "Chrome", "chrome", ["Chrome", "DNS", "ネットワーク", "ルーター"], ["DNS_PROBE_FINISHED_NXDOMAIN", "Chrome", "DNSエラー"], SOURCE.chromeErrors),
];

const allTopics = [
  ...deviceManagerTopics,
  ...blueScreenTopics,
  ...updateTopics,
  ...activationTopics,
  ...iphoneTopics,
  ...androidTopics,
  ...appErrorTopics,
];

function buildSettings(topics) {
  return topics.flatMap((item) => ERROR_VARIANTS.map((variant) => {
    const version = VERSION[item.os];
    const platform = item.platform || PLATFORM[item.os];
    const steps = STEPS[item.kind].map((step) =>
      step
        .replaceAll("{focus}", variant.label)
        .replaceAll("{platform}", platform)
    );
    return {
      title: platform + "で" + item.title + "（" + variant.label + "）",
      slug: "trouble11-error-" + item.id + "-" + variant.id,
      os: item.os,
      version,
      category: "troubleshoot",
      aliases: [
        variant.label + "の" + item.alias,
        platform + " " + item.alias,
      ],
      path: item.path,
      steps,
      related_slugs: [],
      keywords: [
        platform,
        item.alias,
        "エラーコード",
        "エラー",
        "警告",
        ...item.keywords,
        ...variant.keywords,
      ],
      description: variant.label + "に表示された「" + item.alias + "」の確認手順です。",
      difficulty: item.difficulty || "beginner",
      estimate_minutes: item.estimate_minutes || 7,
      verified_at: VERIFIED_AT,
      review_due_at: REVIEW_DUE_AT,
      source_url: item.source,
      device_scope: VERSION[item.os] + "を基準にした公式情報ベースの下書き候補です。機種・エディション・アプリ版で表示や手順が異なる場合があります。",
      impact: "表示されたコードを手がかりに、" + platform + "の" + variant.label + "の原因を切り分ける入口になります。",
      rollback: "設定やドライバーを変更した場合は、変更前の値・復元ポイント・バックアップを確認してから元に戻します。",
      ...(item.caution ? { caution: item.caution } : {}),
      editor_note: "公式サポートを参照して作成したエラーコード下書き候補です。公開前に実機・対象バージョンで表示と手順を確認してください。",
    };
  }));
}

if (allTopics.length !== 100) {
  throw new Error("エラーコードの基礎テーマ数が想定と異なります: " + allTopics.length);
}

const errorCodeDeepSettings = buildSettings(allTopics);
if (errorCodeDeepSettings.length !== 1000) {
  throw new Error("エラーコード候補件数が想定と異なります: " + errorCodeDeepSettings.length);
}

export { errorCodeDeepSettings };
