import React, { createContext, useContext, useState, useEffect } from 'react';

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
  loginVerify: (userId: number, otpCode: string) => Promise<boolean>;
  forgotPassword: (usernameOrPhone: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  resetPassword: (userId: number, otpCode: string, newPass: string, confirmPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerPatient: (data: any) => Promise<{ success: boolean; error?: string }>;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE = 'http://127.0.0.1:8000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('eh_token');
    const savedUser = localStorage.getItem('eh_user');
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

  // ── Helper: authenticated fetch ──────────────────────────────────────────
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (response.status === 401) {
      logout();
    }
    return response;
  };

  // ── Auth flows ────────────────────────────────────────────────────────────
  const loginInit = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login-init/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || 'Authentication failed.' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Network error occurred.' };
    }
  };

  const loginVerify = async (userId: number, otpCode: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login-verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, otp_code: otpCode }),
      });
      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('eh_token', data.access);
      localStorage.setItem('eh_user', JSON.stringify(data.user));
      setToken(data.access);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const forgotPassword = async (
    usernameOrPhone: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_or_phone: usernameOrPhone }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || 'Request failed.' };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Network error occurred.' };
    }
  };

  const resetPassword = async (
    userId: number,
    otpCode: string,
    newPass: string,
    confirmPass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          otp_code: otpCode,
          new_password: newPass,
          confirm_password: confirmPass,
        }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || 'Reset failed.' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error occurred.' };
    }
  };

  const registerPatient = async (data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/register/patient/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        // Surface the first validation error from DRF
        const msg =
          json.detail ||
          Object.values(json).flat().join(' ') ||
          'Registration failed.';
        return { success: false, error: String(msg) };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error occurred.' };
    }
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiFetch('/patients/delete-me/', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || 'Incorrect password. Please try again.' };
      logout();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Unable to delete account.' };
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
        user,
        token,
        loading,
        loginInit,
        loginVerify,
        forgotPassword,
        resetPassword,
        logout,
        registerPatient,
        apiFetch,
        deleteAccount,
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
