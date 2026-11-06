import { api } from '../api/client';
import { ApiResponse, PageResponse, Product, AdCategory } from '../types';

export const productService = {
  async list(params?: { category?: AdCategory; q?: string; page?: number; size?: number; sort?: string }) {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data;
  },

  async get(id: number) {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  async create(data: {
    name: string;
    description?: string;
    category: AdCategory;
    referenceImageUrl?: string;
    brandVoice?: string;
    targetAudience?: string;
  }) {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },

  async update(id: number, data: Partial<Product>) {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete<ApiResponse<void>>(`/products/${id}`);
    return res.data;
  },
};
