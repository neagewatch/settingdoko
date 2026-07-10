import { Category } from '../supabase';

export const CATEGORIES: Category[] = [
  { id: 'display',       name: '画面・表示', icon: '🖥', sort_order: 1 },
  { id: 'sound',         name: '音声・サウンド', icon: '🔊', sort_order: 2 },
  { id: 'network',       name: 'ネットワーク', icon: '📶', sort_order: 3 },
  { id: 'bluetooth',     name: 'Bluetooth', icon: '🔵', sort_order: 4 },
  { id: 'privacy',       name: 'プライバシー', icon: '🔒', sort_order: 5 },
  { id: 'notification',  name: '通知', icon: '🔔', sort_order: 6 },
  { id: 'storage',       name: 'ストレージ', icon: '💾', sort_order: 7 },
  { id: 'system',        name: 'システム', icon: '⚙️', sort_order: 8 },
  { id: 'input',         name: '入力・キーボード', icon: '⌨️', sort_order: 9 },
  { id: 'accessibility', name: 'アクセシビリティ', icon: '♿', sort_order: 10 },
  { id: 'security',      name: 'セキュリティ', icon: '🛡', sort_order: 11 },
  { id: 'file',          name: 'ファイル・フォルダ', icon: '📁', sort_order: 12 },
  { id: 'app',           name: 'アプリ', icon: '📱', sort_order: 13 },
  { id: 'account',       name: 'アカウント', icon: '👤', sort_order: 14 },
  { id: 'mail',          name: 'メール', icon: '✉️', sort_order: 15 },
  { id: 'meeting',       name: '会議・通話', icon: '📹', sort_order: 16 },
  { id: 'edit',          name: '編集・入力', icon: '✏️', sort_order: 17 },
  { id: 'share',         name: '共有・共同作業', icon: '🤝', sort_order: 18 },
  { id: 'automation',    name: '自動化', icon: '🔁', sort_order: 19 },
  { id: 'battery',       name: 'バッテリー・電源', icon: '🔋', sort_order: 20 },
  { id: 'developer',     name: '開発者向け', icon: '🧑‍💻', sort_order: 21 },
];

export function getCategory(id: string | null): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}
