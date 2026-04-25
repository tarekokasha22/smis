import api from '../axios';

export const rehabApi = {
  // الحصول على الإحصائيات
  getStats: () => api.get('/rehabilitation/stats'),

  // الحصول على قائمة المعالجين
  getTherapists: () => api.get('/rehabilitation/therapists'),

  // الحصول على برامج التأهيل مع الفلترة
  getAll: (params = {}) => api.get('/rehabilitation', { params }),

  // تفاصيل برنامج
  getById: (id) => api.get(`/rehabilitation/${id}`),

  // إنشاء برنامج جديد
  create: (data) => api.post('/rehabilitation', data),

  // تحديث بيانات البرنامج
  update: (id, data) => api.put(`/rehabilitation/${id}`, data),

  // تحديث حالة البرنامج (مكتمل، موقوف، إلغاء)
  updateStatus: (id, data) => api.patch(`/rehabilitation/${id}/status`, data),

  // تحديث تقدم ومرحلة البرنامج
  updateProgress: (id, data) => api.patch(`/rehabilitation/${id}/progress`, data),

  // حذف برنامج
  delete: (id) => api.delete(`/rehabilitation/${id}`),

  // إضافة جلسة لبرنامج
  addSession: (programId, data) => api.post(`/rehabilitation/${programId}/sessions`, data),

  // تحديث جلسة
  updateSession: (sessionId, data) => api.put(`/rehabilitation/sessions/${sessionId}`, data),

  // حذف جلسة
  deleteSession: (sessionId) => api.delete(`/rehabilitation/sessions/${sessionId}`),
};
