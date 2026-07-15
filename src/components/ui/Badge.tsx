import type { ReactNode } from 'react';

type Tone = 'brand' | 'green' | 'amber' | 'red' | 'gray';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 ring-brand-200/60 dark:ring-brand-800/40',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-emerald-200/60 dark:ring-emerald-800/40',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-amber-200/60 dark:ring-amber-800/40',
  red: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 ring-red-200/60 dark:ring-red-800/40',
  gray: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300 ring-gray-200/60 dark:ring-slate-700',
};

export function Badge({ tone = 'gray', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
