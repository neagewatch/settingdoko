// Combined export of all sample settings
import { sampleSettings } from "./sample-data";
import { additionalSettings } from "./sample-data";

export { sampleSettings, additionalSettings };
export const allSampleSettings = [...sampleSettings, ...additionalSettings];
