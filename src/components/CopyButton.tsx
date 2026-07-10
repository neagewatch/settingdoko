'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'コピー', className = '' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={copy}
      className={`no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-all
        ${done ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-[var(--line)] text-[var(--sub)] hover:border-slate-300'} ${className}`}
    >
      {done ? '✓ コピーしました' : label}
    </button>
  );
}
