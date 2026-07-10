'use client';

import { useState, useEffect } from 'react';

export const BOOKMARK_KEY = 'settingdoko_bookmarks';

export type Bookmark = { slug: string; title: string; os: string };

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]'); } catch { return []; }
}

export default function BookmarkButton({ slug, title, os }: Bookmark) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(getBookmarks().some(b => b.slug === slug));
  }, [slug]);

  const toggle = () => {
    const list = getBookmarks();
    const next = saved ? list.filter(b => b.slug !== slug) : [...list, { slug, title, os }];
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  if (!mounted) return <div className="w-[86px] h-9" aria-hidden />;

  return (
    <button
      onClick={toggle}
      className={`no-print inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-sm font-medium border transition-all
        ${saved
          ? 'bg-amber-50 border-amber-300 text-amber-700'
          : 'bg-white border-[var(--line)] text-[var(--sub)] hover:border-slate-300'}`}
      aria-pressed={saved}
    >
      <span>{saved ? '★' : '☆'}</span>
      <span>{saved ? '保存済み' : '保存'}</span>
    </button>
  );
}
