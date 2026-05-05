/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { meApi } from '@entities/user/api/meApi';
import { profileApi } from '@entities/user/api/profileApi';

type ThemeMode = 'light' | 'dark' | 'custom';

interface ThemeContextValue {
  themeValue: string;
  mode: ThemeMode;
  setTheme: (nextTheme: string) => Promise<void>;
  isThemeSaving: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isHexColor = (value: string) => /^#[0-9A-F]{6}$/i.test(value.trim());

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const bigint = Number.parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const applyTheme = (theme: string) => {
  const root = document.documentElement;
  const normalized = theme.trim().toLowerCase();
  const darkMode = normalized === 'dark';

  root.dataset.theme = darkMode ? 'dark' : 'light';

  if (isHexColor(theme)) {
    const { r, g, b } = hexToRgb(theme);
    root.style.setProperty('--color-accent', theme);
    root.style.setProperty('--color-accent-hover', `rgb(${Math.max(r - 12, 0)} ${Math.max(g - 12, 0)} ${Math.max(b - 12, 0)})`);
    root.style.setProperty('--color-accent-muted', `rgb(${r} ${g} ${b} / 0.16)`);
    root.style.setProperty('--gradient-brand', `linear-gradient(135deg, ${theme}, rgb(${Math.min(r + 36, 255)} ${Math.min(g + 24, 255)} ${Math.min(b + 36, 255)}))`);
    root.style.setProperty('--shadow-glow', `0 0 24px rgb(${r} ${g} ${b} / 0.32)`);
    root.style.setProperty('--shadow-glow-soft', `0 0 16px rgb(${r} ${g} ${b} / 0.22)`);
    return;
  }

  root.style.setProperty('--color-accent', 'var(--color-accent-default)');
  root.style.setProperty('--color-accent-hover', 'var(--color-accent-hover-default)');
  root.style.setProperty('--color-accent-muted', 'var(--color-accent-muted-default)');
  root.style.setProperty('--gradient-brand', 'var(--gradient-brand-default)');
  root.style.setProperty('--shadow-glow', 'var(--shadow-glow-default)');
  root.style.setProperty('--shadow-glow-soft', 'var(--shadow-glow-soft-default)');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [localTheme, setLocalTheme] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ['me-theme'],
    queryFn: meApi.getMe,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const themeValue = localTheme ?? meQuery.data?.theme?.trim() ?? 'dark';

  useEffect(() => {
    applyTheme(themeValue);
  }, [themeValue]);

  const saveMutation = useMutation({
    mutationFn: async (nextTheme: string) => {
      await profileApi.updateProfile({ theme: nextTheme });
      return nextTheme;
    },
    onSuccess: (nextTheme) => {
      setLocalTheme(nextTheme);
      applyTheme(nextTheme);
    },
  });

  const setTheme = useCallback(
    async (nextTheme: string) => {
      await saveMutation.mutateAsync(nextTheme);
    },
    [saveMutation],
  );

  const mode: ThemeMode = useMemo(() => {
    if (themeValue === 'dark') return 'dark';
    if (themeValue === 'light') return 'light';
    return 'custom';
  }, [themeValue]);

  const value = useMemo(
    () => ({
      themeValue,
      mode,
      setTheme,
      isThemeSaving: saveMutation.isPending,
    }),
    [themeValue, mode, setTheme, saveMutation.isPending],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
