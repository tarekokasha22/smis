import api from '../axios';

export const vitalsApi = {
  // الحصول على قائمة القياسات مع فلترة
  getAll: (params = {}) => api.get('/vitals', { params }),

  // نظرة عامة على آخر قياس لكل لاعب
  getOverview: () => api.get('/vitals/overview'),

  // إحصائيات وتحليلات المؤشرات الحيوية
  getStats: (params = {}) => api.get('/vitals/stats', { params }),

  // الحصول على تفاصيل قياس واحد
  getById: (id) => api.get(`/vitals/${id}`),

  // الحصول على مؤشرات لاعب بعينه مع الرسوم البيانية
  getPlayerVitals: (playerId, params = {}) =>
    api.get(`/vitals/player/${playerId}`, { params }),

  // إنشاء قياس جديد
  create: (data) => api.post('/vitals', data),

  // إنشاء قياسات جماعية لأكثر من لاعب
  createBulk: (data) => api.post('/vitals/bulk', data),

  // تحديث قياس
  update: (id, data) => api.put(`/vitals/${id}`, data),

  // حذف قياس
  delete: (id) => api.delete(`/vitals/${id}`),
};
