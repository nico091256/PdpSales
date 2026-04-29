import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2, User, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { invitationsApi } from '@entities/invitation/api/invitationsApi';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Yaroqsiz yoki muddati o\'tgan taklifnoma');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.password) {
      toast.error('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Parollar mos kelmadi');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      await invitationsApi.accept({
        token: token!,
        password: form.password,
        fullName: form.fullName,
      });

      setSuccess(true);
      toast.success('Tabriklaymiz! Hisobingiz faollashtirildi.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? 'Taklifnomani qabul qilishda xatolik yuz berdi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg-primary)]">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="w-20 h-20 bg-[var(--color-success-muted)] text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-success">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
          <p className="text-[var(--color-text-secondary)]">
            Your account has been created. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow-soft">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">SalesPulse</span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-1">Complete your profile</h2>
        <p className="text-[var(--color-text-secondary)] mb-8">Join your team and start tracking performance</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-eyebrow mb-1.5 block">Full Name</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <User size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="text"
                  placeholder="Your full name"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
               />
            </div>
          </div>

          <div>
            <label className="label-eyebrow mb-1.5 block">Create Password</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <Lock size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
               />
            </div>
          </div>

          <div>
            <label className="label-eyebrow mb-1.5 block">Confirm Password</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <Lock size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})}
               />
            </div>
          </div>

          <button 
             type="submit"
             disabled={loading}
             className="w-full py-3.5 mt-4 rounded-xl bg-gradient-brand text-white font-bold shadow-glow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
             {loading ? <Loader2 className="animate-spin" size={20} /> : 'Activate Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
          By activating your account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
