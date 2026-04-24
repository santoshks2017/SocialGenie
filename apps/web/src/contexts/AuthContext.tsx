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
  loginWithToken: (token: string, refresh: string, user: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function makeOfflineDemoSession(): { token: string; user: UserInfo } {
  const user: UserInfo = {
    id: 'demo-offline', name: 'Demo User', role: 'admin',
    dealer_id: 'demo-dealer', permissions: {} as UserInfo['permissions'],
    onboarding_completed: true, onboarding_step: 4,
  };
  const payload = btoa(JSON.stringify({
    dealer_user_id: 'demo-offline', dealer_id: 'demo-dealer',
    role: 'admin', phone: 'demo', permissions: {},
    exp: Math.floor(Date.now() / 1000) + 86400 * 30,
  }));
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.OFFLINE_DEMO`;
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('access_token');
    if (stored) return stored;
    const { token: demoToken, user: demoUser } = makeOfflineDemoSession();
    localStorage.setItem('access_token', demoToken);
    localStorage.setItem('user_info', JSON.stringify(demoUser));
    return demoToken;
  });
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user_info');
    if (!stored) return null;
    try { return JSON.parse(stored) as UserInfo; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginWithToken = useCallback((accessToken: string, refreshToken: string, userInfo: UserInfo) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
  }, []);

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
      loginWithToken(res.token, res.refreshToken, userInfo);
      return userInfo;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  }, []);

  // Validate/refresh token on mount
  useEffect(() => {
    if (!token || token.endsWith('.OFFLINE_DEMO')) return;
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
    if (!token || user || token.endsWith('.OFFLINE_DEMO')) return;
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
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
