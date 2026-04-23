import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Car, RefreshCw } from 'lucide-react';
import type { UserInfo } from '../lib/permissions';
import api from '../services/api';

interface AuthCallbackPageProps {
  onLogin: (token: string, refresh: string, user: UserInfo) => void;
}

export default function AuthCallbackPage({ onLogin }: AuthCallbackPageProps) {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh') ?? '';

    if (!token) {
      window.location.href = '/login?error=oauth_failed';
      return;
    }

    // Decode JWT to get user info
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload)) as {
        dealer_user_id: string;
        dealer_id: string | null;
        role: string;
        phone: string;
        permissions: Record<string, boolean>;
      };

      // Store tokens first so API calls can work
      localStorage.setItem('access_token', token);
      if (refresh) localStorage.setItem('refresh_token', refresh);

      // Fetch full user info from API
      api.get<{ user: { id: string; name: string; role: string; dealerId: string | null; permissions: Record<string, boolean> } }>('/users/me')
        .then((res) => {
          const userInfo: UserInfo = {
            id: decoded.dealer_user_id,
            name: res.user.name,
            role: decoded.role as UserInfo['role'],
            dealer_id: decoded.dealer_id,
            permissions: decoded.permissions as UserInfo['permissions'],
            onboarding_completed: false,
            onboarding_step: 2,
          };
          localStorage.setItem('user_info', JSON.stringify(userInfo));
          onLogin(token, refresh, userInfo);
        })
        .catch(() => {
          // Even if /users/me fails, use the JWT payload data
          const userInfo: UserInfo = {
            id: decoded.dealer_user_id,
            name: 'User',
            role: decoded.role as UserInfo['role'],
            dealer_id: decoded.dealer_id,
            permissions: decoded.permissions as UserInfo['permissions'],
            onboarding_completed: false,
            onboarding_step: 2,
          };
          localStorage.setItem('user_info', JSON.stringify(userInfo));
          onLogin(token, refresh, userInfo);
        });
    } catch {
      window.location.href = '/login?error=invalid_token';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#141824] to-[#1a1f2e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-500/30">
          <Car className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Completing sign-in…
        </div>
      </div>
    </div>
  );
}
