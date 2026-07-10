export type OsEntry = {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: string;
  os_type: 'os' | 'app';
  group?: 'browser' | 'microsoft' | 'google' | 'communication' | 'other';
  tagline?: string;
};

export const OS_LIST: OsEntry[] = [
  { id: 'windows11', name: 'Windows 11', short: 'Win11', icon: '⊞', color: '#0078D4', os_type: 'os' },
  { id: 'windows10', name: 'Windows 10', short: 'Win10', icon: '⊞', color: '#4A90D9', os_type: 'os' },
  { id: 'ios',       name: 'iPhone / iOS', short: 'iPhone', icon: '', color: '#1D1D1F', os_type: 'os' },
  { id: 'ipados',    name: 'iPad / iPadOS', short: 'iPad', icon: '', color: '#6E6E73', os_type: 'os' },
  { id: 'macos',     name: 'macOS', short: 'Mac', icon: '', color: '#515154', os_type: 'os' },
  { id: 'android',   name: 'Android', short: 'Android', icon: '🤖', color: '#34A853', os_type: 'os' },
];

export const APP_LIST: OsEntry[] = [
  // ブラウザ
  { id: 'chrome',  name: 'Chrome', short: 'Chrome', icon: '🌐', color: '#1A73E8', os_type: 'app', group: 'browser', tagline: 'ブラウザ' },
  { id: 'edge',    name: 'Microsoft Edge', short: 'Edge', icon: '🌊', color: '#0B8484', os_type: 'app', group: 'browser', tagline: 'ブラウザ' },
  { id: 'safari',  name: 'Safari', short: 'Safari', icon: '🧭', color: '#006CFF', os_type: 'app', group: 'browser', tagline: 'ブラウザ' },
  { id: 'firefox', name: 'Firefox', short: 'Firefox', icon: '🦊', color: '#FF7139', os_type: 'app', group: 'browser', tagline: 'ブラウザ' },
  // Microsoft
  { id: 'outlook',        name: 'Outlook', short: 'Outlook', icon: '📧', color: '#0F6CBD', os_type: 'app', group: 'microsoft', tagline: 'メール・予定表' },
  { id: 'teams',          name: 'Teams', short: 'Teams', icon: '💬', color: '#5B5FC7', os_type: 'app', group: 'microsoft', tagline: '会議・チャット' },
  { id: 'excel',          name: 'Excel', short: 'Excel', icon: '📊', color: '#107C41', os_type: 'app', group: 'microsoft', tagline: '表計算・グラフ' },
  { id: 'word',           name: 'Word', short: 'Word', icon: '📝', color: '#185ABD', os_type: 'app', group: 'microsoft', tagline: '文書作成' },
  { id: 'powerpoint',     name: 'PowerPoint', short: 'PPT', icon: '📽', color: '#C43E1C', os_type: 'app', group: 'microsoft', tagline: 'プレゼン資料' },
  { id: 'power_automate', name: 'Power Automate', short: 'PA', icon: '⚡', color: '#0066FF', os_type: 'app', group: 'microsoft', tagline: '業務自動化' },
  // Google
  { id: 'gmail',           name: 'Gmail', short: 'Gmail', icon: '✉️', color: '#EA4335', os_type: 'app', group: 'google', tagline: 'メール' },
  { id: 'google_calendar', name: 'Googleカレンダー', short: 'カレンダー', icon: '📅', color: '#1967D2', os_type: 'app', group: 'google', tagline: '予定管理' },
  { id: 'google_drive',    name: 'Google Drive', short: 'Drive', icon: '☁️', color: '#1FA463', os_type: 'app', group: 'google', tagline: 'クラウド共有' },
  { id: 'youtube',         name: 'YouTube', short: 'YouTube', icon: '▶️', color: '#FF0000', os_type: 'app', group: 'google', tagline: '動画' },
  // コミュニケーション・その他
  { id: 'line',    name: 'LINE', short: 'LINE', icon: '💚', color: '#06C755', os_type: 'app', group: 'communication', tagline: 'メッセージ' },
  { id: 'zoom',    name: 'Zoom', short: 'Zoom', icon: '🎥', color: '#0B5CFF', os_type: 'app', group: 'communication', tagline: 'ビデオ会議' },
  { id: 'slack',   name: 'Slack', short: 'Slack', icon: '💼', color: '#4A154B', os_type: 'app', group: 'communication', tagline: 'チームチャット' },
  { id: 'acrobat', name: 'Acrobat', short: 'Acrobat', icon: '📄', color: '#EC1C24', os_type: 'app', group: 'other', tagline: 'PDF編集' },
];

export const APP_GROUPS: { id: NonNullable<OsEntry['group']>; label: string }[] = [
  { id: 'browser', label: 'ブラウザ' },
  { id: 'microsoft', label: 'Microsoft 365' },
  { id: 'google', label: 'Googleサービス' },
  { id: 'communication', label: 'コミュニケーション' },
  { id: 'other', label: 'その他' },
];

export const ALL_TARGETS = [...OS_LIST, ...APP_LIST];

export function getOsInfo(osId: string): OsEntry {
  return ALL_TARGETS.find(o => o.id === osId)
    || { id: osId, name: osId, short: osId, icon: '💻', color: '#666', os_type: 'os' };
}

export const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  beginner:     { label: '初心者向け', color: '#10B981' },
  intermediate: { label: '中級', color: '#F59E0B' },
  advanced:     { label: '上級', color: '#EF4444' },
};
