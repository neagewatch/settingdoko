import Link from 'next/link';
import { Setting } from '@/lib/supabase';
import { getOsInfo, DIFFICULTY_LABEL } from '@/lib/os';
import PathKeys from './PathKeys';

export default function SettingCard({ setting, order }: { setting: Setting; order?: number }) {
  const os = getOsInfo(setting.os);
  const diff = DIFFICULTY_LABEL[setting.difficulty];
  return (
    <Link
      href={`/setting/${setting.slug}`}
      className="card card-hover block p-5 group"
    >
      <div className="flex items-start gap-4">
        {order !== undefined && (
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-sm flex items-center justify-center mt-0.5">
            {order}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-[11px] px-2 py-0.5 rounded-md font-semibold border"
              style={{ color: os.color, borderColor: os.color + '38', backgroundColor: os.color + '0C' }}
            >
              {os.name}
            </span>
            {setting.version && <span className="text-[11px] text-[var(--sub)]">{setting.version}</span>}
            {diff && setting.difficulty !== 'beginner' && (
              <span className="text-[11px] font-medium" style={{ color: diff.color }}>{diff.label}</span>
            )}
          </div>
          <h3 className="font-bold text-[15px] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
            {setting.title}
          </h3>
          <div className="mb-2 overflow-hidden">
            <PathKeys path={setting.path} size="sm" />
          </div>
          {setting.description && (
            <p className="text-[13px] text-[var(--sub)] leading-relaxed line-clamp-2">{setting.description}</p>
          )}
        </div>
        <svg className="w-4 h-4 text-slate-300 group-hover:text-[var(--accent)] transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
