import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  credits: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  updateCredits: (credits: number) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const STORAGE_KEY_TOKEN = 'adgenius_access_token';
const STORAGE_KEY_USER = 'adgenius_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  accessToken: localStorage.getItem(STORAGE_KEY_TOKEN) || null,
  credits: 50,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEY_TOKEN),
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
  },

  updateUser: (partial) =>
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return { user: updated };
    }),

  updateCredits: (credits) => set({ credits }),

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    set({ user: null, accessToken: null, isAuthenticated: false, credits: 0, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
