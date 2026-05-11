/**
 * Global Environment Configuration
 * 
 * WHY: This centralizes access to import.meta.env and enforces strict validation.
 * It prevents the app from running with missing critical configuration, 
 * especially in production.
 */

const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  
  if (!value) {
    // In production, missing config is fatal.
    if (import.meta.env.PROD) {
      throw new Error(`[FATAL] Missing environment variable: ${key}. Production cannot start without it.`);
    }
    // In development, we warn but allow fallback if necessary.
    console.warn(`[WARN] Environment variable ${key} is missing.`);
  }
  
  return value || '';
};

export const ENV = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL'),
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;
