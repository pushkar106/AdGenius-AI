import { api } from '../api/client';
import { ApiResponse, Subscription, SubscriptionPlan } from '../types';

export const subscriptionService = {
  async getPlans() {
    const res = await api.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
    return res.data;
  },

  async getCurrent() {
    const res = await api.get<ApiResponse<Subscription>>('/subscriptions/current');
    return res.data;
  },

  async checkout(planCode: string, interval: 'MONTHLY' | 'YEARLY') {
    const res = await api.post<ApiResponse<{
      orderId: string;
      keyId: string;
      amountPaise: number;
      currency: string;
      demoMode: boolean;
    }>>('/subscriptions/checkout', { planCode, interval });
    return res.data;
  },

  async cancel() {
    const res = await api.post<ApiResponse<void>>('/subscriptions/cancel');
    return res.data;
  },
};
