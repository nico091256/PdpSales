import { KpiCard } from '@shared/ui/KpiCard';
import { DollarSign, Phone, TrendingUp, Target, Users, AlertTriangle } from 'lucide-react';
import type { RopDashboardDto } from '@shared/api/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props { data: RopDashboardDto; t: (k: string) => string }

const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function RopDashboard({ data, t }: Props) {
  const s = data.summary;
  const ranking = data.ranking?.items ?? [];
  const byManager = data.kpi?.byManager ?? [];
  const riskUsers = data.riskZone?.users ?? [];
  const callsByManager = data.calls?.byManager ?? [];

  const kpis = [
    { label: t('dashboard.kpi.totalRevenue'), value: fmt(s?.factTotal ?? 0), delta: `${s?.completionPercent ?? 0}%`, trend: 'up' as const, icon: DollarSign, accent: 'success' as const },
    { label: t('dashboard.kpi.target'), value: fmt(s?.planTotal ?? 0), icon: Target, accent: 'primary' as const },
    { label: t('dashboard.kpi.calls'), value: (s?.totalCalls ?? 0).toLocaleString(), icon: Phone, accent: 'warning' as const },
    { label: 'Team KPI Avg', value: `${data.kpi?.averageScore ?? 0}/100`, icon: TrendingUp, accent: 'info' as const },
  ];

  // Bar chart data from managers
  const chartData = byManager.slice(0, 8).map((m) => ({
    name: m.fullName?.split(' ')[0] ?? 'N/A',
    plan: m.plan,
    fact: m.fact,
    kpi: m.kpiScore,
  }));

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

      {/* Team Bar Chart */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card-surface card-hover rounded-2xl p-6 lg:col-span-2 animate-rise delay-180">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Team Plan vs Fact</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Per manager performance breakdown</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -10, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} width={48} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '10px', fontSize: '12px' }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Bar dataKey="plan" fill="var(--color-accent)" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fact" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">No manager data available</p>
            </div>
          )}
        </div>

        {/* Team Ranking */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-240">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{t('dashboard.section.topPerformers')}</h3>
            <Users size={16} className="text-[var(--color-text-muted)]" />
          </div>
          <div className="space-y-3">
            {ranking.slice(0, 6).map((p, i) => (
              <div key={p.userId} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-[var(--color-text-muted)]">#{p.rank}</span>
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
            {ranking.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">{t('dashboard.noRankingData')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Risk Zone + Calls */}
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
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{u.reason ?? 'Below threshold'}</p>
                </div>
                <span className="text-xs font-bold text-[var(--color-danger)] shrink-0">{u.completionPercent}%</span>
              </div>
            ))}
            {riskUsers.length === 0 && (
              <p className="text-sm text-[var(--color-success)] text-center py-8">✓ No managers at risk</p>
            )}
          </div>
        </div>

        {/* Calls by Manager */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-360">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-warning-muted)]">
              <Phone size={16} className="text-[var(--color-warning)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Calls by Manager</h3>
            <span className="ml-auto text-xs text-[var(--color-text-muted)]">Total: {data.calls?.total ?? 0}</span>
          </div>
          <div className="space-y-2.5">
            {callsByManager.slice(0, 5).map((m, i) => {
              const pct = data.calls?.total ? Math.round((m.calls / data.calls!.total) * 100) : 0;
              return (
                <div key={m.userId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)] truncate">{m.fullName ?? `Manager ${i + 1}`}</span>
                    <span className="font-bold text-[var(--color-text-primary)] shrink-0 ml-2">{m.calls}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-warning)] transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {callsByManager.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No call data</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
