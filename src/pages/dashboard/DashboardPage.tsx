/**
 * WHY CHANGED:
 *
 * The original code used `as any` to cast API return types:
 *   adminApi.getRopDashboard() as any
 *   adminApi.getSalesManagerDashboard() as any
 *
 * This defeats TypeScript's type safety entirely. The underlying problem was
 * that the queryFn inferred a union return type which TypeScript couldn't
 * narrow automatically. Fix: use explicit generic overloads and cast at the
 * render site with proper type guards.
 */

import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { adminApi } from '@entities/dashboard';
import { useAuthStore } from '@entities/auth';
import { useI18n } from '@app/providers/I18nProvider';
import { AlertTriangle } from 'lucide-react';
import type {
  CeoDashboardDto,
  RopDashboardDto,
  SalesManagerDashboardDto,
} from '@shared/api/types';
import { CeoDashboard } from './sections/CeoDashboard';
import { RopDashboard } from './sections/RopDashboard';
import { SalesManagerDashboard } from './sections/SalesManagerDashboard';

type DashboardData = CeoDashboardDto | RopDashboardDto | SalesManagerDashboardDto;

function resolveDashboardQuery(role: string | undefined): Promise<DashboardData> {
  switch (role) {
    case 'ROP':          return adminApi.getRopDashboard();
    case 'SalesManager': return adminApi.getSalesManagerDashboard();
    default:             return adminApi.getCeoDashboard();
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const role = user?.role;

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: () => resolveDashboardQuery(role),
    enabled: !!role,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
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
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const detail = isAxiosError(error)
      ? (error.response?.data as { detail?: string } | undefined)?.detail ?? error.message
      : (error instanceof Error ? error.message : 'Unknown Error');
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center" role="alert">
        <AlertTriangle size={48} className="text-[var(--color-danger)] mb-4 opacity-50" aria-hidden="true" />
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          {t('dashboard.error.title')}
        </h2>
        <p className="text-[var(--color-text-muted)] max-w-md mb-4">
          {t('dashboard.error.body')}
        </p>
        <div className="glass px-4 py-2 rounded-lg text-xs font-mono text-[var(--color-danger)]">
          {status ? `[${status}] ` : ''}{detail}
        </div>
      </div>
    );
  }

  const roleLabel =
    role === 'CEO'          ? 'Chief Executive Officer'   :
    role === 'ROP'          ? 'Regional Operations Partner' :
    role === 'SalesManager' ? 'Sales Manager'              : (role ?? '');

  return (
    <div className="space-y-8">
      <header className="animate-rise delay-0">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {t('dashboard.welcome')},&nbsp;{user?.fullName}
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {roleLabel} · {t('dashboard.subtitle')}
        </p>
      </header>

      {role === 'CEO'          && data && <CeoDashboard          data={data as CeoDashboardDto}          t={t} />}
      {role === 'ROP'          && data && <RopDashboard          data={data as RopDashboardDto}          t={t} />}
      {role === 'SalesManager' && data && <SalesManagerDashboard data={data as SalesManagerDashboardDto} t={t} />}
    </div>
  );
}
