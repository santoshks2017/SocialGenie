import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import api from '../services/api';
import type { UserInfo } from '../lib/permissions';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Shown when auth is bypassed and no real user is logged in
const DEMO_USER: UserInfo = {
  id: 'demo',
  name: 'Demo User',
  role: 'owner',
  dealer_id: null,
  permissions: {
    create_post: true, approve_post: true, publish_post: true,
    run_boost: true, manage_inventory: true, view_reports: true,
    view_inbox: true, reply_inbox: true, manage_users: true, view_billing: true,
  },
  onboarding_completed: true,
  onboarding_step: 4,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user_info');
    return stored ? (JSON.parse(stored) as UserInfo) : DEMO_USER;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (phone: string, otp: string): Promise<UserInfo> => {
    setIsLoading(true);
    try {
      const res = await authService.verifyOtp(phone, otp);
      const userInfo: UserInfo = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role as UserInfo['role'],
        dealer_id: res.user.dealer_id,
        permissions: res.user.permissions as UserInfo['permissions'],
        onboarding_completed: res.user.onboarding_completed,
        onboarding_step: res.user.onboarding_step,
      };
      localStorage.setItem('access_token', res.token);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      setToken(res.token);
      setUser(userInfo);
      return userInfo;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  }, []);

  // Validate/refresh token on mount
  useEffect(() => {
    if (!token) return;
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          authService.refreshToken(refreshToken)
            .then((res) => { localStorage.setItem('access_token', res.token); setToken(res.token); })
            .catch(() => logout());
        } else {
          logout();
        }
      }
    } catch {
      logout();
    }
  }, [logout]);

  // Listen for forced logout events dispatched by the api client (e.g. refresh failed)
  useEffect(() => {
    const handleForceLogout = () => logout();
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [logout]);

  // Fetch user info from API if token exists but user is missing from localStorage
  useEffect(() => {
    if (!token || user) return;
    api.get<{ user: { id: string; name: string; role: string; dealerId: string | null; permissions: Record<string, boolean> } }>('/users/me')
      .then((res) => {
        const u = res.user;
        const userInfo: UserInfo = {
          id: u.id,
          name: u.name,
          role: u.role as UserInfo['role'],
          dealer_id: u.dealerId,
          permissions: u.permissions as UserInfo['permissions'],
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        setUser(userInfo);
      })
      .catch(() => { /* token may be invalid; JWT refresh effect handles logout */ });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
