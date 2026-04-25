import api from '../axios';

export const injuriesApi = {
  // الحصول على قائمة الإصابات
  getAll: (params = {}) => api.get('/injuries', { params }),

  // الحصول على إحصائيات الإصابات
  getStats: (params = {}) => api.get('/injuries/stats', { params }),

  // الحصول على تفاصيل إصابة
  getById: (id) => api.get(`/injuries/${id}`),

  // إنشاء إصابة جديدة
  create: (data) => api.post('/injuries', data),

  // تحديث إصابة
  update: (id, data) => api.put(`/injuries/${id}`, data),

  // إغلاق إصابة (تعافى)
  close: (id, data) => api.patch(`/injuries/${id}/close`, data),

  // تحديث حالة الإصابة
  updateStatus: (id, status) => api.patch(`/injuries/${id}/status`, { status }),

  // حذف إصابة
  delete: (id) => api.delete(`/injuries/${id}`),

  // الحصول على قائمة الأطباء المعالجين
  getDoctors: () => api.get('/injuries/doctors'),

  // الحصول على إصابات لاعب معين
  getByPlayer: (playerId, params = {}) => api.get('/injuries', { params: { player_id: playerId, limit: 50, ...params } }),
};
