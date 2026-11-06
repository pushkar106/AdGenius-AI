import { api } from '../api/client';
import { Advertisement, ApiResponse, PageResponse } from '../types';

export const adService = {
  async list(params?: { productId?: number; favorite?: boolean; page?: number; size?: number }) {
    const res = await api.get<ApiResponse<PageResponse<Advertisement>>>('/advertisements', { params });
    return res.data;
  },

  async get(id: number) {
    const res = await api.get<ApiResponse<Advertisement>>(`/advertisements/${id}`);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete<ApiResponse<void>>(`/advertisements/${id}`);
    return res.data;
  },

  async toggleFavorite(id: number) {
    const res = await api.post<ApiResponse<{ favorite: boolean }>>(`/advertisements/${id}/favorite`);
    return res.data;
  },
};
