import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// WHY loadEnv: vite.config.ts runs before the Vite env-loading pipeline,
// so import.meta.env is not available here. We load .env manually.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // SECURITY: Proxy target is read from .env (VITE_DEV_PROXY_URL).
  // The hardcoded IP was removed — never commit server IPs to version control.
  // In production (Vercel) the proxy is handled by vercel.json rewrites.
  // Local dev: set VITE_DEV_PROXY_TARGET=http://<your-backend> in .env
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:5276';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@':         path.resolve(__dirname, './src'),
        '@app':      path.resolve(__dirname, './src/app'),
        '@pages':    path.resolve(__dirname, './src/pages'),
        '@widgets':  path.resolve(__dirname, './src/widgets'),
        '@features': path.resolve(__dirname, './src/features'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@shared':   path.resolve(__dirname, './src/shared'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false, // dev-only; prod uses HTTPS through vercel.json
        },
      },
    },
  };
});
