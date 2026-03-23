// Environment configuration for Render deployment
// Automatically uses Vite env vars or falls back to local development

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : (import.meta.env.VITE_API_URL || '/api');
export const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5000';

export const CONFIG = {
  api: API_BASE_URL,
  ml: ML_BASE_URL,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
} as const;

// Render external hostname (for dynamic health URLs)
export const EXTERNAL_HOSTNAME = import.meta.env.RENDER_EXTERNAL_HOSTNAME || 'localhost';

