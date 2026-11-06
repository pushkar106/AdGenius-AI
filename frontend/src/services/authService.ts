import { api } from '../api/client';
import { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  async register(data: { email: string; password: string; fullName: string; company?: string }) {
    const res = await api.post<ApiResponse<{ email: string; fullName: string; emailVerificationSent: boolean; devVerificationToken?: string }>>(
      '/auth/register',
      data
    );
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await api.post<ApiResponse<any>>('/auth/logout');
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post<ApiResponse<any>>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await api.post<ApiResponse<any>>('/auth/reset-password', { token, newPassword });
    return res.data;
  },

  async verifyEmail(token: string) {
    const res = await api.post<ApiResponse<any>>('/auth/verify-email', { token });
    return res.data;
  },

  async resendVerification(email: string) {
    const res = await api.post<ApiResponse<any>>('/auth/resend-verification', { email });
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await api.post<ApiResponse<any>>('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<User>>('/users/me');
    return res.data;
  },

  async updateMe(data: Partial<User>) {
    const res = await api.put<ApiResponse<User>>('/users/me', data);
    return res.data;
  },

  async getStats() {
    const res = await api.get<ApiResponse<{ totalProducts: number; totalAds: number; creditBalance: number; activeJobs: number }>>(
      '/users/me/stats'
    );
    return res.data;
  },
};
