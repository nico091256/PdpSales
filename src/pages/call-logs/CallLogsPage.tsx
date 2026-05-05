import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callsApi } from '@entities/call/api/callsApi';
import { callLogsApi } from '@entities/call-log/api/callLogsApi';
import { useAuthStore } from '@entities/auth';
import { 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  Search,
  ChevronRight,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { KpiCard } from '@shared/ui/KpiCard';

export default function CallLogsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const role = user?.role;
  const [isLogging, setIsLogging] = useState(false);
  const [form, setForm] = useState({ phone: '', note: '', outcome: 'Connected', meetingRequested: false });

  // Only CEO → /api/v1/calls (all managers)
  // ROP + SalesManager → /api/v1/calls/me (own data)
  const { data: summary, isLoading } = useQuery({
    queryKey: ['calls-summary', role],
    queryFn: () =>
      role === 'CEO'
        ? callsApi.getSummary()
        : callsApi.getMySummary(),
  });

  const logMutation = useMutation({
    mutationFn: callLogsApi.log,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls-summary'] });
      toast.success('Call logged successfully');
      setIsLogging(false);
      setForm({ phone: '', note: '', outcome: 'Connected', meetingRequested: false });
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast.error(`${status ? `[${status}] ` : ''}${detail || 'Failed to log call'}`);
    }
  });

  const handleExport = () => {
    if (!summary?.items?.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Successful', 'Follow-up', 'No Answer'];
    const rows = summary.items.map(item => [
      format(new Date(item.date), 'yyyy-MM-dd HH:mm'),
      item.successful,
      item.followUp,
      item.noAnswer
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `call_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Call logs exported successfully');
  };

  const stats = [
    { label: 'Total Calls', value: summary?.total || 0, icon: Phone, accent: 'primary' as const },
    { label: 'Successful', value: summary?.successful || 0, icon: CheckCircle2, accent: 'success' as const },
    { label: 'Follow-ups', value: summary?.followUp || 0, icon: Clock, accent: 'info' as const },
    { label: 'No Answer', value: summary?.noAnswer || 0, icon: XCircle, accent: 'danger' as const },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Call Analytics</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Track outreach efficiency and call outcomes.</p>
        </div>
        {/* Only SalesManager can log calls — CEO/ROP are read-only */}
        {role === 'SalesManager' && (
          <button
            onClick={() => setIsLogging(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow-soft hover:shadow-glow transition-all active:scale-[0.98]"
          >
            <Plus size={18} /> Log New Call
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <KpiCard 
            key={s.label}
            label={s.label}
            value={s.value.toLocaleString()}
            icon={s.icon}
            accent={s.accent}
            loading={isLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         {/* Call History / Feed */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold">Recent Activity</h3>
               <div className="flex gap-2">
                  <button 
                    onClick={handleExport}
                    className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold hover:text-[var(--color-accent)] transition-colors"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
                     <Search size={14} className="text-[var(--color-text-muted)]" />
                     <input placeholder="Filter activity..." className="bg-transparent text-xs outline-none w-32" />
                  </div>
                  <button className="glass p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white">
                     <BarChart3 size={16} />
                  </button>
               </div>
            </div>

            <div className="space-y-3">
               {summary?.items?.slice(0, 8).map((item) => (
                 <div key={item.id} className="card-surface group flex items-center gap-4 rounded-2xl p-4 border-white/[0.03] hover:border-white/[0.1] transition-all">
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      item.successful > 0 ? "bg-[var(--color-success-muted)] text-[var(--color-success)]" : "bg-white/5 text-[var(--color-text-muted)]"
                    )}>
                       <PhoneCall size={18} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold truncate">Call Log #{item.id.slice(-4)}</p>
                          <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md text-[var(--color-text-muted)]">
                             {format(new Date(item.date), 'HH:mm')}
                          </span>
                       </div>
                       <p className="text-xs text-[var(--color-text-secondary)]">
                          Outcome: <span className="font-medium text-[var(--color-text-primary)]">
                             {item.successful > 0 ? 'Success' : 'Attempted'}
                          </span>
                       </p>
                    </div>

                    <div className="text-right">
                       <p className="text-xs font-bold text-[var(--color-text-primary)]">System Auto-Logged</p>
                       <p className="text-[10px] text-[var(--color-text-muted)]">{format(new Date(item.date), 'MMM d')}</p>
                    </div>
                    
                    <ChevronRight size={16} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                 </div>
               ))}
               
               {(!summary?.items || summary.items.length === 0) && !isLoading && (
                 <div className="py-20 text-center glass rounded-2xl border-dashed border-white/10">
                    <Phone size={40} className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-20" />
                    <h3 className="text-lg font-medium">No calls logged yet</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Your call activity will appear here.</p>
                 </div>
               )}
            </div>
         </div>

         {/* Sidebar Stats Breakdown */}
         <div className="space-y-6">
            <div className="card-surface rounded-2xl p-6 border-white/[0.05]">
               <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-[var(--color-accent)]" /> Period Insights
               </h3>
               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between text-xs mb-2">
                        <span className="text-[var(--color-text-muted)]">Success Rate</span>
                        <span className="font-bold text-[var(--color-success)]">
                           {summary?.total ? Math.round((summary.successful / summary.total) * 100) : 0}%
                        </span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-[var(--color-success)]" 
                           style={{ width: `${summary?.total ? (summary.successful / summary.total) * 100 : 0}%` }}
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-1">Total Attempts</p>
                        <p className="text-lg font-bold">{summary?.total || 0}</p>
                     </div>
                     <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase mb-1">Callbacks</p>
                        <p className="text-lg font-bold">{summary?.followUp || 0}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="card-surface rounded-2xl p-6 bg-gradient-brand-soft border-none">
               <h3 className="text-sm font-bold mb-2">Log Daily Target</h3>
               <p className="text-[11px] text-[var(--color-text-secondary)] mb-4">
                  Manual entry for daily call statistics used in overall performance reports.
               </p>
               <button className="w-full py-2.5 rounded-xl bg-[var(--color-bg-primary)] text-white text-xs font-bold hover:bg-black transition-colors">
                  Open Quick Entry
               </button>
            </div>
         </div>
      </div>

      {/* Log Call Modal */}
      {isLogging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLogging(false)} />
          <div className="relative w-full max-w-md card-surface rounded-2xl border-white/[0.1] shadow-2xl overflow-hidden animate-rise">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
               <h2 className="text-lg font-bold">Log New Call</h2>
               <button onClick={() => setIsLogging(false)} className="p-1 hover:bg-white/5 rounded-lg text-[var(--color-text-muted)]">
                 <XCircle size={20} />
               </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); logMutation.mutate(form as any); }} className="p-6 space-y-4">
               <div>
                  <label className="label-eyebrow mb-1.5 block">Phone Number</label>
                  <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3">
                     <Phone size={16} className="text-[var(--color-text-muted)]" />
                     <input 
                        required
                        placeholder="+1 (555) 000-0000"
                        className="bg-transparent text-sm w-full outline-none"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                     />
                  </div>
               </div>
               
               <div>
                  <label className="label-eyebrow mb-1.5 block">Outcome</label>
                  <select 
                     className="w-full glass px-4 py-2.5 rounded-xl text-sm outline-none border-white/[0.05]"
                     value={form.outcome}
                     onChange={e => setForm({...form, outcome: e.target.value})}
                  >
                     <option>Connected</option>
                     <option>No Answer</option>
                     <option>Voicemail</option>
                     <option>Wrong Number</option>
                     <option>Interested</option>
                  </select>
               </div>
               
               <div>
                  <label className="label-eyebrow mb-1.5 block">Call Notes</label>
                  <textarea 
                    className="w-full glass px-4 py-2.5 rounded-xl text-sm outline-none min-h-[100px] border-white/[0.05]"
                    placeholder="Brief summary of the conversation..."
                    value={form.note}
                    onChange={e => setForm({...form, note: e.target.value})}
                  />
               </div>

               <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsLogging(false)} className="flex-1 py-2.5 text-sm font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                     Cancel
                  </button>
                  <button 
                     type="submit"
                     disabled={logMutation.isPending}
                     className="flex-1 py-2.5 text-sm font-bold bg-gradient-brand rounded-xl text-white shadow-glow-soft hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {logMutation.isPending ? 'Logging...' : 'Submit Log'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
