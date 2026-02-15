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
  initAuth: () => void;
}

// Helper functions para localStorage
const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  initAuth: () => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
    set({
      token,
      user,
      isAuthenticated: !!token,
    });
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    const { token, email: userEmail, role } = response.data;
    const user = { id: 0, email: userEmail, fullName: '', role, active: true };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    set({
      token,
      user,
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
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common.Authorization;
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
}));
