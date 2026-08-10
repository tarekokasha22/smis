import axios from 'axios';
import useAuthStore from '../store/authStore';
import { getMockForUrl } from './mockData';

const BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE ? `${BASE}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن لكل طلب
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// معالجة الاستجابات وتجديد التوكن
api.interceptors.response.use(
  (response) => {
    // Vercel's SPA catch-all rewrite returns index.html (string) for API paths
    // when no backend is configured — detect and swap in mock data
    if (typeof response.data === 'string') {
      const mock = getMockForUrl(response.config?.url);
      if (mock) return { ...response, data: mock };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // إذا انتهت صلاحية التوكن - حاول التجديد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          return Promise.reject(error);
        }

        const { data } = await axios.post(BASE ? `${BASE}/api/v1/auth/refresh` : '/api/v1/auth/refresh', {
          refreshToken,
        });

        if (data.success) {
          useAuthStore.getState().setTokens(
            data.data.accessToken,
            data.data.refreshToken
          );
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Fall back to mock data when backend is unreachable
    const method = error.config?.method?.toLowerCase();
    const mock = getMockForUrl(error.config?.url);
    if (mock) return Promise.resolve({ data: mock });

    return Promise.reject(error);
  }
);

export default api;
