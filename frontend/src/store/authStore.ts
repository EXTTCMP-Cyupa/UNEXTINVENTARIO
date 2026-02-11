import { create } from 'zustand';
import apiClient from '@/lib/apiClient';
import { User, LoginResponse } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

  login: async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    const { token, email: userEmail, role } = response.data;
    localStorage.setItem('token', token);
    set({
      token,
      user: { id: 0, email: userEmail, fullName: '', role, active: true },
      isAuthenticated: true,
    });
  },

  register: async (email: string, password: string, fullName: string) => {
    await apiClient.post('/auth/register', {
      email,
      password,
      fullName,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
