import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2, User, Mail, Lock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@entities/auth/api/authApi';
import { useAuthStore } from '@entities/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    role: 'CEO',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.companyName) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    console.log('--- REGISTRATION ATTEMPT ---');
    console.log('Sending data:', form);
    
    try {
      const data = await authApi.register(form);

      const accessToken = data.token ?? '';
      const refreshToken = data.refreshToken ?? '';

      setTokens(accessToken, refreshToken);
      if (data.user) setUser(data.user);

      toast.success('Hisob yaratildi! Xush kelibsiz.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? 'Ro\'yxatdan o\'tishda xato yuz berdi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow-soft">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">SalesPulse</span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-1">Create account</h2>
        <p className="text-[var(--color-text-secondary)] mb-8">Set up your company workspace today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-eyebrow mb-1.5 block">Full Name</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <User size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.fullName}
                  onChange={set('fullName')}
               />
            </div>
          </div>

          <div>
            <label className="label-eyebrow mb-1.5 block">Email Address</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <Mail size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="email"
                  placeholder="john@company.com"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.email}
                  onChange={set('email')}
               />
            </div>
          </div>

          <div>
            <label className="label-eyebrow mb-1.5 block">Password</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <Lock size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.password}
                  onChange={set('password')}
               />
            </div>
          </div>

          <div>
            <label className="label-eyebrow mb-1.5 block">Company Name</label>
            <div className="glass px-4 py-2.5 rounded-xl flex items-center gap-3 border-white/5 focus-within:border-[var(--color-accent)]/50 transition-all">
               <Building2 size={18} className="text-[var(--color-text-muted)]" />
               <input 
                  required
                  type="text"
                  placeholder="Acme Corp"
                  className="bg-transparent text-sm w-full outline-none text-white"
                  value={form.companyName}
                  onChange={set('companyName')}
               />
            </div>
          </div>

          <div>
            <label className="label-eyebrow mb-1.5 block">Role</label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full px-4 py-2.5 rounded-xl glass border-white/5 text-sm text-white outline-none focus:border-[var(--color-accent)]/50 transition-all cursor-pointer"
            >
              <option value="CEO">CEO</option>
              <option value="ROP">ROP</option>
              <option value="SalesManager">Sales Manager</option>
            </select>
          </div>

          <button 
             type="submit"
             disabled={loading}
             className="w-full py-3.5 mt-4 rounded-xl bg-gradient-brand text-white font-bold shadow-glow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
             {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
