import { cn } from '@shared/lib/utils';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  icon: LucideIcon;
  accent?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
  loading?: boolean;
}

const accentMap = {
  primary: { bar: 'bg-[var(--color-accent)]', iconBg: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]', shadow: 'shadow-glow-soft' },
  success: { bar: 'bg-[var(--color-success)]', iconBg: 'bg-[var(--color-success-muted)] text-[var(--color-success)]', shadow: 'shadow-glow-success' },
  warning: { bar: 'bg-[var(--color-warning)]', iconBg: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]', shadow: 'shadow-glow-warning' },
  info: { bar: 'bg-[var(--color-info)]', iconBg: 'bg-[var(--color-info-muted)] text-[var(--color-info)]', shadow: 'shadow-glow-info' },
  danger: { bar: 'bg-[var(--color-danger)]', iconBg: 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]', shadow: 'shadow-glow-danger' },
};

export function KpiCard({
  label,
  value,
  delta,
  trend = 'up',
  icon: Icon,
  accent = 'primary',
  className,
  loading = false,
}: KpiCardProps) {
  const a = accentMap[accent];

  if (loading) {
    return (
      <div className={cn('card-surface shimmer-card rounded-xl p-6 h-[140px]', className)} />
    );
  }

  return (
    <div
      className={cn(
        'card-surface card-hover relative overflow-hidden rounded-xl p-6',
        className
      )}
    >
      <div className={cn('absolute left-0 top-0 h-full w-[3px]', a.bar)} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="label-eyebrow truncate">{label}</p>
          <p className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] tabular-nums animate-number">
            {value}
          </p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110', a.iconBg)}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      {delta && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {trend === 'up' ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-[var(--color-success-muted)] px-1.5 py-0.5 font-medium text-[var(--color-success)]">
              <ArrowUpRight size={14} /> {delta}
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-[var(--color-danger-muted)] px-1.5 py-0.5 font-medium text-[var(--color-danger)]">
              <ArrowDownRight size={14} /> {delta}
            </span>
          )}
          <span className="text-[var(--color-text-muted)]">vs last period</span>
        </div>
      )}
    </div>
  );
}
