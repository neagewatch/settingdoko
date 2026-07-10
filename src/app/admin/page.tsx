import type { Metadata } from 'next';
import { fetchAllSettings } from '@/lib/data';
import { ALL_TARGETS, getOsInfo } from '@/lib/os';
import { getCategory } from '@/lib/data/index';

export const metadata: Metadata = {
  title: '管理画面',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const settings = await fetchAllSettings();
  const grouped: Record<string, typeof settings> = {};
  settings.forEach(s => { (grouped[s.os] ||= []).push(s); });

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-1">管理画面（データ一覧）</h1>
      <p className="text-[var(--sub)] text-sm mb-8">全{settings.length}件 — 追加・編集はSupabaseダッシュボードまたはシードSQLで行います</p>

      {ALL_TARGETS.map(t => {
        const items = grouped[t.id];
        if (!items?.length) return null;
        return (
          <section key={t.id} className="mb-8">
            <h2 className="font-bold text-[var(--ink)] mb-3">{t.name}（{items.length}件）</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--sub)]">
                    <th className="px-4 py-2.5 font-medium">タイトル</th>
                    <th className="px-4 py-2.5 font-medium">slug</th>
                    <th className="px-4 py-2.5 font-medium">カテゴリ</th>
                    <th className="px-4 py-2.5 font-medium">難易度</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(s => (
                    <tr key={s.slug} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-2.5 text-[var(--ink)]">{s.title}</td>
                      <td className="px-4 py-2.5 text-[var(--sub)] font-mono text-[12px]">{s.slug}</td>
                      <td className="px-4 py-2.5 text-[var(--sub)]">{getCategory(s.category)?.name || '-'}</td>
                      <td className="px-4 py-2.5 text-[var(--sub)]">{s.difficulty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
