/**
 * ConfirmDialog — Accessible confirmation modal.
 *
 * WHY: window.confirm() is:
 *   - Non-styleable and visually inconsistent across browsers
 *   - Not keyboard-navigable in the expected way (tab focus escapes)
 *   - Inaccessible to screen readers (blocks the entire page)
 *   - Unsupported in some embedded contexts (iframes)
 *
 * This component replaces window.confirm() with a WCAG AA-compliant dialog:
 *   - focus trap: Tab/Shift+Tab cycles only within the dialog
 *   - Escape key: closes the dialog (calls onCancel)
 *   - aria-modal + role="dialog": announces to screen readers
 *   - aria-labelledby / aria-describedby: announces title and body
 *   - Initial focus: placed on the Cancel button (safe default)
 *   - Loading state: disables both buttons, shows spinner on confirm
 *   - Destructive variant: changes confirm button color to danger red
 *
 * USAGE:
 *   <ConfirmDialog
 *     open={isOpen}
 *     title="Delete User"
 *     description="This action cannot be undone."
 *     confirmLabel="Delete"
 *     variant="destructive"
 *     isLoading={mutation.isPending}
 *     onConfirm={handleConfirm}
 *     onCancel={() => setIsOpen(false)}
 *   />
 */

import { useEffect, useRef, useId } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '@shared/lib/utils';

interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  open: boolean;
  /** Short title shown in the dialog header */
  title: string;
  /** Descriptive body text explaining what will happen */
  description?: string;
  /** Label for the confirm action button. Defaults to "Confirm" */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Cancel" */
  cancelLabel?: string;
  /** "destructive" = red confirm button. "default" = accent color. */
  variant?: 'default' | 'destructive';
  /** Whether the confirm action is in progress (e.g. mutation.isPending) */
  isLoading?: boolean;
  /** Called when the user clicks the confirm button */
  onConfirm: () => void;
  /** Called when the user cancels (Escape key, Cancel button, or backdrop click) */
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  // ── Focus trap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    // Focus the cancel button when dialog opens (safe default — avoids
    // accidental confirmation on Enter if the user just pressed a key).
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== 'Tab') return;

      // Collect all focusable elements inside the dialog.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  // ── Scroll lock ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  const isDestructive = variant === 'destructive';

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="presentation"
      aria-hidden="false"
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative w-full max-w-sm rounded-2xl border border-white/[0.08]',
          'bg-[var(--color-bg-secondary)] shadow-2xl',
          'animate-rise',
        )}
      >
        {/* Close button (top-right) */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-4 text-center">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl',
              isDestructive
                ? 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
                : 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
            )}
            aria-hidden="true"
          >
            <AlertTriangle size={26} strokeWidth={2} />
          </div>

          <div>
            <h2
              id={titleId}
              className="text-[17px] font-bold text-[var(--color-text-primary)]"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descId}
                className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isDestructive
                ? 'bg-[var(--color-danger)] hover:opacity-90 shadow-[0_0_16px_rgba(239,68,68,0.25)]'
                : 'bg-gradient-brand shadow-glow-soft hover:shadow-glow',
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : null}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
