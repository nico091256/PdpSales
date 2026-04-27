import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from '@entities/auth';
import { MainLayout } from '@widgets/layouts/MainLayout';

// Pages (lazy loaded)
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@pages/login/LoginPage'));
const RegisterPage = lazy(() => import('@pages/register/RegisterPage'));
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const AppointmentsPage = lazy(() => import('@pages/appointments/AppointmentsPage'));
const CallLogsPage = lazy(() => import('@pages/call-logs/CallLogsPage'));
const AlertsPage = lazy(() => import('@pages/alerts/AlertsPage'));
const RankingsPage = lazy(() => import('@pages/rankings/RankingsPage'));
const UsersPage = lazy(() => import('@pages/users/UsersPage'));
const InvitationsPage = lazy(() => import('@pages/invitations/InvitationsPage'));
const ProfilePage = lazy(() => import('@pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@pages/settings/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 min
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Private Routes inside MainLayout */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="call-logs" element={<CallLogsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="invitations" element={<InvitationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E2235',
            color: '#F1F5F9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
