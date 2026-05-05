import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '@entities/invitation/api/invitationsApi';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { 
  Mail, 
  Send, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  X,
  UserPlus,
  Shield,
  Copy
} from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InvitationsPage() {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [form, setForm] = useState<{ email: string; role: string }>({ email: '', role: '' });

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: invitationsApi.getAll,
  });

  const { data: allowedRolesData } = useQuery({
    queryKey: ['invitations', 'allowed-roles'],
    queryFn: invitationsApi.getAllowedRoles,
    staleTime: 5 * 60 * 1000,
  });
  const allowedRoles = allowedRolesData?.allowedRoles ?? ['SalesManager', 'ROP'];

  // Set default role once allowed roles are loaded
  const openModal = () => {
    setForm({ email: '', role: allowedRoles[0] ?? 'SalesManager' });
    setGeneratedLink(null);
    setIsSending(true);
  };

  const sendMutation = useMutation({
    mutationFn: invitationsApi.send,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      // Extract token from backend URL and build frontend accept-invite link
      try {
        const backendUrl = new URL(data.inviteLink);
        const token = backendUrl.searchParams.get('token');
        const frontendLink = token
          ? `${window.location.origin}/accept-invite?token=${token}`
          : data.inviteLink;
        setGeneratedLink(frontendLink);
      } catch {
        setGeneratedLink(data.inviteLink);
      }
      toast.success('Taklifnoma yaratildi');
    },
    onError: () => toast.error('Taklifnoma yuborishda xatolik yuz berdi'),
  });

  const deleteMutation = useMutation({
    mutationFn: invitationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation revoked');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Team Invitations</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Invite new members to join your organization.</p>
        </div>
        <button 
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow-soft hover:shadow-glow transition-all active:scale-[0.98]"
        >
          <UserPlus size={18} /> Invite New Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Active Invites Stats */}
        <div className="lg:col-span-1 space-y-4">
           <div className="card-surface p-6 rounded-2xl border-white/[0.05]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Summary</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">Pending</span>
                    <span className="text-sm font-bold">{invites.filter(i => i.status === 'Pending').length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">Expired</span>
                    <span className="text-sm font-bold">{invites.filter(i => i.status === 'Expired').length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">Accepted</span>
                    <span className="text-sm font-bold text-[var(--color-success)]">{invites.filter(i => i.usedAtUtc).length}</span>
                 </div>
              </div>
           </div>
           
           <div className="card-surface p-6 rounded-2xl border-none bg-gradient-brand-soft">
              <Shield size={24} className="text-[var(--color-accent)] mb-3" />
              <h4 className="text-sm font-bold mb-1">Secure Invitations</h4>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Invitation links are valid for 7 days. Only the intended recipient can use the link.
              </p>
           </div>
        </div>

        {/* Invitations Table */}
        <div className="lg:col-span-3 card-surface overflow-hidden rounded-2xl border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  <th className="px-6 py-4 font-semibold">Recipient</th>
                  <th className="px-6 py-4 font-semibold">Assigned Role</th>
                  <th className="px-6 py-4 font-semibold">Sent Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? (
                  [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-16 bg-white/[0.01]" />)
                ) : invites.map((invite) => (
                  <tr key={invite.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-muted)]">
                            <Mail size={16} />
                         </div>
                         <span className="text-sm font-medium">{invite.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={invite.role === 'CEO' ? 'primary' : invite.role === 'ROP' ? 'info' : 'neutral'}>
                        {invite.role}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] tabular-nums">
                      {format(new Date(invite.createdAtUtc), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {invite.usedAtUtc ? (
                         <div className="flex items-center gap-1.5 text-[var(--color-success)] text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={14} /> Accepted
                         </div>
                      ) : (
                         <div className="flex items-center gap-1.5 text-[var(--color-warning)] text-xs font-bold uppercase tracking-wider">
                            <Clock size={14} /> Pending
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {!invite.usedAtUtc && (
                         <button 
                           onClick={() => deleteMutation.mutate(invite.id)}
                           className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] transition-all"
                         >
                           <Trash2 size={16} />
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
                
                {!isLoading && invites.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-[var(--color-text-muted)]">
                       <Mail size={40} className="mx-auto mb-3 opacity-20" />
                       <p className="text-sm">No active invitations found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isSending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSending(false)} />
          <div className="relative w-full max-w-md card-surface rounded-2xl border-white/[0.1] shadow-2xl overflow-hidden animate-rise">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
               <h2 className="text-lg font-bold">Invite New Member</h2>
               <button onClick={() => setIsSending(false)} className="p-1 hover:bg-white/5 rounded-lg text-[var(--color-text-muted)]">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); sendMutation.mutate(form); }} className="p-6 space-y-5">
               {generatedLink ? (
                 <div className="space-y-4 py-2">
                    <div className="p-4 rounded-xl bg-[var(--color-success-muted)] border border-[var(--color-success)]/20 flex flex-col items-center text-center">
                       <div className="w-12 h-12 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center mb-3 shadow-glow-success">
                          <CheckCircle2 size={24} />
                       </div>
                       <h4 className="text-base font-bold text-white mb-1">Taklifnoma tayyor!</h4>
                       <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                         Ushbu havolani nusxalab, menejerga yuboring. U orqali xodim ro'yxatdan o'tishi mumkin.
                       </p>
                       
                       <div className="w-full flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                          <input 
                            readOnly 
                            value={generatedLink} 
                            className="bg-transparent text-[11px] text-[var(--color-text-muted)] flex-1 outline-none truncate"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedLink);
                              toast.success('Nusxalandi!');
                            }}
                            className="p-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                          >
                            <Copy size={14} />
                          </button>
                       </div>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsSending(false);
                        setGeneratedLink(null);
                        setForm({ email: '', role: 'SalesManager' });
                      }}
                      className="w-full py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      Yopish
                    </button>
                 </div>
               ) : (
                 <>
                   <div>
                      <label className="label-eyebrow mb-1.5 block">Email Address</label>
                      <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3">
                         <Mail size={16} className="text-[var(--color-text-muted)]" />
                         <input 
                            required
                            type="email"
                            placeholder="colleague@company.com"
                            className="bg-transparent text-sm w-full outline-none text-white"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                         />
                      </div>
                   </div>
                   
                   <div>
                       <label className="label-eyebrow mb-1.5 block">System Role</label>
                       {allowedRoles.length === 0 ? (
                         <p className="text-sm text-[var(--color-text-muted)] py-3 text-center">
                           Invite qilishga ruxsat yo'q
                         </p>
                       ) : (
                       <div className="grid grid-cols-1 gap-2">
                          {allowedRoles.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setForm({...form, role})}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                form.role === role 
                                  ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]/50" 
                                  : "glass border-white/5 hover:border-white/20"
                              )}
                            >
                              <div>
                                 <p className="text-sm font-bold">{role}</p>
                                 <p className="text-[10px] text-[var(--color-text-muted)]">
                                    {role === 'CEO' ? 'Full administrative access' : 
                                     role === 'ROP' ? 'Department management access' : 'Personal performance dashboard'}
                                 </p>
                              </div>
                              {form.role === role && <CheckCircle2 size={16} className="text-[var(--color-accent)]" />}
                            </button>
                          ))}
                       </div>
                       )}
                    </div>

                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsSending(false)} className="flex-1 py-2.5 text-sm font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                         Cancel
                      </button>
                      <button 
                         type="submit"
                         disabled={sendMutation.isPending || !form.role}
                         className="flex-1 py-2.5 text-sm font-bold bg-gradient-brand rounded-xl text-white shadow-glow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {sendMutation.isPending ? 'Yuborilmoqda...' : <><Send size={16} /> Taklifnoma yuborish</>}
                      </button>
                   </div>
                 </>
               )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
