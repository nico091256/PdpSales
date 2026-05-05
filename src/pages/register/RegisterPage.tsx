import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2, User, Mail, Lock, Building2, ChevronDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@entities/auth/api/authApi';
import { useAuthStore } from '@entities/auth';
import { UserRole } from '@shared/api/types';

// Reusable pill input wrapper style
const pillField = {
  background: '#1a1d27',
  border: '1px solid rgba(255,255,255,0.07)',
} as React.CSSProperties;

const labelStyle = {
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.12em',
} as React.CSSProperties;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    role: 'CEO' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || !form.companyName) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Parollar mos kelmadi');
      return;
    }
    if (form.password.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        role: form.role,
      });

      const accessToken = data.token ?? '';
      const refreshToken = data.refreshToken ?? '';

      setTokens(accessToken, refreshToken);
      if (data.user) setUser(data.user);

      toast.success('Hisob yaratildi! Xush kelibsiz.');
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const errorData = err.response?.data;
      let msg = "Ro'yxatdan o'tishda xato yuz berdi.";

      if (errorData) {
        msg = errorData.detail || errorData.title || errorData.message || msg;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          if (Array.isArray(firstError)) msg = firstError[0] as string;
        }
      } else if (err.message) {
        msg = err.message;
      }

      toast.error(`${status ? `[${status}] ` : ''}${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundColor: '#0F1117',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.14), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.10), transparent)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] h-[40%] w-[40%] bg-[var(--color-accent)] opacity-10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] bg-[var(--color-accent-purple)] opacity-10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] animate-rise relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center sm:justify-start">
          <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow animate-pulse-soft">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SalesPulse</span>
        </div>

        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-white mb-2">Create Workspace</h2>
          <p className="text-[var(--color-text-secondary)]">Set up your company dashboard in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Full Name + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="label-eyebrow" style={labelStyle}>Full Name</label>
              <div style={pillField} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
                <User size={17} className="text-[var(--color-text-muted)] shrink-0" />
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="bg-transparent text-sm w-full outline-none text-white placeholder-white/25"
                  value={form.fullName}
                  onChange={set('fullName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-eyebrow" style={labelStyle}>Company Name</label>
              <div style={pillField} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
                <Building2 size={17} className="text-[var(--color-text-muted)] shrink-0" />
                <input
                  required
                  type="text"
                  placeholder="Acme Corp"
                  className="bg-transparent text-sm w-full outline-none text-white placeholder-white/25"
                  value={form.companyName}
                  onChange={set('companyName')}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="label-eyebrow" style={labelStyle}>Email Address</label>
            <div style={pillField} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
              <Mail size={17} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                required
                type="email"
                placeholder="john@company.com"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-white/25"
                value={form.email}
                onChange={set('email')}
              />
            </div>
          </div>

          {/* Row 2: Password + Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="label-eyebrow" style={labelStyle}>Password</label>
              <div style={pillField} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
                <Lock size={17} className="text-[var(--color-text-muted)] shrink-0" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-transparent text-sm w-full outline-none text-white placeholder-white/25"
                  value={form.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--color-text-muted)] hover:text-white transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-eyebrow" style={labelStyle}>Confirm Password</label>
              <div style={pillField} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
                <Lock size={17} className="text-[var(--color-text-muted)] shrink-0" />
                <input
                  required
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-transparent text-sm w-full outline-none text-white placeholder-white/25"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-[var(--color-text-muted)] hover:text-white transition-colors shrink-0"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="label-eyebrow" style={labelStyle}>Organization Role</label>
            <div className="relative">
              <select
                value={form.role}
                onChange={set('role')}
                style={{ ...pillField }}
                className="w-full px-5 py-3.5 rounded-full text-sm text-white outline-none focus:border-[var(--color-accent)]/40 focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-all cursor-pointer appearance-none"
              >
                <option value="CEO">CEO / Founder</option>
                <option value="ROP">ROP / Head of Sales</option>
                <option value="SalesManager">Sales Manager</option>
              </select>
              <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 rounded-full bg-gradient-brand text-white font-bold shadow-glow-soft hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Create Account
                <TrendingUp size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
