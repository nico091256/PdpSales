import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@entities/alert/api/alertsApi';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', unreadOnly],
    queryFn: () => alertsApi.getMyAlerts({ unreadOnly }),
  });

  const markReadMutation = useMutation({
    mutationFn: alertsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: alertsApi.generateCeo,
    onMutate: () => setIsGenerating(true),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`Generated ${result.generated || 0} new alerts for CEO`);
    },
    onError: () => toast.error('Failed to generate alerts'),
    onSettled: () => setIsGenerating(false),
  });

  const getSeverityIcon = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'danger': return <AlertTriangle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getSeverityStyles = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'danger': return 'border-glow-danger bg-[var(--color-danger-muted)] text-[var(--color-danger)]';
      case 'warning': return 'border-glow-warning bg-[var(--color-warning-muted)] text-[var(--color-warning)]';
      default: return 'border-glow-info bg-[var(--color-info-muted)] text-[var(--color-info)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">System Alerts</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Automatic performance signals and system notifications.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => generateMutation.mutate({})}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} className="text-[var(--color-accent)]" />}
            Generate Signals
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-soft hover:shadow-glow transition-all">
            <Bell size={18} /> Configure Rules
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5 min-w-[240px]">
          <Search size={18} className="text-[var(--color-text-muted)]" />
          <input placeholder="Search in alerts..." className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none" />
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
          <Filter size={16} className="text-[var(--color-text-muted)]" />
          <select className="bg-transparent text-sm outline-none border-none">
             <option>All Severities</option>
             <option>Danger</option>
             <option>Warning</option>
             <option>Info</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/5 transition-colors">
          <input 
            type="checkbox" 
            checked={unreadOnly} 
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-[var(--color-accent)]" 
          />
          <span className="text-sm text-[var(--color-text-secondary)]">Unread Only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center rounded-2xl py-20 text-center border-dashed border-white/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
            <CheckCircle2 size={32} className="text-[var(--color-success)]" />
          </div>
          <h3 className="text-lg font-semibold">System Clear</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">No active alerts to review at this moment.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li 
              key={alert.id} 
              className={cn(
                "card-surface relative flex items-start gap-4 overflow-hidden rounded-2xl p-5 border-l-4 transition-all hover:translate-x-1",
                alert.severity === 'Danger' ? "border-l-[var(--color-danger)]" : 
                alert.severity === 'Warning' ? "border-l-[var(--color-warning)]" : "border-l-[var(--color-info)]",
                !alert.isRead && "bg-white/[0.04] border-white/[0.08]"
              )}
            >
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", getSeverityStyles(alert.severity))}>
                {getSeverityIcon(alert.severity)}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold tracking-tight">{alert.title}</h3>
                  {!alert.isRead && <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse-soft" />}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{alert.message}</p>
                <p className="mt-3 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-bold">
                  {format(new Date(alert.createdAtUtc), 'MMM d, yyyy · HH:mm')}
                </p>
              </div>

              {!alert.isRead && (
                <button 
                  onClick={() => markReadMutation.mutate(alert.id)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white transition-all"
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
