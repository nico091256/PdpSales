import React from 'react';
import { cn } from '@shared/lib/utils';

export type StatusTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  dot?: boolean;
}

const toneStyles: Record<StatusTone, string> = {
  neutral: 'bg-white/5 text-[var(--color-text-secondary)] border-white/10',
  primary: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]/20',
  success: 'bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]/20',
  warning: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
  danger: 'bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
  info: 'bg-[var(--color-info-muted)] text-[var(--color-info)] border-[var(--color-info)]/20',
};

export function StatusBadge({ tone = 'neutral', dot, children, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full bg-current', tone === 'primary' && 'animate-pulse-soft')} />}
      {children}
    </span>
  );
}
