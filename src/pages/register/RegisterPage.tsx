import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2 } from 'lucide-react';
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
    try {
      const data = await authApi.register(form);

      const accessToken = data.token ?? '';
      const refreshToken = data.refreshToken ?? '';

      setTokens(accessToken, refreshToken);
      if (data.user) setUser(data.user);

      toast.success('Hisob yaratildi! Xush kelibsiz.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })
          ?.response?.data?.detail ??
        (err as { response?: { data?: { title?: string } } })
          ?.response?.data?.title ??
        'Ro\'yxatdan o\'tishda xato. Qayta urinib ko\'ring.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 gradient-accent rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">SalesPulse</span>
        </div>

        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">Create account</h2>
        <p className="text-[var(--color-text-secondary)] mb-8">Set up your company workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="john@company.com"
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              Password <span className="text-[var(--color-text-muted)]">(min 6 chars)</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={set('companyName')}
              placeholder="Acme Corp"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <option value="CEO">CEO</option>
              <option value="ROP">ROP</option>
              <option value="SalesManager">Sales Manager</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg gradient-accent text-white text-[14px] font-semibold glow-accent hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
