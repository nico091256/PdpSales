import { useState, useRef } from 'react';
import { Palette, Check, Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '@app/providers/ThemeProvider';
import { useI18n } from '@app/providers/I18nProvider';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#6366F1', // indigo (default)
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#14B8A6', // teal
  '#F97316', // orange
];

function isValidHex(val: string) {
  return /^#[0-9A-F]{6}$/i.test(val.trim());
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { themeValue, mode, setTheme, isThemeSaving } = useTheme();

  const [customHex, setCustomHex] = useState(
    isValidHex(themeValue) ? themeValue.toUpperCase() : '#6366F1',
  );
  const [hexInput, setHexInput] = useState(
    isValidHex(themeValue) ? themeValue.toUpperCase() : '#6366F1',
  );

  const colorInputRef = useRef<HTMLInputElement>(null);

  const applyTheme = async (hex: string) => {
    if (!isValidHex(hex)) {
      toast.error(t('settings.invalidHex'));
      return;
    }
    await setTheme(hex);
    setCustomHex(hex.toUpperCase());
    setHexInput(hex.toUpperCase());
    toast.success(t('settings.saved'));
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (isValidHex(val)) {
      setCustomHex(val.toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      <section className="card-surface rounded-2xl border border-[var(--color-card-surface-border,rgba(255,255,255,0.07))] p-6">
        {/* Section header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-muted)]">
            <Palette size={18} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {t('settings.appearance')}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">{t('settings.themeHint')}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── Theme mode ── */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              {t('settings.themeType')}
            </p>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((m) => (
                <button
                  key={m}
                  id={`settings-theme-${m}`}
                  onClick={() => void setTheme(m)}
                  disabled={isThemeSaving}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-[var(--color-accent)] text-white shadow-glow-soft'
                      : 'border border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {m === 'light' ? <Sun size={15} /> : <Moon size={15} />}
                  {t(`settings.themePreset.${m}`)}
                  {mode === m && <Check size={13} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Accent Color ── */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              {t('settings.themeColor')}
            </p>

            {/* Preset color swatches */}
            <p className="mb-2 text-[11px] text-[var(--color-text-muted)]">{t('settings.presetColors')}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_COLORS.map((color) => {
                const isActive = customHex.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    id={`settings-preset-${color.replace('#', '')}`}
                    onClick={() => void applyTheme(color)}
                    disabled={isThemeSaving}
                    title={color}
                    className="relative h-8 w-8 rounded-lg transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--color-bg-card)]"
                    style={{
                      backgroundColor: color,
                      boxShadow: isActive ? `0 0 0 3px var(--color-bg-card), 0 0 0 5px ${color}` : undefined,
                    }}
                  >
                    {isActive && (
                      <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom HEX picker */}
            <p className="mb-2 text-[11px] text-[var(--color-text-muted)]">{t('settings.colorPicker')}</p>
            <div className="flex items-center gap-2">
              {/* Native color input (hidden, opened on swatch click) */}
              <input
                ref={colorInputRef}
                type="color"
                id="settings-color-native"
                value={isValidHex(customHex) ? customHex : '#6366F1'}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setCustomHex(val);
                  setHexInput(val);
                }}
                onBlur={(e) => void applyTheme(e.target.value)}
                className="sr-only"
              />
              <button
                onClick={() => colorInputRef.current?.click()}
                className="h-10 w-10 shrink-0 rounded-xl border-2 border-[var(--color-border)] transition-all hover:border-[var(--color-accent)] hover:scale-105"
                style={{ backgroundColor: isValidHex(customHex) ? customHex : '#6366F1' }}
                title={t('settings.colorPicker')}
              />

              <input
                id="settings-hex-input"
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                onBlur={() => { if (isValidHex(hexInput)) void applyTheme(hexInput); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && isValidHex(hexInput)) void applyTheme(hexInput); }}
                placeholder="#6366F1"
                maxLength={7}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm font-mono outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/25 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
              />

              <button
                id="settings-apply-color"
                onClick={() => void applyTheme(hexInput)}
                disabled={isThemeSaving || !isValidHex(hexInput)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isThemeSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {isThemeSaving ? t('settings.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
