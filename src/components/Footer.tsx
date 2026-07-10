import Link from 'next/link';
import { OS_LIST, APP_LIST } from '@/lib/os';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-20 py-10 no-print bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-5">
          <span className="toggle-dot" aria-hidden />
          <span className="font-bold text-[var(--ink)]">設定どこ？</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-8">
          <div>
            <p className="text-[11px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-2.5">OS</p>
            <ul className="space-y-1.5">
              {OS_LIST.map(o => (
                <li key={o.id}><Link href={`/os/${o.id}`} className="text-[var(--sub)] hover:text-[var(--accent)]">{o.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-2.5">業務アプリ</p>
            <ul className="space-y-1.5">
              {APP_LIST.slice(0, 9).map(a => (
                <li key={a.id}><Link href={`/os/${a.id}`} className="text-[var(--sub)] hover:text-[var(--accent)]">{a.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-2.5">&nbsp;</p>
            <ul className="space-y-1.5">
              {APP_LIST.slice(9).map(a => (
                <li key={a.id}><Link href={`/os/${a.id}`} className="text-[var(--sub)] hover:text-[var(--accent)]">{a.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-2.5">その他</p>
            <ul className="space-y-1.5">
              <li><Link href="/apps" className="text-[var(--sub)] hover:text-[var(--accent)]">業務アプリ一覧</Link></li>
              <li><Link href="/feature/new-pc-setup" className="text-[var(--sub)] hover:text-[var(--accent)]">特集・まとめ</Link></li>
              <li><Link href="/bookmarks" className="text-[var(--sub)] hover:text-[var(--accent)]">保存済み</Link></li>
            </ul>
          </div>
        </div>
        <p className="text-[13px] text-[var(--sub)]">
          © 2026 設定どこ？ — PC・スマホ・業務アプリの設定場所を最速で探す
        </p>
      </div>
    </footer>
  );
}
