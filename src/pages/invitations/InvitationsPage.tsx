import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '@entities/invitation/api/invitationsApi';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { 
  Mail, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  UserPlus,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useInvitationSend } from '@features/invitation/send/model/useInvitationSend';
import { InvitationSendModal } from '@features/invitation/send/ui/InvitationSendModal';

export default function InvitationsPage() {
  const queryClient = useQueryClient();
  
  const {
    isOpen,
    open,
    close,
    form,
    setForm,
    allowedRoles,
    generatedLink,
    send,
    isSending
  } = useInvitationSend();

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: invitationsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: invitationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation revoked');
    },
    onError: () => toast.error('Failed to revoke invitation'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Team Invitations</h1>
           <p className="text-sm text-[var(--color-text-muted)]">Invite new members to join your organization.</p>
        </div>
        <button 
          onClick={open}
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

      <InvitationSendModal
        isOpen={isOpen}
        onClose={close}
        form={form}
        setForm={setForm}
        allowedRoles={allowedRoles}
        generatedLink={generatedLink}
        onSend={send}
        isSending={isSending}
      />
    </div>
  );
}
