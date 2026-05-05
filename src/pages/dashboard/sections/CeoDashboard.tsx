import { KpiCard } from '@shared/ui/KpiCard';
import { DollarSign, Users, Phone, TrendingUp, AlertTriangle, Target, ShieldAlert } from 'lucide-react';
import type { CeoDashboardDto } from '@shared/api/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface Props { data: CeoDashboardDto; t: (k: string) => string }

const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function CeoDashboard({ data, t }: Props) {
  const s = data.summary;
  const metrics = data.salesMetrics?.monthly ?? data.salesMetrics?.weekly ?? data.salesMetrics?.daily ?? [];
  const performers = data.kpi?.topPerformers ?? [];
  const lowPerformers = data.kpi?.lowPerformers ?? [];
  const riskUsers = data.riskZone?.users ?? [];
  const alerts = data.ranking?.items ?? [];

  const kpis = [
    { label: t('dashboard.kpi.totalRevenue'), value: fmt(s?.factTotal ?? 0), delta: `${s?.completionPercent ?? 0}%`, trend: 'up' as const, icon: DollarSign, accent: 'success' as const },
    { label: t('dashboard.kpi.target'), value: fmt(s?.planTotal ?? 0), icon: Target, accent: 'primary' as const },
    { label: t('dashboard.kpi.calls'), value: (s?.totalCalls ?? 0).toLocaleString(), icon: Phone, accent: 'warning' as const },
    { label: 'Managers at Risk', value: s?.managersAtRisk ?? 0, icon: ShieldAlert, accent: 'danger' as const },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`animate-rise delay-${i * 60}`}>
            <KpiCard label={k.label} value={k.value} delta={k.delta} trend={k.trend} icon={k.icon} accent={k.accent} />
          </div>
        ))}
      </section>

      {/* Chart + Ranking */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card-surface card-hover rounded-2xl p-6 lg:col-span-2 animate-rise delay-180">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{t('dashboard.chart.title')}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t('dashboard.chart.subtitle')}</p>
            </div>
            <div className="flex gap-4">
              {['plan','fact'].map((key, i) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-success)]'}`} />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{key}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ left: -10, right: 4 }}>
                <defs>
                  <linearGradient id="ceo-plan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ceo-fact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} width={48} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '10px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} fill="url(#ceo-plan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-240">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{t('dashboard.section.topPerformers')}</h3>
            <Users size={16} className="text-[var(--color-text-muted)]" />
          </div>
          <div className="space-y-3">
            {performers.slice(0, 5).map((p, i) => (
              <div key={p.userId} className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {p.fullName?.[0] ?? i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[var(--color-text-primary)]">{p.fullName ?? `Manager ${i + 1}`}</p>
                  <div className="mt-0.5 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(p.completionPercent, 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--color-success)] shrink-0">{p.completionPercent}%</span>
              </div>
            ))}
            {performers.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">{t('dashboard.noRankingData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Risk Zone + Low Performers */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Risk Zone */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-danger-muted)]">
              <AlertTriangle size={16} className="text-[var(--color-danger)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Risk Zone</h3>
            {riskUsers.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-danger-muted)] text-[var(--color-danger)]">
                {riskUsers.length}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {riskUsers.slice(0, 4).map((u) => (
              <div key={u.userId} className="flex items-center gap-3 rounded-xl bg-[var(--color-danger-muted)]/20 border border-[var(--color-danger)]/10 p-3">
                <div className="h-7 w-7 rounded-full bg-[var(--color-danger-muted)] flex items-center justify-center text-xs font-bold text-[var(--color-danger)]">
                  {u.fullName?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{u.fullName}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{u.reason ?? 'KPI below threshold'}</p>
                </div>
                <span className="text-xs font-bold text-[var(--color-danger)] shrink-0">{u.completionPercent}%</span>
              </div>
            ))}
            {riskUsers.length === 0 && (
              <p className="text-sm text-[var(--color-success)] text-center py-8">✓ No managers at risk</p>
            )}
          </div>
        </div>

        {/* KPI Summary */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-360">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-info-muted)]">
              <TrendingUp size={16} className="text-[var(--color-info)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Company KPI Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hover)]/50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Avg KPI Score</p>
              <p className="text-2xl font-bold text-[var(--color-accent)]">{data.kpi?.averageScore ?? 0}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hover)]/50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">At Risk Count</p>
              <p className="text-2xl font-bold text-[var(--color-danger)]">{data.kpi?.riskCount ?? 0}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--color-text-secondary)] uppercase tracking-wider">Overall Completion</span>
              <span className="font-bold text-[var(--color-text-primary)]">{s?.completionPercent ?? 0}%</span>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-brand rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(s?.completionPercent ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
