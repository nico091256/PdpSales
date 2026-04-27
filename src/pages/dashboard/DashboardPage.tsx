import { useQuery } from '@tanstack/react-query';
import { adminApi, CeoDashboardDto } from '@entities/dashboard';
import { KpiCard } from '@shared/ui/KpiCard';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Phone, 
  TrendingUp, 
  Bell, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@shared/lib/utils';

export default function DashboardPage() {
  const { data, isLoading } = useQuery<CeoDashboardDto>({
    queryKey: ['ceo-dashboard'],
    queryFn: adminApi.getCeoDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-xl" />
          <div className="h-[400px] bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  const summary = data?.companySummary;
  const metrics = data?.salesMetrics?.monthly || [];
  const topPerformers = data?.kpiSummary?.topPerformers || [];
  const recentAlerts = data?.recentAlerts || [];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard 
          label="Total Revenue (Fact)" 
          value={formatCurrency(summary?.factTotal || 0)} 
          delta={`${summary?.completionPercent || 0}% completion`}
          trend="up"
          icon={DollarSign}
          accent="success"
        />
        <KpiCard 
          label="Planned Target" 
          value={formatCurrency(summary?.planTotal || 0)} 
          icon={TrendingUp}
          accent="primary"
        />
        <KpiCard 
          label="Total Calls" 
          value={summary?.totalCalls?.toLocaleString() || '0'} 
          icon={Phone}
          accent="warning"
        />
        <KpiCard 
          label="Avg Team Score" 
          value={`${data?.kpiSummary?.averageScore?.value || 0}/100`} 
          icon={Users}
          accent="info"
        />
      </section>

      {/* Main Charts Section */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card-surface rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Revenue Performance</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Monthly trend: Plan vs Actual</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Plan
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" /> Fact
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-bg-card)', 
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="plan" 
                  stroke="var(--color-accent)" 
                  fillOpacity={1} 
                  fill="url(#colorPlan)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="fact" 
                  stroke="var(--color-success)" 
                  fillOpacity={1} 
                  fill="url(#colorFact)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold">Top Performers</h3>
            <button className="text-xs text-[var(--color-accent)] hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {topPerformers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs">
                    {p.fullName ? p.fullName[0] : 'U'}
                  </div>
                  {i === 0 && (
                    <div className="absolute -top-1 -right-1 bg-[var(--color-warning)] text-white rounded-full p-0.5 shadow-glow">
                      <TrendingUp size={8} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.fullName}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{p.region || 'Sales Team'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-success)]">{formatCurrency(p.revenue)}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Score: {p.score}</p>
                </div>
              </div>
            ))}
            
            {topPerformers.length === 0 && (
              <div className="py-10 text-center">
                <Users size={32} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-20" />
                <p className="text-sm text-[var(--color-text-muted)]">No performers yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Alerts & Quick Actions */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[var(--color-accent)]" />
              <h3 className="text-base font-semibold">Critical Alerts</h3>
            </div>
            <span className="badge-count bg-[var(--color-danger)]">{recentAlerts.filter(a => !a.isRead).length}</span>
          </div>
          
          <div className="space-y-3">
            {recentAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.08] transition-colors">
                <div className={cn(
                  "p-2 rounded-lg",
                  alert.severity === 'danger' ? "bg-[var(--color-danger-muted)] text-[var(--color-danger)]" : 
                  alert.severity === 'warning' ? "bg-[var(--color-warning-muted)] text-[var(--color-warning)]" : 
                  "bg-[var(--color-info-muted)] text-[var(--color-info)]"
                )}>
                  {alert.severity === 'danger' ? <AlertTriangle size={16} /> : <Info size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5">{alert.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{alert.body}</p>
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                  {format(new Date(alert.createdAt), 'HH:mm')}
                </div>
              </div>
            ))}
            
            {recentAlerts.length === 0 && (
              <div className="py-8 text-center bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-[var(--color-success)] opacity-40" />
                <p className="text-sm text-[var(--color-text-muted)]">System is stable. No alerts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for Department results or Plan vs Fact breakdown */}
        <div className="card-surface rounded-xl p-6">
          <h3 className="text-base font-semibold mb-6">Plan vs Fact Distribution</h3>
          <div className="flex items-center justify-center py-4">
             {/* Simple visual completion bar */}
             <div className="w-full space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[var(--color-text-secondary)] uppercase tracking-wider">Overall Completion</span>
                    <span className="font-bold">{summary?.completionPercent || 0}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-brand shadow-glow-soft transition-all duration-1000" 
                      style={{ width: `${Math.min(summary?.completionPercent || 0, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-1">Gap to Target</p>
                      <p className="text-xl font-bold text-[var(--color-danger)]">
                        {formatCurrency((summary?.planTotal || 0) - (summary?.factTotal || 0))}
                      </p>
                   </div>
                   <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-1">Forecast</p>
                      <p className="text-xl font-bold text-[var(--color-info)]">On Track</p>
                   </div>
                </div>
                
                <button className="w-full py-3 rounded-xl glass border-white/[0.05] text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  Generate Detailed PDF Report <ChevronRight size={16} />
                </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
