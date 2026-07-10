import { Setting } from '../supabase';
import { WINDOWS_SETTINGS } from './windows';
import { WINDOWS10_SETTINGS } from './windows10';
import { IOS_SETTINGS } from './ios';
import { IPADOS_SETTINGS } from './ipados';
import { MACOS_SETTINGS } from './macos';
import { ANDROID_SETTINGS } from './android';
import { APP_SETTINGS } from './apps';
import { BROWSER_SETTINGS } from './browsers';
import { GOOGLE_SETTINGS, LINE_SETTINGS } from './gservices';
import { ADDITIONAL_SETTINGS } from './additions';

export const ALL_SETTINGS: Setting[] = [
  ...WINDOWS_SETTINGS,
  ...WINDOWS10_SETTINGS,
  ...IOS_SETTINGS,
  ...IPADOS_SETTINGS,
  ...MACOS_SETTINGS,
  ...ANDROID_SETTINGS,
  ...APP_SETTINGS,
  ...BROWSER_SETTINGS,
  ...GOOGLE_SETTINGS,
  ...LINE_SETTINGS,
  ...ADDITIONAL_SETTINGS,
];

export { CATEGORIES, getCategory } from './categories';
export { FEATURES } from './features';
export type { Feature } from './features';
