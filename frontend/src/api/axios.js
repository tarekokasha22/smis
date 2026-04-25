import axios from 'axios';
import useAuthStore from '../store/authStore';

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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // إذا انتهت صلاحية التوكن - حاول التجديد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().logout();
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

    return Promise.reject(error);
  }
);

export default api;
