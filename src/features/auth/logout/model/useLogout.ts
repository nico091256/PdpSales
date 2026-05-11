import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@entities/auth/api/authApi';
import { useAuthStore } from '@entities/auth';
import { tokenStore } from '@shared/api/tokenStore';

export function useLogout() {
  const navigate = useNavigate();
  const { logout: clearLocalAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) {
        /**
         * Enterprise requirement: Active invalidation of backend refresh tokens.
         * Swallowed catch block ensures UX remains unblocked on network failure.
         */
        await authApi.logout({ refreshToken, logoutAll: false });
      }
    } catch {
      // ignore
    } finally {
      clearLocalAuth();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  return {
    logout,
    isLoggingOut,
  };
}
