import api from '../axios';

export const playersApi = {
  // الحصول على قائمة اللاعبين
  getAll: (params = {}) => api.get('/players', { params }),

  // الحصول على البيانات الوصفية (فلاتر)
  getMeta: () => api.get('/players/meta'),

  // الحصول على تفاصيل لاعب
  getById: (id) => api.get(`/players/${id}`),

  // إنشاء لاعب جديد
  create: (data) => api.post('/players', data),

  // تحديث لاعب
  update: (id, data) => api.put(`/players/${id}`, data),

  // تغيير حالة اللاعب
  toggleStatus: (id, is_active) => api.patch(`/players/${id}/status`, { is_active }),

  // حذف لاعب
  delete: (id) => api.delete(`/players/${id}`),

  // رفع صورة
  uploadPhoto: (id, formData) => api.post(`/players/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // الحصول على سجل اللاعب
  getTimeline: (id, params = {}) => api.get(`/players/${id}/timeline`, { params }),
};
