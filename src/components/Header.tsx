'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { OS_LIST, APP_LIST } from '@/lib/os';
import { CATEGORIES } from '@/lib/data/categories';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[var(--line)] no-print">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="toggle-dot" aria-hidden />
          <span className="font-bold text-lg tracking-tight text-[var(--ink)]">設定どこ？</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          {OS_LIST.map(os => (
            <Link key={os.id} href={`/os/${os.id}`}
              className="px-2.5 py-1.5 text-[var(--sub)] hover:text-[var(--ink)] hover:bg-slate-100 rounded-lg transition-colors">
              {os.short}
            </Link>
          ))}
          <Link href="/apps"
            className="px-2.5 py-1.5 text-[var(--sub)] hover:text-[var(--ink)] hover:bg-slate-100 rounded-lg transition-colors">
            業務アプリ
          </Link>
          <div className="relative" ref={catRef}>
            <button onClick={() => setCatOpen(v => !v)}
              className="px-2.5 py-1.5 text-[var(--sub)] hover:text-[var(--ink)] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1">
              カテゴリ <span className="text-[10px]">▾</span>
            </button>
            {catOpen && (
              <div className="absolute right-0 top-full mt-2 w-[480px] p-3 card shadow-xl grid grid-cols-2 gap-1">
                {CATEGORIES.slice(0, 14).map(c => (
                  <Link key={c.id} href={`/category/${c.id}`} onClick={() => setCatOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--sub)] hover:text-[var(--ink)] hover:bg-slate-50 rounded-lg transition-colors">
                    <span>{c.icon}</span><span>{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <span className="w-px h-4 bg-[var(--line)] mx-1.5" />
          <Link href="/bookmarks" className="px-2.5 py-1.5 text-[var(--sub)] hover:text-[var(--ink)] hover:bg-slate-100 rounded-lg transition-colors">★ 保存</Link>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-[var(--sub)]" onClick={() => setMenuOpen(v => !v)} aria-label="メニュー">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-white px-4 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {OS_LIST.map(os => (
              <Link key={os.id} href={`/os/${os.id}`} onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium bg-slate-50 rounded-lg text-[var(--ink)]">
                {os.name}
              </Link>
            ))}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-2">業務アプリ</p>
            <div className="grid grid-cols-3 gap-2">
              {APP_LIST.map(a => (
                <Link key={a.id} href={`/os/${a.id}`} onClick={() => setMenuOpen(false)}
                  className="px-2 py-2 text-[13px] bg-slate-50 rounded-lg text-[var(--ink)] text-center">
                  {a.short}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-2">カテゴリ</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(0, 14).map(c => (
                <Link key={c.id} href={`/category/${c.id}`} onClick={() => setMenuOpen(false)}
                  className="px-3 py-1.5 text-[13px] bg-slate-50 rounded-full text-[var(--sub)]">
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/bookmarks" onClick={() => setMenuOpen(false)}
            className="block px-3 py-2.5 text-sm font-medium bg-slate-50 rounded-lg text-[var(--ink)]">
            ★ 保存済み
          </Link>
        </div>
      )}
    </header>
  );
}
