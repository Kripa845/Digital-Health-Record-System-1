import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildUrl, ENDPOINTS } from '../config/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'PATIENT' | 'ADMIN';
  first_name?: string;
  last_name?: string;
  healthcare_id?: string;
  profile_id?: number;
  is_profile_setup?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginInit: (username: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  loginVerify: (userId: number, otpCode: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  resetPassword: (userId: number, otpCode: string, newPass: string, confirmPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerPatient: (data: any) => Promise<{ success: boolean; error?: string }>;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse JSON safely; fall back to a plain object with the HTTP status text. */
const parseResponse = async (response: Response): Promise<any> => {
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await response.json(); } catch { /* fall through */ }
  }
  return { detail: response.statusText || `HTTP ${response.status}` };
};

/**
 * Fetch with a timeout.
 * Throws a TypeError with message "timeout" if the request takes too long.
 */
const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeoutMs = 30_000,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
};

/**
 * Convert a caught fetch error into a user-friendly string.
 * The Render free tier spins down after 15 min; the first request can take
 * 30–60 s.  An AbortError means we timed out; a TypeError with no status
 * usually means a CORS preflight was blocked or the server is unreachable.
 */
const networkErrorMessage = (err: unknown): string => {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return 'The server is waking up — this can take up to 60 seconds on the free plan. Please wait a moment and try again.';
  }
  if (err instanceof TypeError) {
    return 'Could not reach the server. It may be starting up (free tier) or there is a network issue. Please try again in 30 seconds.';
  }
  return 'An unexpected error occurred. Please try again.';
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('eh_token');
    const savedUser  = localStorage.getItem('eh_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('eh_token');
        localStorage.removeItem('eh_user');
      }
    }
    setLoading(false);
  }, []);

  // Authenticated fetch helper used by dashboard pages
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };
    const fullUrl  = url.startsWith('http') ? url : buildUrl(url);
    const response = await fetchWithTimeout(fullUrl, { ...options, headers });
    if (response.status === 401) logout();
    return response;
  };

  // ── Login step 1: validate credentials → send OTP ────────────────────────
  const loginInit = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const url      = buildUrl(ENDPOINTS.LOGIN);
      const response = await fetchWithTimeout(
        url,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ username, password }),
        },
        60_000, // 60 s — generous for Render cold-start
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || data.message || 'Invalid username or password.',
        };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: networkErrorMessage(err) };
    }
  };

  // ── Login step 2: verify OTP → issue JWT ─────────────────────────────────
  const loginVerify = async (
    userId: number,
    otpCode: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const url      = buildUrl(ENDPOINTS.LOGIN_VERIFY);
      const response = await fetchWithTimeout(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: userId, otp_code: otpCode }),
      });

      if (!response.ok) {
        const data = await parseResponse(response);
        return { success: false, error: data.detail || 'Invalid OTP code. Please try again.' };
      }

      const data = await parseResponse(response);
      localStorage.setItem('eh_token', data.access);
      localStorage.setItem('eh_user',  JSON.stringify(data.user));
      setToken(data.access);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: networkErrorMessage(err) };
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const forgotPassword = async (
    email: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const url      = buildUrl(ENDPOINTS.FORGOT_PASSWORD);
      const response = await fetchWithTimeout(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        return { success: false, error: data.detail || data.error || 'Request failed.' };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: networkErrorMessage(err) };
    }
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const resetPassword = async (
    userId: number,
    otpCode: string,
    newPass: string,
    confirmPass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const url      = buildUrl(ENDPOINTS.RESET_PASSWORD);
      const response = await fetchWithTimeout(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          user_id:          userId,
          otp_code:         otpCode,
          new_password:     newPass,
          confirm_password: confirmPass,
        }),
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        return { success: false, error: data.detail || data.error || 'Reset failed.' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: networkErrorMessage(err) };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const registerPatient = async (data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const url      = buildUrl(ENDPOINTS.REGISTER_PATIENT);
      const response = await fetchWithTimeout(
        url,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        },
        60_000,
      );

      const json = await parseResponse(response);
      if (!response.ok) {
        const msg =
          json.detail ||
          Object.values(json).flat().join(' ') ||
          'Registration failed.';
        return { success: false, error: String(msg) };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: networkErrorMessage(err) };
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiFetch(ENDPOINTS.DELETE_ACCOUNT, {
        method: 'POST',
        body:   JSON.stringify({ password }),
      });
      const data = await parseResponse(response);
      if (!response.ok) {
        return { success: false, error: data.detail || 'Incorrect password. Please try again.' };
      }
      logout();
      return { success: true };
    } catch (err) {
      return { success: false, error: networkErrorMessage(err) };
    }
  };

  const logout = () => {
    localStorage.removeItem('eh_token');
    localStorage.removeItem('eh_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, loading,
        loginInit, loginVerify,
        forgotPassword, resetPassword,
        logout, registerPatient,
        apiFetch, deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
