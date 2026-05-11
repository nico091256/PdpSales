import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test', 'src/**/*.d.ts', 'vite.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@app':      resolve(__dirname, './src/app'),
      '@pages':    resolve(__dirname, './src/pages'),
      '@widgets':  resolve(__dirname, './src/widgets'),
      '@features': resolve(__dirname, './src/features'),
      '@entities': resolve(__dirname, './src/entities'),
      '@shared':   resolve(__dirname, './src/shared'),
    },
  },
});
