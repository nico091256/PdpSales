import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@entities/user/api/usersApi';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  X, 
  MoreHorizontal,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', includeDeleted],
    queryFn: () => usersApi.getAll({ includeDeleted }),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: usersApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User restored successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setEditingUserId(null);
    },
    onError: () => {
      toast.error('Failed to update user');
    }
  });

  const handleSave = () => {
    if (!editingUserId) return;
    
    const fullName = (document.getElementById('edit-fullname') as HTMLInputElement)?.value;
    const role = (document.getElementById('edit-role') as HTMLSelectElement)?.value;
    const region = (document.getElementById('edit-region') as HTMLInputElement)?.value;
    
    updateMutation.mutate({
      id: editingUserId,
      data: { fullName, role, region }
    });
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleTone = (role?: string) => {
    switch (role) {
      case 'CEO': return 'primary';
      case 'ROP': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Users & Team</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Manage your organization members and their roles.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-soft hover:shadow-glow transition-all active:scale-[0.98]">
          <Plus size={18} /> Invite Team Member
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5 min-w-[300px] focus-within:border-[var(--color-accent)]/50 transition-colors">
          <Search size={18} className="text-[var(--color-text-muted)]" />
          <input 
            placeholder="Search by name, email or region..." 
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder-[var(--color-text-muted)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
          <Filter size={16} className="text-[var(--color-text-muted)]" />
          <select className="bg-transparent text-sm outline-none border-none pr-4">
             <option value="">All Roles</option>
             <option value="CEO">CEO</option>
             <option value="ROP">ROP</option>
             <option value="SalesManager">Sales Manager</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-white/5 transition-colors">
          <input 
            type="checkbox" 
            checked={includeDeleted} 
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-[var(--color-accent)]" 
          />
          <span className="text-sm text-[var(--color-text-secondary)]">Show Deleted</span>
        </label>
      </div>

      {/* Users Table */}
      <div className="card-surface overflow-hidden rounded-2xl border-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Region / Dept</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-white/[0.01]" />
                  </tr>
                ))
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className={cn(
                  "group transition-colors hover:bg-white/[0.02]",
                  user.isDeleted && "opacity-60"
                )}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-brand-soft flex items-center justify-center text-[var(--color-accent)] font-bold text-xs ring-1 ring-white/5">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          user.fullName?.[0] || 'U'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user.fullName}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={getRoleTone(user.role)}>
                      {user.role?.replace(/([A-Z])/g, ' $1').trim() || 'No Role'}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                       {user.region || '—'}
                       <p className="text-[11px] text-[var(--color-text-muted)]">{user.department || 'General'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] tabular-nums">
                    {format(new Date(user.createdAtUtc), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingUserId(user.id)}
                        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {user.isDeleted ? (
                        <button 
                          onClick={() => restoreMutation.mutate(user.id)}
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-muted)] transition-all"
                          title="Restore User"
                        >
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => deleteMutation.mutate(user.id)}
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      <button className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-white/5">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                      <Search size={32} className="text-[var(--color-text-muted)] opacity-20" />
                    </div>
                    <h3 className="text-lg font-medium">No users found</h3>
                    <p className="text-[var(--color-text-muted)]">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="flex items-center justify-between border-t border-white/[0.05] px-6 py-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Showing <span className="font-semibold text-[var(--color-text-secondary)]">{filteredUsers.length}</span> team members
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30" disabled>Previous</button>
            <button className="px-3 py-1 text-xs rounded-lg bg-[var(--color-accent)] text-white font-medium">1</button>
            <button className="px-3 py-1 text-xs rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Edit Drawer (Premium Slide-over) */}
      <div className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        editingUserId ? "opacity-100" : "pointer-events-none opacity-0"
      )}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUserId(null)} />
        <div className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md transform bg-[var(--color-bg-secondary)] shadow-2xl border-l border-white/[0.08] transition-transform duration-500 ease-out-expo",
          editingUserId ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <h2 className="text-lg font-semibold">User Details</h2>
              <button onClick={() => setEditingUserId(null)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--color-text-muted)] hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {/* Content for editing user */}
               <div className="flex flex-col items-center text-center pb-6 border-b border-white/[0.05]">
                  <div className="h-20 w-20 rounded-full bg-gradient-brand p-1 mb-4">
                     <div className="h-full w-full rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-2xl font-bold">
                        {users.find(u => u.id === editingUserId)?.fullName?.[0] || 'U'}
                     </div>
                  </div>
                  <h3 className="text-lg font-semibold">{users.find(u => u.id === editingUserId)?.fullName}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{users.find(u => u.id === editingUserId)?.email}</p>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="label-eyebrow">Full Name</label>
                    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                       <UserIcon size={16} className="text-[var(--color-text-muted)]" />
                       <input 
                          id="edit-fullname"
                          defaultValue={users.find(u => u.id === editingUserId)?.fullName} 
                          className="bg-transparent text-sm w-full outline-none" 
                        />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="label-eyebrow">Role</label>
                    <select 
                      id="edit-role"
                      defaultValue={users.find(u => u.id === editingUserId)?.role}
                      className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border-white/[0.08]"
                    >
                      <option value="CEO">CEO</option>
                      <option value="ROP">ROP</option>
                      <option value="SalesManager">Sales Manager</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="label-eyebrow">Region</label>
                    <input 
                      id="edit-region"
                      defaultValue={users.find(u => u.id === editingUserId)?.region || ''} 
                      className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none" 
                    />
                  </div>
               </div>
            </div>
            
            <div className="p-6 border-t border-white/[0.08] flex gap-3">
               <button onClick={() => setEditingUserId(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-medium hover:bg-white/5 transition-colors">
                 Cancel
               </button>
               <button 
                 onClick={handleSave}
                 disabled={updateMutation.isPending}
                 className="flex-1 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-soft disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
