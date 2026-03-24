import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { UserInfo } from '../lib/permissions';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user_info');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

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
