import { api } from '../api/client';
import { AdminMetrics, ApiResponse, PageResponse, User } from '../types';

export const adminService = {
  async getDashboard() {
    const res = await api.get<ApiResponse<AdminMetrics>>('/admin/dashboard');
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get<ApiResponse<any>>('/admin/analytics');
    return res.data;
  },

  async getUsers(params?: { q?: string; page?: number; size?: number; sortBy?: string; direction?: string }) {
    const res = await api.get<ApiResponse<PageResponse<User>>>('/admin/users', { params });
    return res.data;
  },

  async blockUser(id: number, blocked: boolean) {
    const res = await api.post<ApiResponse<User>>(`/admin/users/${id}/block`, null, {
      params: { blocked },
    });
    return res.data;
  },

  async assignRole(id: number, role: string) {
    const res = await api.post<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  async adjustCredits(id: number, amount: number, reason: string) {
    const res = await api.post<ApiResponse<{ balanceAfter: number; amount: number }>>(`/admin/users/${id}/credits`, {
      amount,
      reason,
    });
    return res.data;
  },

  async getJobs(params?: { status?: string; page?: number; size?: number }) {
    const res = await api.get<ApiResponse<PageResponse<any>>>('/admin/jobs', { params });
    return res.data;
  },

  async getLogs(page = 0, size = 20) {
    const res = await api.get<ApiResponse<PageResponse<any>>>('/admin/logs', {
      params: { page, size },
    });
    return res.data;
  },
};
