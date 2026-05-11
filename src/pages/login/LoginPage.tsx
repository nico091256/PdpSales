import { Zap, Shield, Globe, Star } from 'lucide-react';
import { LoginForm } from '@features/auth/login/ui/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: '#0F1117', backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.14), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.10), transparent)' }}>
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
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)] mb-6 animate-rise"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <Star size={11} fill="currentColor" /> Premium Sales Operations
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
        
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
              <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-white">SalesPulse</span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
