import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Globe, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '../model/useLogin';

export function LoginForm() {
  const { form, setForm, loading, login } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[420px] animate-rise">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Login to Platform</h2>
        <p className="text-[var(--color-text-secondary)]">Enter your credentials to access your dashboard</p>
      </div>

      <form onSubmit={login} className="space-y-5">
        <div className="space-y-2">
          <label className="label-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>Company Workspace</label>
          <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
            <Globe size={17} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              type="text"
              value={form.companySlug}
              onChange={(e) => setForm((f) => ({ ...f, companySlug: e.target.value }))}
              placeholder="your-company-slug"
              className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>Email Address</label>
          <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
            <Mail size={17} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="name@company.com"
              className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="label-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>Password</label>
            <a href="#" className="text-[12px] font-bold text-[var(--color-accent)] hover:underline">Forgot?</a>
          </div>
          <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.07)' }} className="rounded-full px-5 py-3.5 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/40 focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15">
            <Lock size={17} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••••••"
              className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 rounded-full bg-gradient-brand text-white font-bold shadow-glow-soft hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enter Dashboard'}
        </button>
      </form>

      <div className="mt-10 pt-10 border-t border-white/[0.05] text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Don't have an account yet? <Link to="/register" className="text-white font-bold hover:underline">Create Workspace</Link>
        </p>
      </div>
    </div>
  );
}
