import Link from 'next/link';
import type { Metadata } from 'next';
import { APP_LIST, APP_GROUPS } from '@/lib/os';
import { ALL_SETTINGS } from '@/lib/data/index';

export const metadata: Metadata = {
  title: 'アプリ・サービスの設定一覧',
  description: 'ブラウザ（Chrome・Edge・Safari・Firefox）、Microsoft 365、Googleサービス、LINE・Zoom・Slackなどの設定と操作をまとめています。',
  alternates: { canonical: '/apps' },
};

export default function AppsPage() {
  const counts: Record<string, number> = {};
  ALL_SETTINGS.forEach(s => { counts[s.os] = (counts[s.os] || 0) + 1; });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-7 pb-16">
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--sub)] mb-6" aria-label="パンくず">
        <Link href="/" className="hover:text-[var(--accent)]">トップ</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[var(--ink)]">アプリ・サービス</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-[var(--ink)] mb-1.5">アプリ・サービスの設定</h1>
        <p className="text-[var(--sub)] text-[14px]">ブラウザ・業務アプリ・Webサービスの設定と操作ガイド</p>
      </div>

      <div className="space-y-9">
        {APP_GROUPS.map(g => {
          const apps = APP_LIST.filter(a => a.group === g.id);
          if (!apps.length) return null;
          return (
            <section key={g.id}>
              <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-3.5">{g.label}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {apps.map(app => (
                  <Link key={app.id} href={`/os/${app.id}`} className="card card-hover p-5 group">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: app.color }} />
                      <p className="font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">{app.name}</p>
                    </div>
                    <p className="text-[13px] text-[var(--sub)]">{app.tagline} ・ {counts[app.id] || 0}件 →</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
