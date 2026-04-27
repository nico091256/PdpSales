import { Bell, Search, ChevronDown, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@entities/auth';
import { cn, getInitials } from '@shared/lib/utils';

const pageTitles: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'Dashboard', crumb: 'Overview / Dashboard' },
  '/rankings': { title: 'Performance Rankings', crumb: 'Overview / Rankings' },
  '/users': { title: 'Users & Team Management', crumb: 'Management / Users' },
  '/appointments': { title: 'Appointments', crumb: 'Management / Appointments' },
  '/call-logs': { title: 'Call Logs', crumb: 'Management / Call Logs' },
  '/alerts': { title: 'System Alerts', crumb: 'Operations / Alerts' },
  '/invitations': { title: 'Team Invitations', crumb: 'Operations / Invitations' },
  '/profile': { title: 'My Profile', crumb: 'Settings / Profile' },
  '/settings': { title: 'System Settings', crumb: 'Settings / General' },
};

export function Header() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const meta = pageTitles[location.pathname] ?? { title: 'Dashboard', crumb: 'Overview' };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/70 px-6 backdrop-blur-xl">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">{meta.title}</h1>
        <p className="truncate text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{meta.crumb}</p>
      </div>

      <div className="mx-auto hidden w-full max-w-md md:block">
        <div className="glass flex items-center gap-2 rounded-lg px-3 py-2 transition-all focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)]/30">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            placeholder="Search managers, appointments, contacts…"
            className="w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
          />
          <kbd className="hidden rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)] sm:inline">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="glass hidden items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] md:flex">
          <Calendar size={14} />
          <span>Apr 1 – Apr 28</span>
          <ChevronDown size={12} />
        </button>

        <button className="relative rounded-lg p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]">
          <Bell size={20} className="animate-shake" />
          <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5 rounded-full bg-[var(--color-danger)] animate-pulse-soft" />
        </button>

        <div className="h-8 w-px bg-[var(--color-border)] mx-1" />

        <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand font-bold text-white text-[11px]">
            {user?.fullName ? getInitials(user.fullName) : 'U'}
          </div>
          <span className="hidden text-sm font-medium text-[var(--color-text-primary)] md:block">
            {user?.fullName?.split(' ')[0] ?? 'User'}
          </span>
          <ChevronDown size={14} className="hidden text-[var(--color-text-muted)] md:block" />
        </button>
      </div>
    </header>
  );
}
