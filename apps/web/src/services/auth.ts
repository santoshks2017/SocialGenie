import api from './api';
import type {
  Dealer,
  DealerFormData,
  PlatformConnection,
  ApiResponse,
} from '@cardeko/shared';

export interface LoginRequest {
  phone: string;
  otp: string;
}

export interface LoginResponse {
  dealer: Dealer;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  phone: string;
  name: string;
  city: string;
  brands: string[];
}

export const authService = {
  sendOtp: (phone: string) =>
    api.post<{ success: boolean; message: string }>('/auth/otp/send', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post<{ token: string; refreshToken: string; dealer: { id: string; name: string; onboarding_completed: boolean; onboarding_step: number } }>('/auth/otp/verify', { phone, otp }),

  refreshToken: (refreshToken: string) =>
    api.post<{ token: string }>('/auth/refresh', { refreshToken }),
};

export const dealerService = {
  getProfile: () =>
    api.get<ApiResponse<Dealer>>('/dealer/profile'),
  
  updateProfile: (data: Partial<DealerFormData>) =>
    api.patch<ApiResponse<Dealer>>('/dealer/profile', data),
  
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.upload<ApiResponse<{ logoUrl: string }>>('/dealer/logo', formData);
  },
  
  getDashboardStats: () =>
    api.get<ApiResponse<{
      postsThisMonth: number;
      postsChange: number;
      totalReach: number;
      reachChange: number;
      leadsGenerated: number;
      leadsChange: number;
      inboxPending: number;
      negativeReviews: number;
    }>>('/dealer/stats'),
};

export const platformService = {
  getConnections: () =>
    api.get<ApiResponse<PlatformConnection[]>>('/platforms'),
  
  connect: (platform: string) =>
    api.post<ApiResponse<{ authUrl: string }>>(`/platforms/${platform}/connect`),
  
  disconnect: (platform: string) =>
    api.delete<ApiResponse<void>>(`/platforms/${platform}`),
  
  refreshToken: (platform: string) =>
    api.post<ApiResponse<PlatformConnection>>(`/platforms/${platform}/refresh`),
  
  getOAuthUrl: (platform: string) =>
    api.get<ApiResponse<{ url: string }>>(`/platforms/${platform}/oauth-url`),
  
  handleCallback: (platform: string, code: string) =>
    api.post<ApiResponse<PlatformConnection>>(`/platforms/${platform}/callback`, { code }),
};
