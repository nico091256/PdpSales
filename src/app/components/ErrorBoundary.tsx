/**
 * Global React ErrorBoundary.
 *
 * WHY: Without this, any unhandled render error (null dereference, bad data
 * shape from API, etc.) crashes the entire React tree leaving a blank screen.
 * An ErrorBoundary catches render-phase errors and shows a recovery UI.
 *
 * PRODUCTION HOOK: `componentDidCatch` is the correct place to call
 * Sentry.captureException() or your monitoring SDK of choice.
 *
 * USAGE (in App.tsx):
 *   <ErrorBoundary>
 *     <RouteTree />
 *   </ErrorBoundary>
 *
 * Wrap individual subtrees with <ErrorBoundary> to isolate failures.
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback UI. Replaces the default error screen. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // ── Production monitoring hook ──────────────────────────────────────────
    // Replace with: Sentry.captureException(error, { extra: info });
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0F1117] p-8"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">
            An unexpected error occurred. You can try to recover below.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-black/40 p-4 text-left text-xs text-red-300">
              {this.state.error.message}
            </pre>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Try Again
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
}
