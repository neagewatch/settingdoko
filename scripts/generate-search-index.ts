// クライアント用の軽量検索インデックスを生成（手順・tips等を除外してバンドルを削減）
import { writeFileSync } from 'fs';
import { ALL_SETTINGS } from '../src/lib/data/index';

const index = ALL_SETTINGS.filter(s => s.is_published).map(s => ({
  t: s.title,
  s: s.slug,
  o: s.os,
  a: s.aliases,
  k: s.keywords,
}));

writeFileSync('src/lib/search-index.json', JSON.stringify(index));
console.log(`search-index.json: ${index.length} entries`);
