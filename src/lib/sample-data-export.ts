// Combined export of all sample settings
import { sampleSettings } from "./sample-data";
import { additionalSettings } from "./sample-data";
import { androidSettings } from "./android-data";
import { primarySettings } from "./primary-data";

export { sampleSettings, additionalSettings };
export { androidSettings };
export { primarySettings };
export const allSampleSettings = [...sampleSettings, ...additionalSettings, ...androidSettings, ...primarySettings];
