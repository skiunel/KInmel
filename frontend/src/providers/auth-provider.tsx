'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'kinmel_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAccessToken = (token: string | null) => {
    if (token) {
      // Set in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Also persist to localStorage for account page
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, token);
      }
    } else {
      // Clear from axios headers
      delete api.defaults.headers.common['Authorization'];
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — we're logging out regardless
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // First check if there's a token in localStorage (from previous session)
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

        if (storedToken) {
          // Verify it's still valid
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const { data: meRes } = await api.get('/auth/me');
          if (meRes.success) {
            setUser(meRes.data);
            setIsLoading(false);
            return;
          }
        }

        // If no stored token or it's invalid, try refresh token from cookie
        const { data: refreshRes } = await api.post('/auth/refresh');
        if (refreshRes.success && refreshRes.data.accessToken) {
          setAccessToken(refreshRes.data.accessToken);
          const { data: meRes } = await api.get('/auth/me');
          if (meRes.success) {
            setUser(meRes.data);
          }
        }
      } catch {
        // No valid session — user stays logged out
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        setUser,
        setAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
