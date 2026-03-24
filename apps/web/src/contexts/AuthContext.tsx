import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';

interface DealerInfo {
  id: string;
  name: string;
  onboarding_completed: boolean;
  onboarding_step: number;
}

interface AuthContextType {
  dealer: DealerInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<DealerInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [dealer, setDealer] = useState<DealerInfo | null>(() => {
    const stored = localStorage.getItem('dealer_info');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate token on mount — if stored token is expired, clear it
  useEffect(() => {
    if (!token) return;
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        // Try to refresh using stored refreshToken
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          authService.refreshToken(refreshToken)
            .then((res) => {
              localStorage.setItem('access_token', res.token);
              setToken(res.token);
            })
            .catch(() => logout());
        } else {
          logout();
        }
      }
    } catch {
      logout();
    }
  }, []);

  const login = useCallback(async (phone: string, otp: string): Promise<DealerInfo> => {
    setIsLoading(true);
    try {
      const res = await authService.verifyOtp(phone, otp);
      localStorage.setItem('access_token', res.token);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('dealer_info', JSON.stringify(res.dealer));
      setToken(res.token);
      setDealer(res.dealer);
      return res.dealer;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('dealer_info');
    setToken(null);
    setDealer(null);
  }, []);

  return (
    <AuthContext.Provider value={{ dealer, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
