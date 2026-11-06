import { api } from '../api/client';
import { ApiResponse, GenerationJob, JobType, PageResponse } from '../types';

export const aiService = {
  async generateImage(formData: FormData) {
    const res = await api.post<ApiResponse<GenerationJob>>('/ai/images/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async generateVideo(formData: FormData) {
    const res = await api.post<ApiResponse<GenerationJob>>('/ai/videos/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async generateContent(data: {
    productId?: number;
    productName: string;
    productDescription?: string;
    avatarId?: string;
    tone?: string;
  }) {
    const res = await api.post<ApiResponse<any>>('/ai/content/generate', data);
    return res.data;
  },

  async getJob(id: number) {
    const res = await api.get<ApiResponse<GenerationJob>>(`/ai/jobs/${id}`);
    return res.data;
  },

  async listJobs(type?: JobType, page = 0, size = 12) {
    const res = await api.get<ApiResponse<PageResponse<GenerationJob>>>('/ai/jobs', {
      params: { type, page, size },
    });
    return res.data;
  },

  async retryJob(id: number) {
    const res = await api.post<ApiResponse<GenerationJob>>(`/ai/jobs/${id}/retry`);
    return res.data;
  },
};
