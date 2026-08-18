// 高需要エラー拡張パック。
// OneDrive、Windows修復・Store・印刷、Microsoft 365、iPhone、
// Android、ブラウザの実在するコード・警告文100種類を10場面に展開する。
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
  oneDrive: "https://support.microsoft.com/en-US/onedrive/what-do-the-onedrive-error-codes-mean",
  systemRepair: "https://support.microsoft.com/en-us/windows/experience/backup-recovery/use-the-system-file-checker-tool-to-repair-missing-or-corrupted-system-files",
  windowsInstaller: "https://learn.microsoft.com/en-us/windows/win32/msi/windows-installer-error-messages",
  store: "https://support.microsoft.com/en-au/account-billing/fix-problems-with-apps-from-microsoft-store-93ed0bcf-9c12-3df6-6dda-92ec5d0415ac",
  printer: "https://support.microsoft.com/en-us/windows/hardware/printer/fix-printer-connection-and-printing-problems-in-windows",
  m365SignIn: "https://support.microsoft.com/en-us/accounts-billing/work-school/access-work-or-school-troubleshooter-for-restoring-access-to-m365-desktop-applications",
  officeInstall: "https://support.microsoft.com/en-us/office/troubleshoot-installing-office-35ff2def-e0b2-4dac-9784-4cf212c1f6c2",
  outlook: "https://support.microsoft.com/en-us/outlook/issues-sending-and-receiving-email",
  outlookGeneral: "https://support.microsoft.com/en-US/Outlook/outlook-crashes-or-stops-responding-when-used-with-office-365",
  teams: "https://support.microsoft.com/en-US/teams/platform/troubleshoot-in-microsoft-teams",
  excel: "https://support.microsoft.com/en-us/excel/excel-not-responding-hangs-freezes-or-stops-working",
  word: "https://support.microsoft.com/en-US/Word/how-to-troubleshoot-problems-that-occur-when-you-start-or-use-word",
  iphoneBackup: "https://support.apple.com/en-gb/102563",
  iphoneRestore: "https://support.apple.com/en-la/102385",
  iphoneAccount: "https://support.apple.com/en-us/102656",
  iphoneServices: "https://support.apple.com/en-us/108093",
  androidPlayServices: "https://support.google.com/googleplay/answer/9037938?hl=en",
  androidPlay: "https://support.google.com/googleplay/answer/14122894?hl=en",
  androidApp: "https://support.google.com/googleplay/answer/2668665?hl=en",
  chromeErrors: "https://support.google.com/chrome/answer/95669?hl=en-GB",
  chromeLoading: "https://support.google.com/chrome/answer/6098869?hl=en",
  edgeSupport: "https://support.microsoft.com/en-US/edge/what-to-do-if-microsoft-edge-isn-t-working",
};

const VARIANTS = [
  { id: "update", label: "更新時", keywords: ["アップデート", "更新"] },
  { id: "install", label: "インストール時", keywords: ["インストール", "セットアップ"] },
  { id: "startup", label: "起動時", keywords: ["起動", "開かない"] },
  { id: "signin", label: "サインイン時", keywords: ["サインイン", "ログイン", "認証"] },
  { id: "network", label: "ネット接続時", keywords: ["ネットワーク", "通信"] },
  { id: "wifi", label: "Wi-Fi接続時", keywords: ["Wi-Fi", "無線"] },
  { id: "app", label: "アプリ利用時", keywords: ["アプリ", "ソフト"] },
  { id: "transfer", label: "機種変更・PC交換後", keywords: ["機種変更", "データ移行", "PC交換"] },
  { id: "storage", label: "容量不足が疑われるとき", keywords: ["ストレージ", "空き容量"] },
  { id: "repeat", label: "何度も繰り返すとき", keywords: ["再発", "繰り返す"] },
];

const STEPS = {
  oneDrive: [
    "表示されたコードを省略せず記録し、{focus}に発生したかを確認する",
    "OneDrive.comを開けるか確認し、Microsoftアカウントとサービス障害を切り分ける",
    "OneDrive・Windows・Officeを更新し、PCを再起動して同期状態を確認する",
    "アカウント、Files On-Demand、空き容量、ファイル名・パス長、権限を確認する",
    "リセット・リンク解除・再インストールはファイルがオンラインにあることを確認してから行う",
  ],
  systemRepair: [
    "表示されたコードや修復結果を保存し、{focus}の直前に行った変更を確認する",
    "重要なファイルをバックアップし、管理者としてターミナルまたはコマンドプロンプトを開く",
    "DISMやSFCは公式手順の順番と完了メッセージを確認しながら実行する",
    "PCを再起動して、Windows Update・対象機能・アプリの状態を再確認する",
    "改善しなければログとコードを保存し、初期化やレジストリ変更は専門サポートへ相談する",
  ],
  installer: [
    "インストーラーのコードとアプリ名を記録し、{focus}のどの段階で止まるか確認する",
    "PCを再起動し、管理者権限・空き容量・Windows Update・セキュリティソフトを確認する",
    "同じアプリの古い版や別のインストーラーが残っていないか確認する",
    "公式の修復・アンインストール・再インストール手順を、バックアップ後に試す",
    "企業PCでは管理者ポリシーを変更せず、管理者またはアプリ提供元へ確認する",
  ],
  store: [
    "Microsoft Storeのコードとアプリ名を記録し、{focus}のどの画面で出るか確認する",
    "Microsoftアカウント、日時、ネットワーク、空き容量、Windows Updateを確認する",
    "Storeを閉じて再起動し、Storeのライブラリから更新を確認する",
    "Windowsのアプリ設定からMicrosoft Storeの修復・リセットを順番に試す",
    "アプリのデータ削除やアカウント変更は、保存データと購入情報を確認してから行う",
  ],
  printer: [
    "表示されたコード・印刷キューの状態・プリンター機種を記録する",
    "電源、用紙、インク、紙詰まり、USB・Wi-Fi接続を確認してテスト印刷する",
    "設定のBluetoothとデバイス・プリンターとスキャナーで既定の機器を確認する",
    "印刷キューを空にし、Print Spoolerとプリンタードライバーを公式手順で確認する",
    "ドライバー削除や再追加の前に、メーカー・接続方式・ネットワークを確認する",
  ],
  m365: [
    "表示されたコード・画面・アプリ名を記録し、{focus}に発生したか確認する",
    "Microsoft 365のサービス状態、アカウント種別、ネットワーク、日時を確認する",
    "Web版または別のOfficeアプリでサインインできるかを確認する",
    "Office・Teams・OneDrive・Windowsを更新し、必要なら公式トラブルシューティングを実行する",
    "資格情報削除やプロファイル再作成は、メール・同期・保存データを確認してから行う",
  ],
  outlook: [
    "コードと送受信のどちらで起きるか、アカウント・サーバー・発生時刻を記録する",
    "Web版Outlookで同じ操作を試し、メールボックス容量とサービス状態を確認する",
    "ネットワーク、日時、パスワード変更、セキュリティソフト、添付ファイルを確認する",
    "Outlookのアカウント修復、Office更新、プロファイル修復を順番に試す",
    "データファイル削除やアカウント再登録はバックアップ後に管理者・公式サポートへ相談する",
  ],
  iphoneCloud: [
    "表示された警告文をそのまま記録し、{focus}のどの画面で出たか確認する",
    "安定したWi-Fi・電源・日時・空き容量を確認し、iPhoneを再起動する",
    "Apple Account、iCloudストレージ、iOS、Appleのシステム状況を確認する",
    "バックアップ・復元・同期をやり直す前に、別端末やiCloud.comでデータの有無を確認する",
    "サインアウト・初期化・バックアップ削除は、復元手段を確認してから行う",
  ],
  androidPlay: [
    "コードや警告文をそのまま記録し、{focus}に発生したか確認する",
    "Wi-Fi・日時・空き容量・Googleアカウント・端末認証を確認して再起動する",
    "Google Play ストア、Google Play 開発者サービス、Android System WebViewを更新する",
    "アプリと関連サービスのキャッシュ削除を試し、データ削除前にアカウントを確認する",
    "改善しなければ端末メーカーの手順を確認し、初期化は最後に検討する",
  ],
  browser: [
    "アドレスバーのエラー文字列を省略せず記録し、他のサイト・ブラウザでも比較する",
    "シークレットウィンドウ、別ネットワーク、別端末で再現するか確認する",
    "DNS・VPN・プロキシ・日時・セキュリティソフト・拡張機能の影響を確認する",
    "ブラウザを更新し、キャッシュ・Cookieを変更前に記録してから確認する",
    "証明書警告を無理に回避せず、サイト管理者またはネットワーク管理者へ相談する",
  ],
};

function topic(id, title, alias, os, platform, kind, path, keywords, source, extra = {}) {
  return { id, title, alias, os, platform, kind, path, keywords, source, ...extra };
}

const oneDriveTopics = [
  topic("onedrive-0x8004de85", "OneDriveのエラーコード「0x8004DE85」が出るときの対処", "OneDrive 0x8004DE85", "windows11", "OneDrive", "oneDrive", ["OneDrive", "アカウント", "サインイン"], ["0x8004DE85", "OneDrive", "アカウント"], SOURCE.oneDrive),
  topic("onedrive-0x8004de8a", "OneDriveのエラーコード「0x8004DE8A」が出るときの対処", "OneDrive 0x8004DE8A", "windows11", "OneDrive", "oneDrive", ["OneDrive", "アカウント", "個人・職場"], ["0x8004DE8A", "OneDrive", "アカウント不一致"], SOURCE.oneDrive),
  topic("onedrive-0x8004ded2", "OneDriveのエラーコード「0x8004DED2」が出るときの対処", "OneDrive 0x8004DED2", "windows11", "OneDrive", "oneDrive", ["OneDrive", "職場または学校", "組織"], ["0x8004DED2", "OneDrive", "組織アカウント"], SOURCE.oneDrive),
  topic("onedrive-0x8004de40", "OneDriveのエラーコード「0x8004DE40」が出るときの対処", "OneDrive 0x8004DE40", "windows11", "OneDrive", "oneDrive", ["OneDrive", "サインイン", "ネットワーク"], ["0x8004DE40", "OneDrive", "接続"], SOURCE.oneDrive),
  topic("onedrive-0x8004de42", "OneDriveのエラーコード「0x8004DE42」が出るときの対処", "OneDrive 0x8004DE42", "windows11", "OneDrive", "oneDrive", ["OneDrive", "プロキシ", "認証"], ["0x8004DE42", "OneDrive", "プロキシ"], SOURCE.oneDrive),
  topic("onedrive-0x8004de44", "OneDriveのエラーコード「0x8004DE44」が出るときの対処", "OneDrive 0x8004DE44", "windows11", "OneDrive", "oneDrive", ["OneDrive", "サインイン", "プロキシ"], ["0x8004DE44", "OneDrive", "認証"], SOURCE.oneDrive),
  topic("onedrive-0x8004de80", "OneDriveのエラーコード「0x8004DE80」が出るときの対処", "OneDrive 0x8004DE80", "windows11", "OneDrive", "oneDrive", ["OneDrive", "再インストール", "アカウント"], ["0x8004DE80", "OneDrive", "再インストール"], SOURCE.oneDrive),
  topic("onedrive-0x8004de86", "OneDriveのエラーコード「0x8004DE86」が出るときの対処", "OneDrive 0x8004DE86", "windows11", "OneDrive", "oneDrive", ["OneDrive", "再インストール", "同期"], ["0x8004DE86", "OneDrive", "同期"], SOURCE.oneDrive),
  topic("onedrive-0x8004de90", "OneDriveのエラーコード「0x8004DE90」が出るときの対処", "OneDrive 0x8004DE90", "windows11", "OneDrive", "oneDrive", ["OneDrive", "初期設定", "サインイン"], ["0x8004DE90", "OneDrive", "セットアップ"], SOURCE.oneDrive),
  topic("onedrive-0x8004de96", "OneDriveのエラーコード「0x8004DE96」が出るときの対処", "OneDrive 0x8004DE96", "windows11", "OneDrive", "oneDrive", ["OneDrive", "パスワード変更", "アカウント"], ["0x8004DE96", "OneDrive", "パスワード"], SOURCE.oneDrive),
  topic("onedrive-0x8004dea3", "OneDriveのエラーコード「0x8004DEA3」が出るときの対処", "OneDrive 0x8004DEA3", "windows11", "OneDrive", "oneDrive", ["OneDrive", "システムファイル", "SFC"], ["0x8004DEA3", "OneDrive", "システムファイル"], SOURCE.oneDrive),
  topic("onedrive-0x8004deb4", "OneDriveのエラーコード「0x8004DEB4」が出るときの対処", "OneDrive 0x8004DEB4", "windows11", "OneDrive", "oneDrive", ["OneDrive", "サインイン", "アカウント"], ["0x8004DEB4", "OneDrive", "ログイン"], SOURCE.oneDrive),
  topic("onedrive-0x8004def0", "OneDriveのエラーコード「0x8004DEF0」が出るときの対処", "OneDrive 0x8004DEF0", "windows11", "OneDrive", "oneDrive", ["OneDrive", "資格情報", "パスワード"], ["0x8004DEF0", "OneDrive", "資格情報"], SOURCE.oneDrive),
  topic("onedrive-0x8004def1", "OneDriveのエラーコード「0x8004DEF1」が出るときの対処", "OneDrive 0x8004DEF1", "windows11", "OneDrive", "oneDrive", ["OneDrive", "更新", "バージョン"], ["0x8004DEF1", "OneDrive", "更新が必要"], SOURCE.oneDrive),
  topic("onedrive-0x8004def4", "OneDriveのエラーコード「0x8004DEF4」が出るときの対処", "OneDrive 0x8004DEF4", "windows11", "OneDrive", "oneDrive", ["OneDrive", "アプリ競合", "再インストール"], ["0x8004DEF4", "OneDrive", "Storeアプリ"], SOURCE.oneDrive),
  topic("onedrive-0x8004def5", "OneDriveのエラーコード「0x8004DEF5」が出るときの対処", "OneDrive 0x8004DEF5", "windows11", "OneDrive", "oneDrive", ["OneDrive", "サインイン", "資格情報"], ["0x8004DEF5", "OneDrive", "認証"], SOURCE.oneDrive),
  topic("onedrive-0x8004def7", "OneDriveのエラーコード「0x8004DEF7」が出るときの対処", "OneDrive 0x8004DEF7", "windows11", "OneDrive", "oneDrive", ["OneDrive", "容量", "アカウント"], ["0x8004DEF7", "OneDrive", "容量超過"], SOURCE.oneDrive),
  topic("onedrive-0x8004e4f1", "OneDriveのエラーコード「0x8004E4F1」が出るときの対処", "OneDrive 0x8004E4F1", "windows11", "OneDrive", "oneDrive", ["OneDrive", "設定", "画面"], ["0x8004E4F1", "OneDrive", "設定が開かない"], SOURCE.oneDrive),
  topic("onedrive-0x80048823", "OneDriveのエラーコード「0x80048823」が出るときの対処", "OneDrive 0x80048823", "windows11", "OneDrive", "oneDrive", ["OneDrive", "プロキシ", "サインイン"], ["0x80048823", "OneDrive", "プロキシ認証"], SOURCE.oneDrive),
  topic("onedrive-0x80049d61", "OneDriveのエラーコード「0x80049D61」が出るときの対処", "OneDrive 0x80049D61", "windows11", "OneDrive", "oneDrive", ["OneDrive", "Storeアプリ", "起動"], ["0x80049D61", "OneDrive", "起動できない"], SOURCE.oneDrive),
  topic("onedrive-0x8007016a", "OneDriveのエラーコード「0x8007016A」が出るときの対処", "OneDrive 0x8007016A", "windows11", "OneDrive", "oneDrive", ["OneDrive", "Files On-Demand", "同期"], ["0x8007016A", "OneDrive", "ファイルオンデマンド"], SOURCE.oneDrive),
  topic("onedrive-0x8007018b", "OneDriveのエラーコード「0x8007018B」が出るときの対処", "OneDrive 0x8007018B", "windows11", "OneDrive", "oneDrive", ["OneDrive", "ファイル", "使用中"], ["0x8007018B", "OneDrive", "ファイルを移動できない"], SOURCE.oneDrive),
  topic("onedrive-0x80070194", "OneDriveのエラーコード「0x80070194」が出るときの対処", "OneDrive 0x80070194", "windows11", "OneDrive", "oneDrive", ["OneDrive", "リセット", "同期"], ["0x80070194", "OneDrive", "同期リセット"], SOURCE.oneDrive),
  topic("onedrive-0x80071128", "OneDriveのエラーコード「0x80071128」が出るときの対処", "OneDrive 0x80071128", "windows11", "OneDrive", "oneDrive", ["OneDrive", "ファイルシステム", "chkdsk"], ["0x80071128", "OneDrive", "reparse point"], SOURCE.oneDrive, { caution: "chkdskは時間がかかる場合があり、対象ドライブとバックアップを確認してから実行してください。" }),
  topic("onedrive-0x80010007", "OneDriveのエラーコード「0x80010007」が出るときの対処", "OneDrive 0x80010007", "windows11", "OneDrive", "oneDrive", ["OneDrive", "同期", "アカウント"], ["0x80010007", "OneDrive", "同期できない"], SOURCE.oneDrive),
  topic("onedrive-0x80040c81", "OneDriveのエラーコード「0x80040C81」が出るときの対処", "OneDrive 0x80040C81", "windows11", "OneDrive", "oneDrive", ["OneDrive", "接続", "ネットワーク"], ["0x80040C81", "OneDrive", "クラウド接続"], SOURCE.oneDrive),
];

const windowsTopics = [
  topic("sfc-not-found", "SFCの結果「Windows Resource Protection did not find any integrity violations」が出るときの確認", "SFC 整合性違反が見つからない", "windows11", "Windows 11", "systemRepair", ["ターミナル", "SFC", "システムファイル"], ["SFC", "整合性違反なし", "システムファイル"], SOURCE.systemRepair),
  topic("sfc-could-not-fix", "SFCの結果「Windows Resource Protection found corrupt files but was unable to fix some」が出るときの対処", "SFC 破損ファイルを修復できない", "windows11", "Windows 11", "systemRepair", ["ターミナル", "DISM", "SFC", "修復"], ["SFC", "修復できない", "破損ファイル"], SOURCE.systemRepair),
  topic("sfc-could-not-start", "SFCの結果「Windows Resource Protection could not start the repair service」が出るときの対処", "SFC 修復サービスを開始できない", "windows11", "Windows 11", "systemRepair", ["ターミナル", "SFC", "Windows Modules Installer"], ["SFC", "修復サービス", "TrustedInstaller"], SOURCE.systemRepair),
  topic("dism-error-87", "DISMのエラー「Error: 87」が出るときの対処", "DISM Error 87", "windows11", "Windows 11", "systemRepair", ["ターミナル", "DISM", "コマンド"], ["DISM", "Error 87", "コマンド構文"], SOURCE.systemRepair),
  topic("dism-source-not-found", "DISMのエラー「The source files could not be found」が出るときの対処", "DISM source files could not be found", "windows11", "Windows 11", "systemRepair", ["ターミナル", "DISM", "修復ソース"], ["DISM", "source files", "修復ソース"], SOURCE.systemRepair),
  topic("optional-feature-0x800f0954", "Windows機能追加のエラー「0x800F0954」が出るときの対処", "Windows 0x800F0954", "windows11", "Windows 11", "systemRepair", ["Windowsの機能", "オプション機能", "Windows Update"], ["0x800F0954", "オプション機能", "WSUS"], SOURCE.systemRepair),
  topic("installer-1603", "Windows Installerのエラー「1603」が出るときの対処", "Windows Installer 1603", "windows11", "Windows Installer", "installer", ["Windows Installer", "インストール", "権限"], ["MSI 1603", "1603", "致命的なエラー"], SOURCE.windowsInstaller),
  topic("installer-1618", "Windows Installerのエラー「1618：別のインストールが進行中です」が出るときの対処", "Windows Installer 1618", "windows11", "Windows Installer", "installer", ["Windows Installer", "インストール", "タスクマネージャー"], ["MSI 1618", "1618", "別のインストール"], SOURCE.windowsInstaller),
  topic("installer-1601", "Windows Installerのエラー「1601：Windows Installerサービスにアクセスできません」が出るときの対処", "Windows Installer 1601", "windows11", "Windows Installer", "installer", ["Windows Installer", "サービス", "Windows Installer"], ["MSI 1601", "1601", "Installerサービス"], SOURCE.windowsInstaller),
  topic("installer-1612", "Windows Installerのエラー「1612：インストール元が利用できません」が出るときの対処", "Windows Installer 1612", "windows11", "Windows Installer", "installer", ["Windows Installer", "インストール元", "修復"], ["MSI 1612", "1612", "インストール元"], SOURCE.windowsInstaller),
  topic("installer-1706", "Windows Installerのエラー「1706：必要なファイルが見つかりません」が出るときの対処", "Windows Installer 1706", "windows11", "Windows Installer", "installer", ["Windows Installer", "Office", "インストール元"], ["MSI 1706", "1706", "ファイルが見つからない"], SOURCE.windowsInstaller),
  topic("installer-1722", "Windows Installerのエラー「1722：プログラムの実行中に問題が発生しました」が出るときの対処", "Windows Installer 1722", "windows11", "Windows Installer", "installer", ["Windows Installer", "インストール", "カスタムアクション"], ["MSI 1722", "1722", "カスタムアクション"], SOURCE.windowsInstaller),
  topic("store-0x80073cf3", "Microsoft Storeのエラー「0x80073CF3」が出るときの対処", "Microsoft Store 0x80073CF3", "windows11", "Microsoft Store", "store", ["Microsoft Store", "アプリ", "更新"], ["0x80073CF3", "Microsoft Store", "パッケージ"], SOURCE.store),
  topic("store-0x80073d02", "Microsoft Storeのエラー「0x80073D02」が出るときの対処", "Microsoft Store 0x80073D02", "windows11", "Microsoft Store", "store", ["Microsoft Store", "アプリ", "起動中"], ["0x80073D02", "Microsoft Store", "アプリを閉じる"], SOURCE.store),
  topic("store-0x80073d05", "Microsoft Storeのエラー「0x80073D05」が出るときの対処", "Microsoft Store 0x80073D05", "windows11", "Microsoft Store", "store", ["Microsoft Store", "アプリ", "データ"], ["0x80073D05", "Microsoft Store", "一時データ"], SOURCE.store),
  topic("store-0x80073d0a", "Microsoft Storeのエラー「0x80073D0A」が出るときの対処", "Microsoft Store 0x80073D0A", "windows11", "Microsoft Store", "store", ["Microsoft Store", "アプリ", "通信"], ["0x80073D0A", "Microsoft Store", "ネットワーク"], SOURCE.store),
  topic("store-0x80073d0d", "Microsoft Storeのエラー「0x80073D0D」が出るときの対処", "Microsoft Store 0x80073D0D", "windows11", "Microsoft Store", "store", ["Microsoft Store", "アプリ", "パッケージ"], ["0x80073D0D", "Microsoft Store", "インストール"], SOURCE.store),
  topic("store-0x803fb005", "Microsoft Storeのエラー「0x803FB005」が出るときの対処", "Microsoft Store 0x803FB005", "windows11", "Microsoft Store", "store", ["Microsoft Store", "アプリ", "購入"], ["0x803FB005", "Microsoft Store", "アプリ取得"], SOURCE.store),
  topic("printer-0x0000011b", "ネットワークプリンターのエラー「0x0000011B」が出るときの対処", "プリンター 0x0000011B", "windows11", "プリンター", "printer", ["プリンター", "共有", "ネットワーク"], ["0x0000011B", "プリンター", "共有プリンター"], SOURCE.printer),
  topic("printer-0x00000709", "プリンターのエラー「0x00000709」が出るときの対処", "プリンター 0x00000709", "windows11", "プリンター", "printer", ["プリンター", "既定のプリンター", "印刷"], ["0x00000709", "プリンター", "既定"], SOURCE.printer),
];

const m365Topics = [
  topic("teams-caa20002", "Teamsのエラー「CAA20002」が出るときの対処", "Teams CAA20002", "windows11", "Teams", "m365", ["Teams", "サインイン", "アカウント"], ["CAA20002", "Teams", "サインイン"], SOURCE.teams),
  topic("teams-caa20003", "Teamsのエラー「CAA20003」が出るときの対処", "Teams CAA20003", "windows11", "Teams", "m365", ["Teams", "サインイン", "認証"], ["CAA20003", "Teams", "認証"], SOURCE.teams),
  topic("teams-caa20004", "Teamsのエラー「CAA20004」が出るときの対処", "Teams CAA20004", "windows11", "Teams", "m365", ["Teams", "サインイン", "組織"], ["CAA20004", "Teams", "組織アカウント"], SOURCE.teams),
  topic("teams-caa2000b", "Teamsのエラー「CAA2000B」が出るときの対処", "Teams CAA2000B", "windows11", "Teams", "m365", ["Teams", "サインイン", "ネットワーク"], ["CAA2000B", "Teams", "接続"], SOURCE.teams),
  topic("teams-caa2000c", "Teamsのエラー「CAA2000C」が出るときの対処", "Teams CAA2000C", "windows11", "Teams", "m365", ["Teams", "アカウント", "認証"], ["CAA2000C", "Teams", "アカウント"], SOURCE.teams),
  topic("teams-caa70004", "Teamsのエラー「0xCAA70004」が出るときの対処", "Teams 0xCAA70004", "windows11", "Teams", "m365", ["Teams", "サインイン", "キャッシュ"], ["0xCAA70004", "Teams", "サインイン"], SOURCE.teams),
  topic("teams-caa30194", "Teamsのエラー「0xCAA30194」が出るときの対処", "Teams 0xCAA30194", "windows11", "Teams", "m365", ["Teams", "接続", "ネットワーク"], ["0xCAA30194", "Teams", "接続エラー"], SOURCE.teams),
  topic("outlook-0x80042109", "Outlookのエラー「0x80042109」が出るときの対処", "Outlook 0x80042109", "windows11", "Outlook", "outlook", ["Outlook", "SMTP", "送信"], ["0x80042109", "Outlook", "送信サーバー"], SOURCE.outlook),
  topic("outlook-0x8004210a", "Outlookのエラー「0x8004210A」が出るときの対処", "Outlook 0x8004210A", "windows11", "Outlook", "outlook", ["Outlook", "POP3", "受信"], ["0x8004210A", "Outlook", "受信タイムアウト"], SOURCE.outlook),
  topic("outlook-0x8004210b", "Outlookのエラー「0x8004210B」が出るときの対処", "Outlook 0x8004210B", "windows11", "Outlook", "outlook", ["Outlook", "サーバー", "送受信"], ["0x8004210B", "Outlook", "サーバー応答"], SOURCE.outlook),
  topic("outlook-0x8004210c", "Outlookのエラー「0x8004210C」が出るときの対処", "Outlook 0x8004210C", "windows11", "Outlook", "outlook", ["Outlook", "メールボックス", "送受信"], ["0x8004210C", "Outlook", "メールボックス"], SOURCE.outlook),
  topic("outlook-0x800ccc0f", "Outlookのエラー「0x800CCC0F」が出るときの対処", "Outlook 0x800CCC0F", "windows11", "Outlook", "outlook", ["Outlook", "送受信", "接続"], ["0x800CCC0F", "Outlook", "接続が切断"], SOURCE.outlook),
  topic("office-30088-26", "Officeのエラー「30088-26」が出るときの対処", "Office 30088-26", "windows11", "Office", "installer", ["Office", "インストール", "更新"], ["30088-26", "Office", "インストール"], SOURCE.officeInstall),
  topic("office-30088-28", "Officeのエラー「30088-28」が出るときの対処", "Office 30088-28", "windows11", "Office", "installer", ["Office", "インストール", "更新"], ["30088-28", "Office", "更新"], SOURCE.officeInstall),
  topic("office-30015-11", "Officeのエラー「30015-11」が出るときの対処", "Office 30015-11", "windows11", "Office", "installer", ["Office", "インストール", "修復"], ["30015-11", "Office", "インストール"], SOURCE.officeInstall),
  topic("office-0-2031-17000", "Officeのエラー「0-2031 (17000)」が出るときの対処", "Office 0-2031 17000", "windows11", "Office", "installer", ["Office", "インストール", "ネットワーク"], ["0-2031", "17000", "Office"], SOURCE.officeInstall),
  topic("office-30068-39", "Officeのエラー「30068-39」が出るときの対処", "Office 30068-39", "windows11", "Office", "installer", ["Office", "インストール", "サービス"], ["30068-39", "Office", "Office Click-to-Run"], SOURCE.officeInstall),
  topic("excel-not-responding", "Excelの警告「Microsoft Excelは動作を停止しました」が出るときの対処", "Excel 動作を停止しました", "windows11", "Excel", "m365", ["Excel", "アドイン", "セーフモード", "修復"], ["Excel", "動作を停止しました", "応答なし"], SOURCE.excel),
  topic("word-not-responding", "Wordの警告「Microsoft Wordは動作を停止しました」が出るときの対処", "Word 動作を停止しました", "windows11", "Word", "m365", ["Word", "アドイン", "セーフモード", "修復"], ["Word", "動作を停止しました", "応答なし"], SOURCE.word),
];

const iphoneTopics = [
  topic("icloud-backup-incomplete", "「iCloudバックアップを完了できませんでした」が出るときの対処", "iCloudバックアップを完了できない", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "iCloud", "iCloudバックアップ"], ["iCloudバックアップ", "完了できませんでした", "バックアップ"], SOURCE.iphoneBackup),
  topic("icloud-storage-full", "「iCloudストレージに十分な空き容量がありません」が出るときの対処", "iCloudストレージ容量不足", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "iCloud", "ストレージ"], ["iCloudストレージ", "容量不足", "バックアップ"], SOURCE.iphoneBackup),
  topic("icloud-restore-failed", "「iCloudバックアップから復元できません」が出るときの対処", "iCloudバックアップから復元できない", "ios", "iPhone", "iphoneCloud", ["初期設定", "iCloudバックアップ", "復元"], ["iCloud復元", "バックアップから復元", "エラー"], SOURCE.iphoneRestore),
  topic("apple-account-signin", "「Apple Accountにサインインできません」が出るときの対処", "Apple Accountサインインできない", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "サインイン"], ["Apple Account", "サインインできない", "認証"], SOURCE.iphoneAccount),
  topic("apple-verification-code", "「確認コードを受信できません」が出るときの対処", "Apple Account確認コードが届かない", "ios", "iPhone", "iphoneCloud", ["Apple Account", "サインイン", "確認コード", "電話番号"], ["確認コード", "届かない", "Apple Account"], SOURCE.iphoneAccount),
  topic("apple-account-locked", "「Apple Accountがロックされています」が出るときの対処", "Apple Accountロック", "ios", "iPhone", "iphoneCloud", ["Apple Account", "アカウント復旧", "パスワード"], ["Apple Accountがロック", "アカウントロック", "復旧"], SOURCE.iphoneAccount),
  topic("icloud-drive-not-syncing", "「iCloud Driveが同期しない」ときの対処", "iCloud Drive同期しない", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "iCloud", "iCloud Drive"], ["iCloud Drive", "同期しない", "ファイル"], SOURCE.iphoneServices),
  topic("icloud-photos-not-syncing", "「iCloud写真が同期しない」ときの対処", "iCloud写真同期しない", "ios", "iPhone", "iphoneCloud", ["設定", "写真", "iCloud写真", "ストレージ"], ["iCloud写真", "同期しない", "写真"], SOURCE.iphoneServices),
  topic("apple-pay-setup-failed", "「Apple Payを設定できませんでした」が出るときの対処", "Apple Payを設定できない", "ios", "iPhone", "iphoneCloud", ["ウォレット", "Apple Pay", "カード", "認証"], ["Apple Pay", "設定できませんでした", "カード"], SOURCE.iphoneServices),
  topic("cellular-update-failed", "「Cellular Update Failed」が出るときの対処", "Cellular Update Failed", "ios", "iPhone", "iphoneCloud", ["設定", "一般", "情報", "モバイル通信"], ["Cellular Update Failed", "モバイル通信", "SIM"], SOURCE.iphoneServices),
  topic("apple-account-terms", "「Apple Accountの利用規約に同意できません」が出るときの対処", "Apple Account利用規約に同意できない", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "利用規約"], ["利用規約", "Apple Account", "同意"], SOURCE.iphoneAccount),
  topic("icloud-keychain-not-syncing", "「iCloudキーチェーンを有効にできません」が出るときの対処", "iCloudキーチェーン有効にできない", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "iCloud", "パスワード"], ["iCloudキーチェーン", "有効にできない", "パスワード"], SOURCE.iphoneServices),
  topic("icloud-mail-not-loading", "「iCloudメールを読み込めません」が出るときの対処", "iCloudメール読み込めない", "ios", "iPhone", "iphoneCloud", ["メール", "アカウント", "iCloud", "ネットワーク"], ["iCloudメール", "読み込めない", "メール"], SOURCE.iphoneServices),
  topic("apple-account-payment", "「お支払い方法を確認してください」が出るときの対処", "Appleお支払い方法を確認", "ios", "iPhone", "iphoneCloud", ["設定", "Apple Account", "お支払いと配送先"], ["お支払い方法を確認", "Apple Account", "App Store"], SOURCE.iphoneServices),
  topic("apple-account-purchase", "「このアカウントでは購入できません」が出るときの対処", "Apple Account購入できない", "ios", "iPhone", "iphoneCloud", ["App Store", "Apple Account", "購入"], ["このアカウントでは購入できません", "購入できない", "App Store"], SOURCE.iphoneServices),
];

const androidTopics = [
  topic("play-services-stopped", "「Google Play開発者サービスが繰り返し停止しています」が出るときの対処", "Google Play開発者サービス停止", "android", "Android", "androidPlay", ["設定", "アプリ", "Google Play開発者サービス", "ストレージ"], ["Google Play開発者サービス", "繰り返し停止", "Android"], SOURCE.androidPlayServices),
  topic("play-services-unsupported", "「Google Play開発者サービスはこのデバイスでサポートされていません」が出るときの対処", "Google Play開発者サービス非対応", "android", "Android", "androidPlay", ["設定", "システム", "Androidバージョン", "端末認証"], ["Google Play開発者サービス", "サポートされていません", "Android"], SOURCE.androidPlayServices),
  topic("play-services-action", "「Google Play開発者サービスに対して操作が必要です」が出るときの対処", "Google Play開発者サービス操作が必要", "android", "Android", "androidPlay", ["Google Play", "Google Play開発者サービス", "更新"], ["Google Play開発者サービス", "操作が必要", "更新"], SOURCE.androidPlayServices),
  topic("play-store-stopped", "「Google Play ストアが繰り返し停止しています」が出るときの対処", "Google Playストア停止", "android", "Android", "androidPlay", ["設定", "アプリ", "Google Play ストア", "ストレージ"], ["Google Play ストア", "繰り返し停止", "Android"], SOURCE.androidPlay),
  topic("play-download-pending", "Google Playの「ダウンロード保留中」が続くときの対処", "Google Play ダウンロード保留中", "android", "Android", "androidPlay", ["Google Play", "ダウンロード", "アプリ更新"], ["ダウンロード保留中", "Google Play", "アプリ"], SOURCE.androidPlay),
  topic("play-cant-install", "Google Playの「アプリをインストールできません」が出るときの対処", "Google Playアプリをインストールできない", "android", "Android", "androidPlay", ["Google Play", "アプリ", "空き容量", "互換性"], ["アプリをインストールできません", "Google Play", "Android"], SOURCE.androidPlay),
  topic("play-incompatible", "Google Playの「お使いのデバイスではこのバージョンに対応していません」が出るときの対処", "Androidアプリ互換性がない", "android", "Android", "androidPlay", ["Google Play", "アプリ", "互換性", "Androidバージョン"], ["このバージョンに対応していません", "Google Play", "互換性"], SOURCE.androidPlay),
  topic("webview-stopped", "「Android System WebViewが繰り返し停止しています」が出るときの対処", "Android System WebView停止", "android", "Android", "androidPlay", ["設定", "アプリ", "Android System WebView", "更新"], ["Android System WebView", "繰り返し停止", "WebView"], SOURCE.androidPlayServices),
  topic("play-services-update-required", "「Google Play開発者サービスを更新してください」が出るときの対処", "Google Play開発者サービス更新", "android", "Android", "androidPlay", ["Google Play", "Google Play開発者サービス", "更新"], ["Google Play開発者サービスを更新", "Android", "更新"], SOURCE.androidPlayServices),
  topic("google-sync-problem", "「現在同期で問題が発生しています。しばらくお待ちください」が出るときの対処", "Android Googleアカウント同期エラー", "android", "Android", "androidPlay", ["設定", "パスワードとアカウント", "Google", "同期"], ["同期で問題", "Googleアカウント", "Android同期"], SOURCE.androidApp),
];

const browserTopics = [
  topic("chrome-internet-disconnected", "Chromeのエラー「ERR_INTERNET_DISCONNECTED」が出るときの対処", "Chrome ERR_INTERNET_DISCONNECTED", "windows11", "Chrome", "browser", ["Chrome", "ネットワーク", "Wi-Fi"], ["ERR_INTERNET_DISCONNECTED", "Chrome", "インターネット接続なし"], SOURCE.chromeErrors),
  topic("chrome-network-changed", "Chromeのエラー「ERR_NETWORK_CHANGED」が出るときの対処", "Chrome ERR_NETWORK_CHANGED", "windows11", "Chrome", "browser", ["Chrome", "ネットワーク", "Wi-Fi", "VPN"], ["ERR_NETWORK_CHANGED", "Chrome", "ネットワーク変更"], SOURCE.chromeErrors),
  topic("chrome-connection-refused", "Chromeのエラー「ERR_CONNECTION_REFUSED」が出るときの対処", "Chrome ERR_CONNECTION_REFUSED", "windows11", "Chrome", "browser", ["Chrome", "ネットワーク", "サーバー", "ファイアウォール"], ["ERR_CONNECTION_REFUSED", "Chrome", "接続拒否"], SOURCE.chromeErrors),
  topic("chrome-empty-response", "Chromeのエラー「ERR_EMPTY_RESPONSE」が出るときの対処", "Chrome ERR_EMPTY_RESPONSE", "windows11", "Chrome", "browser", ["Chrome", "ネットワーク", "サーバー", "キャッシュ"], ["ERR_EMPTY_RESPONSE", "Chrome", "空の応答"], SOURCE.chromeErrors),
  topic("chrome-cache-miss", "Chromeのエラー「ERR_CACHE_MISS」が出るときの対処", "Chrome ERR_CACHE_MISS", "windows11", "Chrome", "browser", ["Chrome", "キャッシュ", "Cookie", "再読み込み"], ["ERR_CACHE_MISS", "Chrome", "キャッシュ"], SOURCE.chromeLoading),
  topic("edge-resource-not-found", "Edgeのエラー「INET_E_RESOURCE_NOT_FOUND」が出るときの対処", "Edge INET_E_RESOURCE_NOT_FOUND", "windows11", "Microsoft Edge", "browser", ["Edge", "ネットワーク", "DNS", "サイト"], ["INET_E_RESOURCE_NOT_FOUND", "Edge", "リソースが見つからない"], SOURCE.edgeSupport),
  topic("edge-status-access-violation", "Edgeのエラー「STATUS_ACCESS_VIOLATION」が出るときの対処", "Edge STATUS_ACCESS_VIOLATION", "windows11", "Microsoft Edge", "browser", ["Edge", "起動", "拡張機能", "更新"], ["STATUS_ACCESS_VIOLATION", "Edge", "クラッシュ"], SOURCE.edgeSupport),
  topic("edge-invalid-image-hash", "Edgeのエラー「STATUS_INVALID_IMAGE_HASH」が出るときの対処", "Edge STATUS_INVALID_IMAGE_HASH", "windows11", "Microsoft Edge", "browser", ["Edge", "起動", "セキュリティ", "互換性"], ["STATUS_INVALID_IMAGE_HASH", "Edge", "起動エラー"], SOURCE.edgeSupport),
  topic("edge-connection-closed", "Edgeのエラー「ERR_CONNECTION_CLOSED」が出るときの対処", "Edge ERR_CONNECTION_CLOSED", "windows11", "Microsoft Edge", "browser", ["Edge", "ネットワーク", "VPN", "プロキシ"], ["ERR_CONNECTION_CLOSED", "Edge", "接続終了"], SOURCE.edgeSupport),
  topic("edge-quic-protocol", "Edgeのエラー「ERR_QUIC_PROTOCOL_ERROR」が出るときの対処", "Edge ERR_QUIC_PROTOCOL_ERROR", "windows11", "Microsoft Edge", "browser", ["Edge", "ネットワーク", "QUIC", "VPN"], ["ERR_QUIC_PROTOCOL_ERROR", "Edge", "QUIC"], SOURCE.edgeSupport),
];

const allTopics = [
  ...oneDriveTopics,
  ...windowsTopics,
  ...m365Topics,
  ...iphoneTopics,
  ...androidTopics,
  ...browserTopics,
];

function buildSettings(topics) {
  return topics.flatMap((item) => VARIANTS.map((variant) => {
    const platform = item.platform || PLATFORM[item.os];
    const steps = STEPS[item.kind].map((step) =>
      step.replaceAll("{focus}", variant.label).replaceAll("{platform}", platform)
    );
    return {
      title: platform + "で" + item.title + "（" + variant.label + "）",
      slug: "trouble12-high-demand-" + item.id + "-" + variant.id,
      os: item.os,
      version: VERSION[item.os],
      category: "troubleshoot",
      aliases: [variant.label + "の" + item.alias, platform + " " + item.alias],
      path: item.path,
      steps,
      related_slugs: [],
      keywords: [platform, item.alias, "エラー", "エラーコード", ...item.keywords, ...variant.keywords],
      description: variant.label + "に表示された「" + item.alias + "」の確認手順です。",
      difficulty: item.difficulty || "beginner",
      estimate_minutes: item.estimate_minutes || 7,
      verified_at: VERIFIED_AT,
      review_due_at: REVIEW_DUE_AT,
      source_url: item.source,
      device_scope: VERSION[item.os] + "を基準にした公式情報ベースの下書き候補です。機種・エディション・アプリ版で表示や手順が異なる場合があります。",
      impact: platform + "で" + variant.label + "に起きた症状の原因を切り分ける入口になります。",
      rollback: "設定やアカウントを変更した場合は、変更前の値とバックアップを確認してから元に戻します。",
      ...(item.caution ? { caution: item.caution } : {}),
      editor_note: "公式サポートを参照して作成した高需要エラー下書き候補です。公開前に実機・対象バージョンで表示と手順を確認してください。",
    };
  }));
}

if (allTopics.length !== 100) {
  throw new Error("高需要エラーの基礎テーマ数が想定と異なります: " + allTopics.length);
}

const troubleshootingHighDemandSettings = buildSettings(allTopics);
if (troubleshootingHighDemandSettings.length !== 1000) {
  throw new Error("高需要エラー候補件数が想定と異なります: " + troubleshootingHighDemandSettings.length);
}

export { troubleshootingHighDemandSettings };
