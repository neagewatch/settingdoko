import { allSampleSettings } from "../src/lib/sample-data-export";
import { microsoft365Settings } from "./microsoft365-data.mjs";
import { microsoft365Wave2Settings } from "./microsoft365-wave2-data.mjs";
import { windowsSettings } from "./generate-windows-sql.mjs";
import { allAdditional } from "./generate-all-additional-sql.mjs";
import { appleSettings } from "./generate-apple-sql.mjs";
import { officialSettings } from "./official-settings-data.mjs";
import { bulkSettings } from "./official-settings-bulk-data.mjs";
import { extraWindowsSettings } from "./windows11-expansion-data.mjs";
import { troubleshootingSettings } from "./troubleshooting-data.mjs";
import { troubleshootingWave5Settings } from "./troubleshooting-wave5-data.mjs";
import { troubleshootingWave6Settings } from "./troubleshooting-wave6-data.mjs";
import { troubleshootingWave7Settings } from "./troubleshooting-wave7-data.mjs";
import { troubleshootingBulkSettings } from "./troubleshooting-bulk-data.mjs";
import { troubleshootingExpansionSettings } from "./troubleshooting-expansion-data.mjs";
import { troubleshootingFocusedSettings } from "./troubleshooting-focused-data.mjs";
import { errorCodeDeepSettings } from "./error-code-deep-data.mjs";
import { troubleshootingHighDemandSettings } from "./troubleshooting-high-demand-data.mjs";
import { troubleshootingUniqueSettings } from "./troubleshooting-unique-data.mjs";
import { wave3Settings } from "./official-settings-wave3-data.mjs";
import { wave4Settings } from "./official-settings-wave4-data.mjs";
import { prelaunchCuratedSettings } from "./prelaunch-curated-data.mjs";
import { consolidateCandidates } from "./consolidate-candidates.mjs";
import type { Setting } from "../src/lib/types";

export const rawCandidateSettings = [
  ...microsoft365Settings,
  ...microsoft365Wave2Settings,
  ...allSampleSettings,
  ...windowsSettings,
  ...allAdditional,
  ...appleSettings,
  ...officialSettings,
  ...bulkSettings,
  ...extraWindowsSettings,
  ...troubleshootingSettings,
  ...troubleshootingWave5Settings,
  ...troubleshootingWave6Settings,
  ...troubleshootingWave7Settings,
  ...troubleshootingBulkSettings,
  ...troubleshootingExpansionSettings,
  ...troubleshootingFocusedSettings,
  ...errorCodeDeepSettings,
  ...troubleshootingHighDemandSettings,
  ...troubleshootingUniqueSettings,
  ...wave3Settings,
  ...wave4Settings,
  ...prelaunchCuratedSettings,
];

export function loadLocalCandidateSettings(): Setting[] {
  const consolidated = consolidateCandidates(rawCandidateSettings);
  return consolidated
    .map((setting, index) => ({
      ...setting,
      id: typeof setting.id === "string" ? setting.id : `candidate-${index.toString().padStart(5, "0")}`,
      updated_at: typeof setting.updated_at === "string"
        ? setting.updated_at
        : setting.verified_at || "2026-08-01T00:00:00.000Z",
      status: setting.status === "draft" ? "draft" : "published",
    })) as Setting[];
}
