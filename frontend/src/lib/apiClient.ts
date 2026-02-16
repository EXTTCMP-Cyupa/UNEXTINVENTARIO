import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token JWT
apiClient.interceptors.request.use((config) => {
  const storeToken = useAuthStore.getState().token;
  const token = storeToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) {
    config.headers = config.headers || {};
    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de error para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // El error será manejado por la aplicación, no aquí
    // Para evitar loops infinitos de actualización de auth state
    return Promise.reject(error);
  }
);

export default apiClient;
