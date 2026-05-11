import { Mail, X, CheckCircle2, Copy, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@shared/lib/utils';
import type { UserRole } from '@shared/api/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  form: { email: string; role: UserRole };
  setForm: (f: { email: string; role: UserRole }) => void;
  allowedRoles: UserRole[];
  generatedLink: string | null;
  onSend: () => void;
  isSending: boolean;
}

export function InvitationSendModal({
  isOpen,
  onClose,
  form,
  setForm,
  allowedRoles,
  generatedLink,
  onSend,
  isSending
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card-surface rounded-2xl border-white/[0.1] shadow-2xl overflow-hidden animate-rise">
        <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
          <h2 className="text-lg font-bold">Invite New Member</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-[var(--color-text-muted)]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="p-6 space-y-5">
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
                onClick={onClose}
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
                    onChange={e => setForm({ ...form, email: e.target.value })}
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
                        onClick={() => setForm({ ...form, role: role as UserRole })}
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
                <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !form.role}
                  className="flex-1 py-2.5 text-sm font-bold bg-gradient-brand rounded-xl text-white shadow-glow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Yuborilmoqda...' : <><Send size={16} /> Taklifnoma yuborish</>}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
