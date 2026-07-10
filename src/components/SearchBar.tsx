'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SEARCH_INDEX from '@/lib/search-index.json';
import { getOsInfo } from '@/lib/os';

type IndexEntry = { t: string; s: string; o: string; a: string[]; k: string[] };

type Props = {
  size?: 'hero' | 'compact';
  autoFocus?: boolean;
  defaultValue?: string;
};

const norm = (s: string) => s.toLowerCase().normalize('NFKC');

export default function SearchBar({ size = 'compact', autoFocus = false, defaultValue = '' }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // 「/」ホットキーで検索フォーカス
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const suggestions = useMemo(() => {
    const query = norm(q.trim());
    if (!query) return [];
    return (SEARCH_INDEX as IndexEntry[])
      .map(s => {
        let score = 0;
        const title = norm(s.t);
        if (title.startsWith(query)) score += 60;
        else if (title.includes(query)) score += 40;
        if (s.a.some(a => norm(a).includes(query))) score += 30;
        if (s.k.some(k => norm(k).includes(query))) score += 15;
        return { s, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(x => x.s);
  }, [q]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(`/setting/${suggestions[active].s}`);
    } else if (e.key === 'Escape') { setOpen(false); }
  };

  const isHero = size === 'hero';

  return (
    <div ref={boxRef} className={`relative ${isHero ? 'max-w-xl mx-auto' : 'w-full'}`}>
      <form onSubmit={submit} role="search">
        <div className={`flex items-center gap-3 bg-white border border-[var(--line)] transition-all
          focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--accent-soft)]
          ${isHero ? 'rounded-2xl px-5 py-4 shadow-[0_8px_30px_rgba(22,24,29,.07)]' : 'rounded-xl px-4 py-2.5'}`}>
          <svg className={`text-[var(--sub)] flex-shrink-0 ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={e => { setQ(e.target.value); setOpen(true); setActive(-1); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={isHero ? '例:「拡張子」「ミュート」「既読」' : '設定を検索'}
            autoFocus={autoFocus}
            className={`flex-1 bg-transparent outline-none text-[var(--ink)] placeholder:text-slate-400 ${isHero ? 'text-lg' : 'text-sm'}`}
            aria-label="設定を検索"
            aria-expanded={open && suggestions.length > 0}
            aria-autocomplete="list"
          />
          {isHero && (
            <kbd className="hidden sm:inline-block text-[11px] text-[var(--sub)] border border-[var(--line)] rounded-md px-1.5 py-0.5 bg-slate-50">/</kbd>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 card shadow-xl overflow-hidden z-40" role="listbox">
          {suggestions.map((s, i) => {
            const os = getOsInfo(s.o);
            return (
              <Link
                key={s.s}
                href={`/setting/${s.s}`}
                onClick={() => setOpen(false)}
                role="option"
                aria-selected={i === active}
                className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-[var(--line)] last:border-0 transition-colors
                  ${i === active ? 'bg-[var(--accent-soft)]' : 'hover:bg-slate-50'}`}
              >
                <span className="text-[11px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                  style={{ color: os.color, backgroundColor: os.color + '12' }}>
                  {os.short}
                </span>
                <span className="text-[var(--ink)] font-medium truncate">{s.t}</span>
              </Link>
            );
          })}
          <button
            onClick={() => submit()}
            className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--accent)] font-medium hover:bg-slate-50"
          >
            「{q}」をすべて検索 →
          </button>
        </div>
      )}
    </div>
  );
}
