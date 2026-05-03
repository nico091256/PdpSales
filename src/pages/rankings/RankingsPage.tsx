import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rankingsApi } from '@entities/ranking/api/rankingsApi';
import { 
  Crown, 
  Trophy, 
  ArrowUp, 
  ArrowDown
} from 'lucide-react';
import { cn } from '@shared/lib/utils';

export default function RankingsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ['rankings', period],
    queryFn: () => rankingsApi.getAll({ period }),
  });

  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);
  const top3 = sortedRankings.slice(0, 3);

  // Podium order: [2nd, 1st, 3rd]
  const podium = [
    { item: top3[1], place: 2, color: 'from-slate-400 to-slate-600', height: 'h-48' },
    { item: top3[0], place: 1, color: 'from-warning to-yellow-500', height: 'h-64' },
    { item: top3[2], place: 3, color: 'from-orange-500 to-orange-700', height: 'h-40' },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Performance Leaderboard</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Real-time rankings based on revenue and KPI metrics.</p>
        </div>
        <div className="flex rounded-xl glass p-1">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all",
                period === p 
                  ? "bg-gradient-brand text-white shadow-glow-soft" 
                  : "text-[var(--color-text-muted)] hover:text-white"
              )}
            >
              This {p}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Visualization */}
      {!isLoading && top3.length > 0 && (
        <div className="card-surface relative overflow-hidden rounded-2xl py-12 px-6 border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-radial from-[var(--color-accent)]/10 to-transparent opacity-40" />
          
          <div className="relative flex items-end justify-center gap-2 sm:gap-8 max-w-4xl mx-auto">
            {podium.map((p) => (
              p.item && (
                <div key={p.place} className="flex flex-col items-center w-full max-w-[100px] sm:max-w-[180px] animate-rise">
                  <div className="relative mb-4 sm:mb-6 text-center">
                    {p.place === 1 && (
                      <Crown 
                        className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 h-7 w-7 sm:h-10 sm:w-10 text-[var(--color-warning)] drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-float" 
                        fill="currentColor" 
                      />
                    )}
                    <div className={cn(
                      "relative h-12 w-12 sm:h-20 sm:w-20 rounded-full bg-gradient-brand p-0.5 sm:p-1 shadow-2xl mx-auto",
                      p.place === 1 && "h-16 w-16 sm:h-24 sm:w-24"
                    )}>
                      <div className="h-full w-full rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-sm sm:text-xl font-bold">
                        {p.item.name?.[0] || 'U'}
                      </div>
                    </div>
                    <h3 className="mt-2 sm:mt-4 text-[10px] sm:text-sm font-bold truncate px-1">{p.item.name}</h3>
                    <p className="text-[9px] sm:text-xs font-semibold text-[var(--color-success)]">{formatCurrency(p.item.revenue)}</p>
                  </div>
                  
                  <div className={cn(
                    "w-full rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b flex flex-col items-center justify-start pt-2 sm:pt-4 border-t border-white/20 shadow-2xl transition-all hover:brightness-110",
                    p.color,
                    p.height.replace('h-', 'h-24 sm:h-') // Default mobile height
                  )}>
                    <span className="text-2xl sm:text-4xl font-black opacity-30 sm:opacity-40 text-black">#{p.place}</span>
                    <Trophy className="mt-1 sm:mt-2 text-black/20 sm:text-black/30 h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="card-surface overflow-hidden rounded-2xl border-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                <th className="px-6 py-4 font-semibold w-16">Rank</th>
                <th className="px-6 py-4 font-semibold">Manager</th>
                <th className="px-6 py-4 font-semibold">Revenue</th>
                <th className="px-6 py-4 font-semibold hidden lg:table-cell">Appointments</th>
                <th className="px-6 py-4 font-semibold text-center">KPI Score</th>
                <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                 [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-white/[0.01]" />
                  </tr>
                ))
              ) : sortedRankings.map((m) => (
                <tr key={m.userId} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg font-black text-sm",
                      m.rank === 1 ? "bg-[var(--color-warning)] text-black" :
                      m.rank === 2 ? "bg-slate-400 text-black" :
                      m.rank === 3 ? "bg-orange-500 text-black" : "bg-white/5 text-[var(--color-text-secondary)]"
                    )}>
                      #{m.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-primary)] font-bold text-xs">
                        {m.name?.[0]}
                      </div>
                      <span className="font-semibold text-sm">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--color-text-primary)] tabular-nums">
                    {formatCurrency(m.revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm tabular-nums text-[var(--color-text-secondary)] hidden lg:table-cell">
                    {m.appointments} <span className="text-[10px] text-[var(--color-text-muted)]">meets</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className="text-sm font-bold text-[var(--color-accent)]">{m.score}</span>
                       <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="h-full bg-gradient-brand transition-all duration-700" 
                            style={{ width: `${m.score}%` }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex justify-end items-center gap-1">
                      {m.change > 0 ? (
                        <div className="flex items-center gap-1 text-[var(--color-success)] font-bold text-xs">
                           <ArrowUp size={12} /> {m.change}
                        </div>
                      ) : m.change < 0 ? (
                        <div className="flex items-center gap-1 text-[var(--color-danger)] font-bold text-xs">
                           <ArrowDown size={12} /> {Math.abs(m.change)}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)] text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
