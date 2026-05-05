import { Bell, Search, ChevronDown, Menu, Check, Sun, Moon, Palette, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@app/providers/ThemeProvider';
import { useI18n } from '@app/providers/I18nProvider';

// Map route → i18n keys
const pageMeta: Record<string, { titleKey: string; crumbSectionKey: string; crumbPageKey: string }> = {
  '/dashboard':        { titleKey: 'page.dashboard',    crumbSectionKey: 'breadcrumb.overview',    crumbPageKey: 'page.dashboard' },
  '/rankings':         { titleKey: 'page.rankings',     crumbSectionKey: 'breadcrumb.overview',    crumbPageKey: 'page.rankings' },
  '/users':            { titleKey: 'page.users',        crumbSectionKey: 'breadcrumb.management',  crumbPageKey: 'page.users' },
  '/appointments':     { titleKey: 'page.appointments', crumbSectionKey: 'breadcrumb.management',  crumbPageKey: 'page.appointments' },
  '/call-logs':        { titleKey: 'page.callLogs',     crumbSectionKey: 'breadcrumb.management',  crumbPageKey: 'page.callLogs' },
  '/alerts':           { titleKey: 'page.alerts',       crumbSectionKey: 'breadcrumb.operations',  crumbPageKey: 'page.alerts' },
  '/invitations':      { titleKey: 'page.invitations',  crumbSectionKey: 'breadcrumb.operations',  crumbPageKey: 'page.invitations' },
  '/account/profile':  { titleKey: 'page.profile',      crumbSectionKey: 'breadcrumb.account',     crumbPageKey: 'page.profile' },
  '/account/settings': { titleKey: 'page.settings',     crumbSectionKey: 'breadcrumb.account',     crumbPageKey: 'page.settings' },
};

interface HeaderProps {
  onMenuClick?: () => void;
}

// Hook to close a dropdown when clicking outside its ref
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { mode, themeValue, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen]   = useState(false);
  const [isMobileSearch, setIsMobileSearch] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const langRef  = useRef<HTMLDivElement>(null);

  const closeTheme = useCallback(() => setIsThemeOpen(false), []);
  const closeLang  = useCallback(() => setIsLangOpen(false), []);

  useOutsideClick(themeRef, closeTheme);
  useOutsideClick(langRef,  closeLang);

  const meta = pageMeta[location.pathname] ?? { titleKey: 'page.dashboard', crumbSectionKey: 'breadcrumb.overview', crumbPageKey: 'page.dashboard' };

  const themeIcon = mode === 'dark' ? (
    <Moon size={14} className="text-[var(--color-text-muted)]" />
  ) : mode === 'light' ? (
    <Sun size={14} className="text-[var(--color-text-muted)]" />
  ) : (
    <Palette size={14} style={{ color: isHexColor(themeValue) ? themeValue : 'var(--color-accent)' }} />
  );

  return (
    <>
      {/* Mobile search overlay */}
      {isMobileSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSearch(false)}
          />
          <div className="relative z-10 w-full max-w-lg">
            <div className="glass flex items-center gap-2 rounded-xl px-4 py-3 border border-[var(--color-accent)]/30 shadow-xl">
              <Search size={18} className="text-[var(--color-accent)] shrink-0" />
              <input
                id="mobile-search-input"
                autoFocus
                placeholder={t('header.searchPlaceholder')}
                className="w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
              />
              <button
                onClick={() => setIsMobileSearch(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-4 sm:px-6 backdrop-blur-xl">
        {/* Mobile menu button */}
        <button
          id="header-mobile-menu"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <div className="min-w-0 flex-1 lg:flex-none">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            {t(meta.titleKey)}
          </h1>
          <p className="truncate text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
            {t(meta.crumbSectionKey)} / {t(meta.crumbPageKey)}
          </p>
        </div>

        {/* Search — desktop */}
        <div className="mx-auto hidden w-full max-w-[280px] xl:block">
          <label htmlFor="desktop-search" className="glass flex items-center gap-2 rounded-lg px-3 py-2 transition-all focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)]/25 cursor-text">
            <Search size={15} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              id="desktop-search"
              placeholder={t('header.searchPlaceholder')}
              className="w-full bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
            />
          </label>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">
          {/* Mobile search icon */}
          <button
            id="header-mobile-search"
            onClick={() => setIsMobileSearch(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] xl:hidden"
          >
            <Search size={18} />
          </button>

          {/* Theme dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              id="header-theme-toggle"
              onClick={() => { setIsThemeOpen((p) => !p); setIsLangOpen(false); }}
              className="glass flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:text-[var(--color-text-primary)]"
            >
              {themeIcon}
              <span className="hidden sm:inline text-[var(--color-text-muted)]">{t('header.theme')}</span>
              <span className="capitalize text-[var(--color-text-primary)] font-medium">
                {mode === 'custom' ? t('header.theme.custom') : t(`header.theme.${mode}`)}
              </span>
              <ChevronDown size={11} className="text-[var(--color-text-muted)]" />
            </button>

            {isThemeOpen && (
              <div
                id="header-theme-dropdown"
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 shadow-xl dropdown-panel"
              >
                {(['light', 'dark'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => { void setTheme(item); setIsThemeOpen(false); }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {item === 'light' ? <Sun size={13} /> : <Moon size={13} />}
                      {t(`header.theme.${item}`)}
                    </span>
                    {mode === item && <Check size={13} className="text-[var(--color-accent)] shrink-0" />}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const hex = isHexColor(themeValue) ? themeValue : '#6366F1';
                    void setTheme(hex);
                    setIsThemeOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Palette size={13} />
                    {t('header.theme.custom')}
                  </span>
                  {mode === 'custom' && <Check size={13} className="text-[var(--color-accent)] shrink-0" />}
                </button>
              </div>
            )}
          </div>

          {/* Language dropdown */}
          <div className="relative" ref={langRef}>
            <button
              id="header-lang-toggle"
              onClick={() => { setIsLangOpen((p) => !p); setIsThemeOpen(false); }}
              className="glass flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:text-[var(--color-text-primary)]"
            >
              <span className="hidden sm:inline text-[var(--color-text-muted)]">{t('header.language')}</span>
              <span className="uppercase font-semibold text-[var(--color-text-primary)]">{locale}</span>
              <ChevronDown size={11} className="text-[var(--color-text-muted)]" />
            </button>

            {isLangOpen && (
              <div
                id="header-lang-dropdown"
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 shadow-xl dropdown-panel"
              >
                {(['ru', 'uz', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLocale(lang); setIsLangOpen(false); }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm uppercase text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {lang}
                    {locale === lang && <Check size={13} className="text-[var(--color-accent)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            id="header-notifications"
            title={t('header.notifications')}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 flex h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
          </button>
        </div>
      </header>
    </>
  );
}

function isHexColor(val: string) {
  return /^#[0-9A-F]{6}$/i.test(val?.trim() ?? '');
}
