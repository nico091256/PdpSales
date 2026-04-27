import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2, Shield, Globe, Star, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@entities/auth/api/authApi';
import { useAuthStore } from '@entities/auth';
import { cn } from '@shared/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '', companySlug: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email va parolni kiriting');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login({
        email: form.email,
        password: form.password,
        companySlug: form.companySlug || undefined,
      });

      const accessToken = data.token ?? '';
      const refreshToken = data.refreshToken ?? '';

      setTokens(accessToken, refreshToken);
      if (data.user) setUser(data.user);

      toast.success('Xush kelibsiz!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } })
          ?.response?.data?.detail ??
        (err as { response?: { data?: { title?: string } } })
          ?.response?.data?.title ??
        'Login xatosi. Ma\'lumotlarni tekshiring.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)] overflow-hidden">
      {/* Immersive Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-[var(--color-accent)] opacity-20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] bg-[var(--color-accent-purple)] opacity-10 blur-[120px]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow animate-pulse-soft">
            <Zap size={22} className="text-white" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SalesPulse</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)] mb-6 animate-rise">
            <Star size={12} fill="currentColor" /> Premium Sales Operations
          </div>
          <h2 className="text-6xl font-black text-white leading-[1.1] mb-6 animate-rise" style={{ animationDelay: '0.1s' }}>
            Elevate Your <span className="gradient-brand-text">Performance</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-10 leading-relaxed animate-rise" style={{ animationDelay: '0.2s' }}>
            The next-generation dashboard for high-performing sales teams. 
            Track revenue, manage appointments, and dominate your market.
          </p>
          
          <div className="grid grid-cols-2 gap-6 animate-rise" style={{ animationDelay: '0.3s' }}>
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                   <Shield size={16} className="text-[var(--color-accent)]" /> Secure
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Enterprise-grade security and data encryption.</p>
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                   <Globe size={16} className="text-[var(--color-info)]" /> Global
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Multi-region support and localized analytics.</p>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
          <span>© 2026 SalesPulse Intelligence</span>
          <div className="flex gap-4">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Modern Right Panel (Login Form) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="absolute inset-0 lg:hidden bg-grid opacity-10" />
        
        <div className="w-full max-w-[420px] animate-rise">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
              <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-white">SalesPulse</span>
          </div>

          <div className="mb-10">
             <h2 className="text-3xl font-bold text-white mb-2">Login to Platform</h2>
             <p className="text-[var(--color-text-secondary)]">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="label-eyebrow">Company Workspace</label>
              <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/50 focus-within:ring-4 focus-within:ring-[var(--color-accent)]/10">
                 <Globe size={18} className="text-[var(--color-text-muted)]" />
                 <input 
                    type="text"
                    value={form.companySlug}
                    onChange={(e) => setForm((f) => ({ ...f, companySlug: e.target.value }))}
                    placeholder="your-company-slug"
                    className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-eyebrow">Email Address</label>
              <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/50 focus-within:ring-4 focus-within:ring-[var(--color-accent)]/10">
                 <Mail size={18} className="text-[var(--color-text-muted)]" />
                 <input 
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="name@company.com"
                    className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                 <label className="label-eyebrow">Password</label>
                 <a href="#" className="text-[11px] font-bold text-[var(--color-accent)] hover:underline">Forgot?</a>
              </div>
              <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 transition-all focus-within:border-[var(--color-accent)]/50 focus-within:ring-4 focus-within:ring-[var(--color-accent)]/10">
                 <Lock size={18} className="text-[var(--color-text-muted)]" />
                 <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPassword(!showPassword)}
                   className="text-[var(--color-text-muted)] hover:text-white transition-colors"
                 >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 rounded-2xl bg-gradient-brand text-white font-bold shadow-glow-soft hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
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
      </div>
    </div>
  );
}
