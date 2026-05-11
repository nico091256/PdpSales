import '@testing-library/jest-dom';

// Polyfill sessionStorage/localStorage for jsdom
Object.defineProperty(window, 'sessionStorage', {
  value: (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })(),
  writable: true,
});

// Silence noisy console.error from expected test failures
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('[ErrorBoundary]'))
    ) return;
    originalConsoleError(...args);
  };
});
afterEach(() => {
  console.error = originalConsoleError;
});
