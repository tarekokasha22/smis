import api from '../axios';

export const authAPI = {
  // تسجيل الدخول
  login: (credentials) => api.post('/auth/login', credentials),

  // تسجيل الخروج 
  logout: () => api.post('/auth/logout'),

  // الحصول على بيانات المستخدم الحالي
  getMe: () => api.get('/auth/me'),

  // تجديد التوكن
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  // نسيت كلمة المرور
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // إعادة تعيين كلمة المرور
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
