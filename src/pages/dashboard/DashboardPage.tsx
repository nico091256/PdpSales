import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@entities/dashboard';
import { useAuthStore } from '@entities/auth';
import { useI18n } from '@app/providers/I18nProvider';
import { AlertTriangle } from 'lucide-react';
import type { CeoDashboardDto, RopDashboardDto, SalesManagerDashboardDto } from '@shared/api/types';
import { CeoDashboard } from './sections/CeoDashboard';
import { RopDashboard } from './sections/RopDashboard';
import { SalesManagerDashboard } from './sections/SalesManagerDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const role = user?.role;

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', role],
    queryFn: () => {
      if (role === 'CEO')          return adminApi.getCeoDashboard();
      if (role === 'ROP')          return adminApi.getRopDashboard() as any;
      if (role === 'SalesManager') return adminApi.getSalesManagerDashboard() as any;
      return adminApi.getCeoDashboard();
    },
    enabled: !!role,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-72 rounded-lg bg-white/5" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-xl bg-white/5" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[340px] rounded-xl bg-white/5" />
          <div className="h-[340px] rounded-xl bg-white/5" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="h-[260px] rounded-xl bg-white/5" />
          <div className="h-[260px] rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-[var(--color-danger)] mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          {t('dashboard.error.title')}
        </h3>
        <p className="text-[var(--color-text-muted)] max-w-md mb-4">
          {t('dashboard.error.body')}
        </p>
        <div className="glass px-4 py-2 rounded-lg text-xs font-mono text-[var(--color-danger)]">
          {(error as any)?.response?.status ? `[${(error as any).response.status}] ` : ''}
          {(error as any)?.response?.data?.detail || (error as any)?.message || 'Unknown Error'}
        </div>
      </div>
    );
  }

  const roleLabel =
    role === 'CEO' ? 'Chief Executive Officer' :
    role === 'ROP' ? 'Regional Operations Partner' :
    role === 'SalesManager' ? 'Sales Manager' : role;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="animate-rise delay-0">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {t('dashboard.welcome')},&nbsp;{user?.fullName}
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {roleLabel} · {t('dashboard.subtitle')}
        </p>
      </header>

      {/* Role-specific dashboard */}
      {role === 'CEO' && (
        <CeoDashboard data={data as CeoDashboardDto} t={t} />
      )}
      {role === 'ROP' && (
        <RopDashboard data={data as RopDashboardDto} t={t} />
      )}
      {role === 'SalesManager' && (
        <SalesManagerDashboard data={data as SalesManagerDashboardDto} t={t} />
      )}
    </div>
  );
}
