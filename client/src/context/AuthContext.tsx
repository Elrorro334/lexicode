import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, getToken, setToken } from '../lib/api';
import type { Achievement, ThemePreference, UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  theme: ThemePreference;
  toastAchievement: Achievement | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; track: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  toggleTheme: () => Promise<void>;
  notifyAchievements: (items?: Achievement[]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemePreference>('vscode-dark');
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<{ user: UserProfile }>('/api/auth/me')
      .then((res) => {
        setUser(res.user);
        if (res.user.theme_preference) {
          setTheme(res.user.theme_preference);
        }
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(res.token);
    setUser(res.user);
    if (res.user.theme_preference) setTheme(res.user.theme_preference);
  };

  const register = async (payload: { name: string; email: string; password: string; track: string }) => {
    const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: UserProfile) => {
    setUser(updated);
    if (updated.theme_preference) setTheme(updated.theme_preference);
  };

  const toggleTheme = async () => {
    const next: ThemePreference = theme === 'vscode-dark' ? 'nord' : 'vscode-dark';
    setTheme(next);
    if (user) {
      try {
        const res = await apiFetch<{ user: UserProfile }>('/api/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({ theme_preference: next })
        });
        setUser(res.user);
      } catch {
        // Keep local theme even if offline
      }
    }
  };

  const notifyAchievements = (items?: Achievement[]) => {
    if (items && items.length > 0) {
      setToastAchievement(items[0]);
      setTimeout(() => setToastAchievement(null), 5000);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        toastAchievement,
        login,
        register,
        logout,
        updateUser,
        toggleTheme,
        notifyAchievements
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
