// ─── API base URL ─────────────────────────────────────────────────────────────
//
// In production we ALWAYS use the known, correct backend URL. We no longer trust
// VITE_API_URL blindly, because a wrong value (e.g. pointing at the frontend
// site) makes every API call 404. The env var is only a dev convenience.
//
//   - Local dev (import.meta.env.DEV)  → '/api' (Vite proxy → Django :8000)
//   - Production build                  → hardcoded backend below
//
// Update this single constant if the backend URL ever changes.

const PRODUCTION_BACKEND = 'https://digital-health-record-system-2.onrender.com/api';

function resolveApiBase(): string {
  // Local development: let Vite proxy /api to the Django dev server.
  if (import.meta.env.DEV) {
    console.log('✅ Using /api dev proxy');
    return '/api';
  }

  // Production: always use the correct backend URL.
  console.log('✅ Using production backend:', PRODUCTION_BACKEND);
  return PRODUCTION_BACKEND;
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
