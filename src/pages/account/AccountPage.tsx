import { NavLink, Outlet } from 'react-router-dom';
import { UserRound, Settings2 } from 'lucide-react';
import { useI18n } from '@app/providers/I18nProvider';
import { cn } from '@shared/lib/utils';

export default function AccountPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{t('account.title')}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t('account.description')}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2">
          <NavLink
            to="/account/profile"
            className={({ isActive }) =>
              cn(
                'mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <UserRound size={16} />
            {t('account.tab.profile')}
          </NavLink>
          <NavLink
            to="/account/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <Settings2 size={16} />
            {t('account.tab.settings')}
          </NavLink>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
