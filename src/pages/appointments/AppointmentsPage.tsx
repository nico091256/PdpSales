import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@entities/appointment/api/appointmentsApi';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  MoreVertical, 
  LayoutGrid, 
  List,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { AppointmentStatus } from '@shared/api/types';

const columns: { status: AppointmentStatus; label: string; color: string }[] = [
  { status: 'Requested', label: 'Pending', color: 'bg-[var(--color-warning)]' },
  { status: 'Approved', label: 'Approved', color: 'bg-[var(--color-info)]' },
  { status: 'Completed', label: 'Completed', color: 'bg-[var(--color-success)]' },
  { status: 'Rejected', label: 'Rejected', color: 'bg-[var(--color-danger)]' },
];

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsApi.getAll(),
  });

  const approveMutation = useMutation({
    mutationFn: appointmentsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.reject(id, { reason: 'Schedule conflict' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment rejected');
    },
  });

  const handleExport = () => {
    if (!appointments.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Manager', 'Requested At', 'Status', 'Notes'];
    const rows = appointments.map(a => [
      a.salesManagerName || 'N/A',
      format(new Date(a.requestedAt), 'yyyy-MM-dd HH:mm'),
      a.status,
      (a.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Appointments exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Track and manage sales meetings and client interactions.</p>
        </div>
        <div className="flex gap-2 p-1 glass rounded-xl">
           <button 
             onClick={() => setView('kanban')}
             className={cn(
               "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
               view === 'kanban' ? "bg-gradient-brand text-white shadow-glow-soft" : "text-[var(--color-text-muted)] hover:text-white"
             )}
           >
             <LayoutGrid size={14} /> Kanban
           </button>
           <button 
             onClick={() => setView('table')}
             className={cn(
               "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
               view === 'table' ? "bg-gradient-brand text-white shadow-glow-soft" : "text-[var(--color-text-muted)] hover:text-white"
             )}
           >
             <List size={14} /> Table
           </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5 min-w-[240px]">
          <Search size={18} className="text-[var(--color-text-muted)]" />
          <input 
            placeholder="Search by manager or notes..." 
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/5 transition-colors text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/5 transition-colors text-sm ml-auto">
          <Filter size={16} /> Filters
        </button>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const columnItems = appointments.filter(a => a.status === col.status && (
              a.salesManagerName?.toLowerCase().includes(search.toLowerCase()) || 
              a.notes?.toLowerCase().includes(search.toLowerCase())
            ));
            
            return (
              <div key={col.status} className="flex flex-col min-w-[280px] h-full bg-white/[0.01] rounded-2xl border border-white/[0.03]">
                <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full shadow-glow", col.color)} />
                    <h3 className="text-sm font-bold tracking-tight uppercase">{col.label}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded-md text-[var(--color-text-muted)]">
                    {columnItems.length}
                  </span>
                </div>
                
                <div className="flex-1 p-3 space-y-3 min-h-[500px]">
                  {columnItems.map((item) => (
                    <div key={item.id} className="card-surface p-4 rounded-xl border-white/[0.05] hover:border-white/10 transition-all group animate-card-reveal">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
                              {item.salesManagerName?.[0] || 'U'}
                           </div>
                           <p className="text-xs font-bold truncate max-w-[100px]">{item.salesManagerName}</p>
                        </div>
                        <button className="text-[var(--color-text-muted)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                      
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4 italic">
                        "{item.notes || 'No notes provided...'}"
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                          <Clock size={12} />
                          <span>{format(new Date(item.requestedAt), 'MMM d, HH:mm')}</span>
                        </div>
                      </div>
                      
                      {item.status === 'Requested' && (
                        <div className="mt-4 flex gap-2 pt-4 border-t border-white/[0.05]">
                          <button 
                            onClick={() => approveMutation.mutate(item.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--color-success-muted)] text-[var(--color-success)] text-[11px] font-bold hover:brightness-110 transition-all"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => rejectMutation.mutate(item.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--color-danger-muted)] text-[var(--color-danger)] text-[11px] font-bold hover:brightness-110 transition-all"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!isLoading && columnItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                       <Calendar size={32} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface overflow-hidden rounded-2xl border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  <th className="px-6 py-4 font-semibold">Manager</th>
                  <th className="px-6 py-4 font-semibold">Requested At</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Notes</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {appointments.filter(a => 
                  a.salesManagerName?.toLowerCase().includes(search.toLowerCase()) || 
                  a.notes?.toLowerCase().includes(search.toLowerCase())
                ).map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">
                            {a.salesManagerName?.[0]}
                         </div>
                         <span className="text-sm font-medium">{a.salesManagerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm tabular-nums text-[var(--color-text-muted)]">
                      {format(new Date(a.requestedAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={
                        a.status === 'Requested' ? 'warning' : 
                        a.status === 'Approved' ? 'info' : 
                        a.status === 'Completed' ? 'success' : 'danger'
                      }>
                        {a.status}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] italic truncate max-w-xs">
                      {a.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)]">
                          <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
