import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Phone,
  Bell,
  Trophy,
  Users,
  Mail,
  Settings,
  User,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn, getInitials } from '@shared/lib/utils';
import { useAuthStore } from '@entities/auth';
import toast from 'react-hot-toast';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavLinkItem {
  to: string;
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  badge?: string;
  dot?: boolean;
  roles?: string[]; // Allowed roles for this link
}

const navItems: { section: string; links: NavLinkItem[] }[] = [
  {
    section: 'Overview',
    links: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/rankings', icon: Trophy, label: 'Rankings', roles: ['CEO', 'ROP', 'SalesManager'] },
    ],
  },
  {
    section: 'Management',
    links: [
      { to: '/users', icon: Users, label: 'Users', roles: ['CEO', 'ROP'] },
      { to: '/appointments', icon: Calendar, label: 'Appointments', roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/call-logs', icon: Phone, label: 'Call Logs', roles: ['CEO', 'ROP', 'SalesManager'] },
    ],
  },
  {
    section: 'Operations',
    links: [
      { to: '/alerts', icon: Bell, label: 'Alerts', dot: true, roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/invitations', icon: Mail, label: 'Invitations', roles: ['CEO', 'ROP'] },
    ],
  },
  {
    section: 'Settings',
    links: [
      { to: '/settings', icon: Settings, label: 'Settings', roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/profile', icon: User, label: 'Profile', roles: ['CEO', 'ROP', 'SalesManager'] },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const role = user?.role || 'SalesManager';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Xush qoling!');
    navigate('/login');
  };

  // Filter items based on user role
  const filteredNavItems = navItems.map(section => ({
    ...section,
    links: section.links.filter(link => !link.roles || link.roles.includes(role))
  })).filter(section => section.links.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] transition-all duration-300 ease-in-out',
        'lg:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        isMobileOpen && 'w-[260px] translate-x-0'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-5',
        collapsed && !isMobileOpen && 'justify-center px-0'
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-soft animate-pulse-soft">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </div>
        {(!collapsed || isMobileOpen) && (
          <div className="flex flex-1 items-center justify-between">
            <span className="text-[16px] font-bold tracking-tight text-[var(--color-text-primary)]">SalesPulse</span>
            <button 
              onClick={isMobileOpen ? onMobileClose : onToggle} 
              className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              {isMobileOpen ? <X size={18} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        )}
      </div>

      {collapsed && !isMobileOpen && (
        <button onClick={onToggle} className="mx-auto mt-3 rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-primary)]">
          <ChevronRight size={16} />
        </button>
      )}

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {filteredNavItems.map(({ section, links }) => (
          <div key={section} className="mb-5">
            {(!collapsed || isMobileOpen) && (
              <p className="label-eyebrow mb-2 px-3">{section}</p>
            )}
            <ul className="space-y-0.5">
              {links.map(({ to, icon: Icon, label, dot, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                        isActive
                          ? 'bg-gradient-brand-soft text-[var(--color-text-primary)] shadow-glow-soft'
                          : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]',
                        collapsed && !isMobileOpen && 'justify-center px-0'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--color-accent)]" />}
                        <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-[var(--color-accent)]')} strokeWidth={isActive ? 2 : 1.5} />
                        {(!collapsed || isMobileOpen) && <span className="flex-1 truncate">{label}</span>}
                        {(!collapsed || isMobileOpen) && badge && (
                          <span className="rounded-md bg-[var(--color-accent-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">{badge}</span>
                        )}
                        {dot && (
                          <span className={cn(
                            "rounded-full bg-[var(--color-danger)]",
                            collapsed && !isMobileOpen ? "absolute right-1.5 top-1.5 h-1.5 w-1.5" : "h-1.5 w-1.5 animate-pulse-soft"
                          )} />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={cn('border-t border-[var(--color-border)] p-3', collapsed && !isMobileOpen ? 'flex flex-col items-center gap-2' : '')}>
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-2 transition-colors',
          (!collapsed || isMobileOpen) && 'bg-white/[0.03] hover:bg-white/[0.05]'
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand font-bold text-white text-[11px] ring-2 ring-[var(--color-bg-primary)]/40">
            {user?.fullName ? getInitials(user.fullName) : 'U'}
          </div>
          {(!collapsed || isMobileOpen) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">{user?.fullName ?? 'User'}</p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)]">{user?.role}</p>
            </div>
          )}
          {(!collapsed || isMobileOpen) && (
            <button 
              onClick={handleLogout}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-danger)]"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {collapsed && !isMobileOpen && (
          <button 
            onClick={handleLogout}
            className="rounded-md p-2 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-danger)]"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
