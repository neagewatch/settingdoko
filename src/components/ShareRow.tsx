'use client';

import { useState } from 'react';

export default function ShareRow({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  // window依存を避けるため、URLは固定オリジン + path で組み立てる（url=空バグの恒久修正）
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://settingdoko.vercel.app';
  const url = `${origin}${path}`;
  const text = `${title} | 設定どこ？`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const btn = 'inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-[13px] font-medium border border-[var(--line)] bg-white text-[var(--sub)] hover:border-slate-300 transition-all';

  return (
    <div className="no-print flex items-center gap-2 flex-wrap">
      <span className="text-[12px] text-[var(--sub)] mr-1">シェア:</span>
      <a
        className={btn}
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
      >
        𝕏 ポスト
      </a>
      <a
        className={btn}
        href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
        target="_blank" rel="noopener noreferrer"
      >
        LINE
      </a>
      <button className={btn} onClick={copyUrl}>
        {copied ? '✓ コピーしました' : '🔗 URLコピー'}
      </button>
      <button className={btn} onClick={() => window.print()}>
        🖨 印刷
      </button>
    </div>
  );
}
