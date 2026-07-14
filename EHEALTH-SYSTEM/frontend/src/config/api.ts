// ─── API base URL ─────────────────────────────────────────────────────────────
//
// Resolution order:
//  1. VITE_API_URL env var (must start with "http" to be used)
//     → Set via .env.production or Render's environment panel
//  2. import.meta.env.PROD === true  → hardcoded production backend (safest fallback)
//  3. Local dev                      → '/api' (Vite proxy forwards to Django :8000)
//
// The hardcoded fallback in step 2 means the app works correctly on Render even
// if .env.production is missing or VITE_API_URL is empty/undefined.

const PRODUCTION_BACKEND = 'https://digital-health-record-system-2.onrender.com/api';

function resolveApiBase(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;

  // Only trust the env var if it's a real absolute URL
  if (env && env.startsWith('http')) {
    return env.replace(/\/+$/, ''); // strip any trailing slashes
  }

  // Production build but no valid env var → always use the hardcoded backend
  if (import.meta.env.PROD) {
    return PRODUCTION_BACKEND;
  }

  // Local dev: Vite proxy handles /api → http://127.0.0.1:8000
  return '/api';
}

export const API_BASE = resolveApiBase();

/** Build a full URL from a relative endpoint like 'auth/login-init/' */
export const buildUrl = (endpoint: string): string => {
  // Strip leading slash from endpoint to avoid double-slash
  const clean = endpoint.replace(/^\/+/, '');
  return `${API_BASE}/${clean}`;
};

export const ENDPOINTS = {
  LOGIN:            'auth/login-init/',
  LOGIN_VERIFY:     'auth/login-verify/',
  FORGOT_PASSWORD:  'auth/forgot-password/',
  RESET_PASSWORD:   'auth/reset-password/',
  REGISTER_PATIENT: 'auth/register/patient/',
  DELETE_ACCOUNT:   'patients/delete-me/',
} as const;
