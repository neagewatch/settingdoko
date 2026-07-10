import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import SettingCard from '@/components/SettingCard';
import { OS_LIST, APP_LIST } from '@/lib/os';
import { ALL_SETTINGS, FEATURES, CATEGORIES } from '@/lib/data/index';

export default function HomePage() {
  const counts: Record<string, number> = {};
  ALL_SETTINGS.forEach(s => { counts[s.os] = (counts[s.os] || 0) + 1; });
  const recent = [...ALL_SETTINGS].slice(-5).reverse();

  return (
    <div>
      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-14 px-4 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center mb-9 relative">
          <h1 className="text-[34px] sm:text-[44px] font-bold text-[var(--ink)] tracking-tight leading-tight mb-4">
            設定、<span className="text-[var(--accent)]">どこ？</span>
          </h1>
          <p className="text-[15px] sm:text-lg text-[var(--sub)]">
            PC・スマホ・業務アプリの「あの設定どこだっけ」を最速で解決
          </p>
        </div>
        <SearchBar size="hero" />
        <div className="max-w-xl mx-auto mt-4 flex flex-wrap justify-center gap-2">
          {['拡張子', 'Bluetooth', '明るさ', 'ミュート', '既読', '署名', 'キャッシュ削除', 'バッテリー'].map(kw => (
            <Link key={kw} href={`/search?q=${encodeURIComponent(kw)}`}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[13px] text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
              {kw}
            </Link>
          ))}
        </div>
      </section>

      {/* OS */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">OSから探す</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OS_LIST.map(os => (
            <Link key={os.id} href={`/os/${os.id}`}
              className="card card-hover p-5 group">
              <p className="font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors mb-1">{os.name}</p>
              <p className="text-[12px] text-[var(--sub)]">{counts[os.id] || 0}件の設定 →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Apps */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider">アプリ・サービスから探す</h2>
          <Link href="/apps" className="text-[13px] text-[var(--accent)] font-medium hover:underline">すべて見る →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {APP_LIST.slice(0, 12).map(app => (
            <Link key={app.id} href={`/os/${app.id}`}
              className="card card-hover px-4 py-3.5 flex items-center gap-3 group">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: app.color }} />
              <div className="min-w-0">
                <p className="font-bold text-[14px] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">{app.name}</p>
                <p className="text-[11px] text-[var(--sub)] truncate">{app.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">特集・まとめ</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.slice(0, 6).map(f => (
            <Link key={f.slug} href={`/feature/${f.slug}`}
              className="card card-hover p-4 flex items-start gap-3 group">
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div className="min-w-0">
                <p className="font-bold text-[14px] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-1">{f.title}</p>
                <p className="text-[12px] text-[var(--sub)] line-clamp-2">{f.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">カテゴリから探す</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 14).map(c => (
            <Link key={c.id} href={`/category/${c.id}`}
              className="px-4 py-2 rounded-full bg-white border border-[var(--line)] text-sm text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-[13px] font-semibold text-[var(--sub)] uppercase tracking-wider mb-4">新着・更新</h2>
        <div className="space-y-3">
          {recent.map(s => <SettingCard key={`${s.os}-${s.slug}`} setting={s} />)}
        </div>
      </section>
    </div>
  );
}
