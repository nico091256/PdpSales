import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { I18nProvider } from './providers/I18nProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthInitializer } from './providers/AuthInitializer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from '@entities/auth';
import { MainLayout } from '@widgets/layouts/MainLayout';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const LoginPage        = lazy(() => import('@pages/login/LoginPage'));
const RegisterPage     = lazy(() => import('@pages/register/RegisterPage'));
const DashboardPage    = lazy(() => import('@pages/dashboard/DashboardPage'));
const AppointmentsPage = lazy(() => import('@pages/appointments/AppointmentsPage'));
const CallLogsPage     = lazy(() => import('@pages/call-logs/CallLogsPage'));
const AlertsPage       = lazy(() => import('@pages/alerts/AlertsPage'));
const RankingsPage     = lazy(() => import('@pages/rankings/RankingsPage'));
const UsersPage        = lazy(() => import('@pages/users/UsersPage'));
const InvitationsPage  = lazy(() => import('@pages/invitations/InvitationsPage'));
const ProfilePage      = lazy(() => import('@pages/profile/ProfilePage'));
const SettingsPage     = lazy(() => import('@pages/settings/SettingsPage'));
const AccountPage      = lazy(() => import('@pages/account/AccountPage'));
const AcceptInvitePage = lazy(() => import('@pages/invitations/AcceptInvitePage'));

// ── QueryClient ───────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Route-level loading fallback ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)]">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent shadow-glow"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

// ── Route guards ─────────────────────────────────────────────────────────────

/**
 * PrivateRoute — blocks unauthenticated access.
 * NOTE: This is a UX guard only. Real authorization is enforced by the backend.
 * Never rely on client-side checks for security decisions.
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * PublicRoute — redirects already-authenticated users away from /login.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/**
 * RoleRoute — secondary UI guard for role-restricted pages.
 *
 * SECURITY NOTE: The backend must independently verify role on every request.
 * This guard exists only to prevent accidental navigation, NOT as a security
 * boundary. A user who manipulates client state can bypass it — the backend
 * will return 403 regardless.
 */
function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.role || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ── Root App ──────────────────────────────────────────────────────────────────
export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            {/*
              AuthInitializer performs a silent token refresh on page load.
              It renders a spinner until the auth state is resolved, then
              unmounts — preventing route guards from firing prematurely.
            */}
            <AuthInitializer>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register"       element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    <Route path="/accept-invite"  element={<PublicRoute><AcceptInvitePage /></PublicRoute>} />

                    {/* Protected layout */}
                    <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />

                      {/* Common routes */}
                      <Route path="dashboard"    element={<DashboardPage />} />
                      <Route path="rankings"     element={<RankingsPage />} />
                      <Route path="appointments" element={<AppointmentsPage />} />
                      <Route path="call-logs"    element={<CallLogsPage />} />
                      <Route path="alerts"       element={<AlertsPage />} />

                      {/* Account subroutes */}
                      <Route path="profile"  element={<Navigate to="/account/profile" replace />} />
                      <Route path="settings" element={<Navigate to="/account/settings" replace />} />
                      <Route path="account"  element={<AccountPage />}>
                        <Route index         element={<Navigate to="/account/profile" replace />} />
                        <Route path="profile"  element={<ProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Route>

                      {/* CEO + ROP only */}
                      <Route path="users"       element={<RoleRoute roles={['CEO', 'ROP']}><UsersPage /></RoleRoute>} />
                      <Route path="invitations" element={<RoleRoute roles={['CEO', 'ROP']}><InvitationsPage /></RoleRoute>} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthInitializer>
          </ThemeProvider>
        </I18nProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E2235',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
