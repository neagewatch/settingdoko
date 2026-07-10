'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookmarks, Bookmark, BOOKMARK_KEY } from '@/components/BookmarkButton';
import { getOsInfo } from '@/lib/os';

export default function BookmarksPage() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getBookmarks());
    setMounted(true);
  }, []);

  const remove = (slug: string) => {
    const next = items.filter(b => b.slug !== slug);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    setItems(next);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <h1 className="text-[26px] font-bold text-[var(--ink)] mb-1.5">★ 保存済みの設定</h1>
      <p className="text-[var(--sub)] text-[14px] mb-8">この端末のブラウザに保存されています</p>

      {!mounted ? null : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--ink)] font-bold mb-2">まだ保存された設定はありません</p>
          <p className="text-[14px] text-[var(--sub)] mb-5">設定ページの「☆ 保存」ボタンでよく使う設定をストックできます</p>
          <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium">
            設定を探す
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(b => {
            const os = getOsInfo(b.os);
            return (
              <div key={b.slug} className="card p-4 flex items-center gap-3">
                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0"
                  style={{ color: os.color, backgroundColor: os.color + '0C' }}>
                  {os.short}
                </span>
                <Link href={`/setting/${b.slug}`} className="flex-1 font-medium text-[var(--ink)] hover:text-[var(--accent)] truncate">
                  {b.title}
                </Link>
                <button onClick={() => remove(b.slug)} className="text-[12px] text-[var(--sub)] hover:text-red-500 px-2 py-1">
                  削除
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
