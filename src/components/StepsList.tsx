import Image from 'next/image';
import { Step } from '@/lib/supabase';
import CopyButton from './CopyButton';

export default function StepsList({ steps, title }: { steps: Step[]; title: string }) {
  const plain = steps.map((s, i) => `${i + 1}. ${s.text}`).join('\n');
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--sub)] uppercase tracking-wider">手順</h2>
        <CopyButton text={`【${title}】\n${plain}`} label="📋 手順をコピー" />
      </div>
      <ol className="space-y-0">
        {steps.map((step, i) => (
          <li key={i} className="relative flex gap-4 items-start pb-5 last:pb-0">
            {/* 縦の接続線 */}
            {i < steps.length - 1 && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--line)]" aria-hidden />
            )}
            <span className="relative z-10 flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent)] text-white text-sm font-bold flex items-center justify-center shadow-sm">
              {i + 1}
            </span>
            <div className="flex-1 pt-1 min-w-0">
              <p className="text-[15px] text-[var(--ink)] leading-relaxed">{step.text}</p>
              {step.image_url && (
                <div className="mt-3 rounded-xl overflow-hidden border border-[var(--line)] bg-slate-50 max-w-lg">
                  <Image
                    src={step.image_url}
                    alt={`手順 ${i + 1}: ${step.text}`}
                    width={640} height={360}
                    className="w-full h-auto object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
