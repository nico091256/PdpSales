import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@entities/dashboard';
import { useAuthStore } from '@entities/auth';
import { KpiCard } from '@shared/ui/KpiCard';
import { 
  DollarSign, 
  Users, 
  Phone, 
  TrendingUp, 
  Bell, 
  AlertTriangle, 
  CheckCircle2,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  // Dynamically select API based on role
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', role],
    queryFn: () => {
      if (role === 'CEO') return adminApi.getCeoDashboard();
      if (role === 'ROP') return adminApi.getRopDashboard() as any;
      if (role === 'SalesManager') return adminApi.getSalesManagerDashboard() as any;
      return adminApi.getCeoDashboard(); // fallback
    },
    enabled: !!role,
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-[var(--color-danger)] mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-[var(--color-text-muted)] max-w-md">
          There was a problem fetching your performance data. Please try again later or contact support.
        </p>
      </div>
    );
  }

  // --- Data Mapping Based on Role ---
  const dashboardData = data as any;
  const summary = dashboardData?.summary || dashboardData?.companySummary || dashboardData?.personalSummary;
  const metrics = dashboardData?.salesMetrics?.monthly || dashboardData?.salesMetrics?.daily || [];
  const alerts = dashboardData?.alerts?.latest || dashboardData?.recentAlerts || [];
  const ranking = dashboardData?.ranking?.items || [];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.fullName}</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Here is your {role} performance overview</p>
      </header>

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
          label={role === 'SalesManager' ? "Personal Target" : "Planned Target"} 
          value={formatCurrency(summary?.planTotal || 0)} 
          icon={Target}
          accent="primary"
        />
        <KpiCard 
          label="Calls Logged" 
          value={summary?.totalCalls?.toLocaleString() || '0'} 
          icon={Phone}
          accent="warning"
        />
        <KpiCard 
          label="Performance Score" 
          value={`${summary?.kpiScore || (data as any)?.kpiSummary?.averageScore?.value || 0}/100`} 
          icon={TrendingUp}
          accent="info"
        />
      </section>

      {/* Main Charts Section */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card-surface rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Performance Trend</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Sales trajectory vs targets</p>
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
                  dataKey="date" 
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

        {/* Ranking or Quick Stats */}
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold">
              {role === 'CEO' || role === 'ROP' ? 'Top Performers' : 'Personal Ranking'}
            </h3>
            <button className="text-xs text-[var(--color-accent)] hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {ranking.map((p: any, i: number) => (
              <div key={p.userId || i} className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs">
                  {p.fullName ? p.fullName[0] : (i+1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.fullName || 'Manager ' + (i+1)}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Rank: {p.rank || (i+1)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-success)]">{p.completionPercent || 0}%</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Score: {p.kpiScore || 0}</p>
                </div>
              </div>
            ))}
            
            {ranking.length === 0 && (
              <div className="py-10 text-center">
                <Users size={32} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-20" />
                <p className="text-sm text-[var(--color-text-muted)]">No ranking data</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Alerts */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[var(--color-accent)]" />
              <h3 className="text-base font-semibold">Recent Alerts</h3>
            </div>
            <span className="badge-count bg-[var(--color-danger)]">{alerts.length}</span>
          </div>
          
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <div className="p-2 rounded-lg bg-[var(--color-warning-muted)] text-[var(--color-warning)]">
                   <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5">{alert.title || alert.message}</p>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{alert.body || 'New alert notification'}</p>
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {alert.createdAtUtc ? format(new Date(alert.createdAtUtc), 'HH:mm') : 'Now'}
                </div>
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-[var(--color-success)] opacity-40" />
                <p className="text-sm text-[var(--color-text-muted)]">No new alerts</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-surface rounded-xl p-6">
          <h3 className="text-base font-semibold mb-6">Completion Progress</h3>
          <div className="w-full space-y-6">
             <div>
               <div className="flex justify-between text-xs mb-2">
                 <span className="text-[var(--color-text-secondary)] uppercase tracking-wider">Overall Progress</span>
                 <span className="font-bold">{summary?.completionPercent || 0}%</span>
               </div>
               <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-brand transition-all duration-1000" 
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
          </div>
        </div>
      </section>
    </div>
  );
}
