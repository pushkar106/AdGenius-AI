import { api } from '../api/client';
import { ApiResponse, CreditAccount, CreditTransaction, PageResponse } from '../types';

export const creditService = {
  async getBalance() {
    const res = await api.get<ApiResponse<CreditAccount>>('/credits/balance');
    return res.data;
  },

  async getTransactions(page = 0, size = 20) {
    const res = await api.get<ApiResponse<PageResponse<CreditTransaction>>>('/credits/transactions', {
      params: { page, size },
    });
    return res.data;
  },
};
