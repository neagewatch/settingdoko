export type SourceType =
  | "OFFICIAL_SUPPORT"
  | "OFFICIAL_DOCUMENTATION"
  | "OFFICIAL_VENDOR"
  | "DEVICE_MANUFACTURER"
  | "TRUSTED_SECONDARY"
  | "UNKNOWN"
  | "INVALID";

export type SourceAssessment = {
  type: SourceType;
  hostname: string | null;
  authoritative: boolean;
  secure: boolean;
  generic: boolean;
  allowedForAutomatedCheck: boolean;
};

const OFFICIAL_SUPPORT_DOMAINS = new Set([
  "support.microsoft.com",
  "support.apple.com",
  "support.google.com",
  "support.mozilla.org",
  "help.line.me",
  "support.zoom.com",
  "support.discord.com",
  "support.spotify.com",
  "help.openai.com",
]);

const OFFICIAL_DOCUMENTATION_DOMAINS = new Set([
  "learn.microsoft.com",
  "developer.apple.com",
  "developer.android.com",
  "developers.google.com",
]);

const OFFICIAL_VENDOR_DOMAINS = new Set([
  "microsoft.com",
  "apple.com",
  "google.com",
  "android.com",
  "slack.com",
  "adobe.com",
  "helpx.adobe.com",
]);

const DEVICE_MANUFACTURER_DOMAINS = new Set([
  "samsung.com",
  "sony.jp",
  "support.google.com",
  "k-tai.sharp.co.jp",
  "support.oppo.com",
  "mi.com",
]);

const TRUSTED_SECONDARY_DOMAINS = new Set<string>();

function domainMatches(hostname: string, domains: Set<string>): boolean {
  return [...domains].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function isGenericSupportLocation(url: URL): boolean {
  // MicrosoftやGoogleのサポートURLは、地域コードをパスに含めて
  // `/en-us/windows` のように返すことがある。地域コードを除いてから
  // 判定しないと、ロケール付きのトップページを個別資料と誤認する。
  const path = url.pathname
    .replace(/\/+$/, "")
    .replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, "");
  if (!path || path === "/") return true;
  // Apple Guideのwelcome URLは版番号を途中に含む形もあるが、いずれも
  // 個別手順ではなく製品ガイドの入口なので根拠資料としては弱い。
  if (/^\/guide\/(?:mac-help|iphone|ipad)\/welcome(?:\/|$)/i.test(path)) return true;
  const genericPaths = new Set([
    "/windows",
    "/android",
    "/chrome",
    "/pixelphone",
    "/guide/mac-help/welcome/mac",
    "/guide/iphone/welcome/ios",
  ]);
  const normalizedPath = path.toLowerCase();
  if (genericPaths.has(normalizedPath)) return true;

  // Device support roots are useful for discovery, but they do not document
  // the specific procedure behind an article. Keep them out of the source
  // evidence used for index eligibility until an individual support page is
  // attached.
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const manufacturerRoots: Record<string, Set<string>> = {
    "k-tai.sharp.co.jp": new Set(["/support"]),
    "www.sony.jp": new Set(["/support/xperia"]),
    "support.google.com": new Set(["/pixelphone", "/android"]),
    "samsung.com": new Set(["/support"]),
  };
  return manufacturerRoots[host]?.has(normalizedPath) ?? false;
}

export function assessSource(value: string | null | undefined): SourceAssessment {
  if (!value) {
    return { type: "INVALID", hostname: null, authoritative: false, secure: false, generic: false, allowedForAutomatedCheck: false };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { type: "INVALID", hostname: null, authoritative: false, secure: false, generic: false, allowedForAutomatedCheck: false };
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const secure = url.protocol === "https:";
  const safeNetworkTarget = secure
    && !url.username
    && !url.password
    && hostname !== "localhost"
    && !hostname.endsWith(".local")
    && !/^\d+(?:\.\d+){3}$/.test(hostname)
    && hostname !== "[::1]";

  let type: SourceType = "UNKNOWN";
  if (domainMatches(hostname, OFFICIAL_DOCUMENTATION_DOMAINS)) type = "OFFICIAL_DOCUMENTATION";
  else if (domainMatches(hostname, OFFICIAL_SUPPORT_DOMAINS)) type = "OFFICIAL_SUPPORT";
  else if (domainMatches(hostname, DEVICE_MANUFACTURER_DOMAINS)) type = "DEVICE_MANUFACTURER";
  else if (domainMatches(hostname, OFFICIAL_VENDOR_DOMAINS)) type = "OFFICIAL_VENDOR";
  else if (domainMatches(hostname, TRUSTED_SECONDARY_DOMAINS)) type = "TRUSTED_SECONDARY";

  const authoritative = type !== "UNKNOWN" && type !== "TRUSTED_SECONDARY";
  return {
    type,
    hostname,
    authoritative,
    secure,
    generic: isGenericSupportLocation(url),
    allowedForAutomatedCheck: safeNetworkTarget && type !== "UNKNOWN" && type !== "TRUSTED_SECONDARY",
  };
}

export const SOURCE_DISCOVERY_MAP = {
  windows11: ["support.microsoft.com", "learn.microsoft.com"],
  windows10: ["support.microsoft.com", "learn.microsoft.com"],
  ios: ["support.apple.com"],
  ipados: ["support.apple.com"],
  macos: ["support.apple.com"],
  android: ["support.google.com/android", "support.google.com/pixelphone"],
  chrome: ["support.google.com/chrome"],
  edge: ["support.microsoft.com/microsoft-edge", "learn.microsoft.com/deployedge"],
  firefox: ["support.mozilla.org"],
  safari: ["support.apple.com"],
} as const;
