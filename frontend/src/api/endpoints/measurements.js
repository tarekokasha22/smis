import api from '../axios';

export const measurementsApi = {
  // الحصول على قائمة القياسات
  getAll: (params = {}) => api.get('/measurements', { params }),

  // الحصول على إحصائيات القياسات
  getStats: () => api.get('/measurements/stats'),

  // الحصول على تفاصيل قياس محدد
  getById: (id) => api.get(`/measurements/${id}`),

  // الحصول على جميع قياسات لاعب معين لتكوين الرسوم البيانية
  getPlayerMeasurements: (playerId, params = {}) =>
    api.get(`/measurements/player/${playerId}`, { params }),

  // إنشاء قياس جديد
  create: (data) => api.post('/measurements', data),

  // تحديث بيانات قياس معين
  update: (id, data) => api.put(`/measurements/${id}`, data),

  // حذف قياس
  delete: (id) => api.delete(`/measurements/${id}`),
};
