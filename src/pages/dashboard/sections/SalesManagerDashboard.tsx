import { KpiCard } from '@shared/ui/KpiCard';
import { DollarSign, Phone, TrendingUp, Target, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { SalesManagerDashboardDto } from '@shared/api/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { format } from 'date-fns';

interface Props { data: SalesManagerDashboardDto; t: (k: string) => string }

const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function SalesManagerDashboard({ data, t }: Props) {
  const s = data.summary;
  const pvf = data.planVsFact;
  const kpi = data.kpi;
  const alerts = data.alerts?.latest ?? [];
  const trendData = pvf?.trend ?? [];
  const kpiComponents = kpi?.components ?? [];

  const kpis = [
    { label: t('dashboard.kpi.personalTarget'), value: fmt(s?.factTotal ?? 0), delta: `${s?.completionPercent ?? 0}%`, trend: 'up' as const, icon: DollarSign, accent: 'success' as const },
    { label: t('dashboard.kpi.target'), value: fmt(s?.planTotal ?? 0), icon: Target, accent: 'primary' as const },
    { label: t('dashboard.kpi.calls'), value: (s?.totalCalls ?? 0).toLocaleString(), icon: Phone, accent: 'warning' as const },
    { label: t('dashboard.kpi.score'), value: `${kpi?.score ?? s?.kpiScore ?? 0}/100`, icon: TrendingUp, accent: 'info' as const },
  ];

  const riskColor = s?.riskLevel === 'Critical' ? 'danger' : s?.riskLevel === 'Warning' ? 'warning' : 'success';

  return (
    <div className="space-y-6">
      {/* Risk Badge */}
      {s?.riskLevel && s.riskLevel !== 'Safe' && (
        <div className={`animate-rise delay-0 flex items-center gap-3 rounded-xl p-4 border ${
          riskColor === 'danger'
            ? 'bg-[var(--color-danger-muted)]/30 border-[var(--color-danger)]/20'
            : 'bg-[var(--color-warning-muted)]/30 border-[var(--color-warning)]/20'
        }`}>
          <AlertTriangle size={18} className={riskColor === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'} />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Risk Level: <strong className={riskColor === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}>{s.riskLevel}</strong>
            {' — '}{fmt(s?.gapToPlan ?? 0)} gap to plan
          </p>
        </div>
      )}

      {/* KPI Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`animate-rise delay-${i * 60}`}>
            <KpiCard label={k.label} value={k.value} delta={k.delta} trend={k.trend} icon={k.icon} accent={k.accent} />
          </div>
        ))}
      </section>

      {/* Trend Chart + KPI Radar */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Trend Chart */}
        <div className="card-surface card-hover rounded-2xl p-6 lg:col-span-2 animate-rise delay-180">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Personal Sales Trend</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Daily performance progress</p>
          </div>
          {trendData.length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ left: -10, right: 4 }}>
                  <defs>
                    <linearGradient id="sm-trend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} width={48} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '10px', fontSize: '12px' }} formatter={(v: number) => fmt(v)} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} fill="url(#sm-trend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)]">No trend data yet</p>
            </div>
          )}
        </div>

        {/* KPI Components / Radar */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-240">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">KPI Breakdown</h3>
          {kpiComponents.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={kpiComponents.map((c) => ({ subject: c.name ?? 'KPI', score: c.score, fullMark: 100 }))}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm text-[var(--color-text-muted)] text-center">No KPI components</p>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-xs text-[var(--color-text-muted)]">Overall Score</span>
            <span className="text-lg font-bold text-[var(--color-accent)]">{kpi?.score ?? 0}/100</span>
          </div>
        </div>
      </section>

      {/* Plan vs Fact + Alerts */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Plan vs Fact */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-300">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">Plan vs Fact</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[var(--color-text-secondary)] uppercase tracking-wider">Completion</span>
                <span className="font-bold text-[var(--color-text-primary)]">{pvf?.completionPercent ?? s?.completionPercent ?? 0}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(pvf?.completionPercent ?? s?.completionPercent ?? 0, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hover)]/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Plan</p>
                <p className="text-lg font-bold text-[var(--color-accent)]">{fmt(pvf?.planTotal ?? s?.planTotal ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hover)]/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Fact</p>
                <p className="text-lg font-bold text-[var(--color-success)]">{fmt(pvf?.factTotal ?? s?.factTotal ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hover)]/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Gap</p>
                <p className="text-lg font-bold text-[var(--color-danger)]">{fmt(pvf?.gapToPlan ?? s?.gapToPlan ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-hover)]/50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Calls</p>
                <p className="text-lg font-bold text-[var(--color-warning)]">{s?.totalCalls ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card-surface card-hover rounded-2xl p-6 animate-rise delay-360">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-warning-muted)]">
                <Bell size={16} className="text-[var(--color-warning)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{t('dashboard.section.alerts')}</h3>
            </div>
            {(data.alerts?.unreadCount ?? 0) > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--color-danger)] text-white">
                {data.alerts!.unreadCount}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-xl bg-[var(--color-warning-muted)]/30 border border-[var(--color-warning)]/10 p-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug">{alert.message ?? 'Alert'}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {alert.createdAtUtc ? format(new Date(alert.createdAtUtc), 'HH:mm') : 'Now'} · {alert.severity}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-2 text-[var(--color-success)] opacity-40" />
                <p className="text-sm text-[var(--color-text-muted)]">{t('dashboard.noAlerts')}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
