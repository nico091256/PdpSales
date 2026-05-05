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
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn, getInitials } from '@shared/lib/utils';
import { useAuthStore } from '@entities/auth';
import { useI18n } from '@app/providers/I18nProvider';
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
  labelKey: string;
  dot?: boolean;
  roles?: string[];
}

const navItems: { sectionKey: string; links: NavLinkItem[] }[] = [
  {
    sectionKey: 'layout.overview',
    links: [
      { to: '/dashboard',    icon: LayoutDashboard, labelKey: 'layout.dashboard', roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/rankings',     icon: Trophy,          labelKey: 'layout.rankings',  roles: ['CEO', 'ROP', 'SalesManager'] },
    ],
  },
  {
    sectionKey: 'layout.management',
    links: [
      { to: '/users',        icon: Users,    labelKey: 'layout.users',        roles: ['CEO', 'ROP'] },
      { to: '/appointments', icon: Calendar, labelKey: 'layout.appointments', roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/call-logs',    icon: Phone,    labelKey: 'layout.callLogs',     roles: ['CEO', 'ROP', 'SalesManager'] },
    ],
  },
  {
    sectionKey: 'layout.operations',
    links: [
      { to: '/alerts',      icon: Bell, labelKey: 'layout.alerts',      dot: true, roles: ['CEO', 'ROP', 'SalesManager'] },
      { to: '/invitations', icon: Mail, labelKey: 'layout.invitations',            roles: ['CEO', 'ROP'] },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const role = user?.role || 'SalesManager';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('👋');
    navigate('/login');
  };

  const filteredNavItems = navItems
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => !link.roles || link.roles.includes(role)),
    }))
    .filter((section) => section.links.length > 0);

  const isExpanded = !collapsed || isMobileOpen;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] transition-all duration-300 ease-in-out',
        'lg:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        isMobileOpen && 'w-[260px] translate-x-0',
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-5',
          !isExpanded && 'justify-center px-0',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-soft">
          <Zap className="h-5 w-5 text-white" fill="currentColor" />
        </div>

        {isExpanded && (
          <div className="flex flex-1 items-center justify-between min-w-0">
            <span className="text-[15px] font-bold tracking-tight text-[var(--color-text-primary)]">
              SalesPulse
            </span>
            <button
              onClick={isMobileOpen ? onMobileClose : onToggle}
              className="rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            >
              {isMobileOpen ? <X size={18} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* Collapsed expand button */}
      {!isExpanded && (
        <button
          onClick={onToggle}
          className="mx-auto mt-3 rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* ── Navigation ── */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {filteredNavItems.map(({ sectionKey, links }) => (
          <div key={sectionKey}>
            {isExpanded && (
              <p className="label-eyebrow mb-2 px-3">{t(sectionKey)}</p>
            )}
            <ul className="space-y-0.5">
              {links.map(({ to, icon: Icon, labelKey, dot }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    title={!isExpanded ? t(labelKey) : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                        isActive
                          ? 'bg-[var(--color-accent-muted)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
                        !isExpanded && 'justify-center px-0',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--color-accent)]" />
                        )}
                        <Icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]',
                          )}
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        {isExpanded && (
                          <span className="flex-1 truncate font-medium">{t(labelKey)}</span>
                        )}
                        {dot && (
                          <span
                            className={cn(
                              'rounded-full bg-[var(--color-danger)]',
                              !isExpanded
                                ? 'absolute right-1.5 top-1.5 h-1.5 w-1.5'
                                : 'h-1.5 w-1.5',
                            )}
                          />
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

      {/* ── User Footer ── */}
      <div
        className={cn(
          'shrink-0 border-t border-[var(--color-border)] p-3',
          !isExpanded && 'flex flex-col items-center gap-2',
        )}
      >
        {/* Profile button */}
        <button
          id="sidebar-profile-btn"
          onClick={() => navigate('/account/profile')}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--color-bg-hover)]',
            !isExpanded && 'w-auto justify-center',
          )}
          title={!isExpanded ? (user?.fullName ?? 'Profile') : undefined}
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-bold text-white ring-2 ring-[var(--color-accent)]/20">
            {user?.fullName ? getInitials(user.fullName) : 'U'}
          </div>

          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)] leading-tight">
                {user?.fullName ?? 'User'}
              </p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                {user?.email ?? user?.role ?? ''}
              </p>
            </div>
          )}
        </button>

        {/* Logout */}
        {isExpanded ? (
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[var(--color-text-muted)] text-xs transition-colors hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
          >
            <LogOut size={15} />
            <span>{t('common.logout')}</span>
          </button>
        ) : (
          <button
            id="sidebar-logout-btn-collapsed"
            onClick={handleLogout}
            title={t('common.logout')}
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
