import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { authApi } from '@entities/auth/api/authApi';
import { useAuthStore } from '@entities/auth';
import { validateEmail, validateCompanySlug } from '@shared/lib/validation';

export function useLogin() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', companySlug: '' });

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Client-side validation
    const emailError = validateEmail(form.email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const slugError = validateCompanySlug(form.companySlug);
    if (slugError) {
      toast.error(slugError);
      return;
    }

    if (!form.password) {
      toast.error('Parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login({
        email: form.email.trim(),
        password: form.password,
        companySlug: form.companySlug.trim().toLowerCase() || undefined,
      });

      const accessToken = data.token ?? '';
      const refreshToken = data.refreshToken ?? '';

      if (!accessToken || !refreshToken) {
        toast.error('Server autentifikatsiya ma\'lumotlarini qaytarmadi.');
        return;
      }

      setTokens(accessToken, refreshToken);
      if (data.user) setUser(data.user);

      toast.success('Xush kelibsiz!');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const body = err.response?.data as
          | { detail?: string; title?: string; message?: string }
          | undefined;
        const detail = body?.detail ?? body?.title ?? body?.message ?? err.message;
        toast.error(`${status ? `[${status}] ` : ''}${detail || 'Login xatosi.'}`);
      } else {
        toast.error('Kutilmagan xato yuz berdi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    login,
  };
}
