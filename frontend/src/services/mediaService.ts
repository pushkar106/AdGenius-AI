import { api } from '../api/client';
import { ApiResponse, MediaAsset, MediaType, PageResponse } from '../types';

export const mediaService = {
  async list(type?: MediaType, page = 0, size = 24) {
    const res = await api.get<ApiResponse<PageResponse<MediaAsset>>>('/media', {
      params: { type, page, size },
    });
    return res.data;
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<MediaAsset>>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete<ApiResponse<void>>(`/media/${id}`);
    return res.data;
  },

  getDownloadUrl(id: number) {
    return `/api/v1/media/${id}/download`;
  },
};
