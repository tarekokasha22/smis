import api from '../axios';

export const equipmentApi = {
  // ==========================================
  // المعدات الطبية
  // ==========================================

  // إحصائيات المعدات
  getStats: () => api.get('/equipment/stats'),

  // قائمة المعدات مع فلترة
  getAll: (params = {}) => api.get('/equipment', { params }),

  // تفاصيل معدة + سجلات الصيانة
  getById: (id) => api.get(`/equipment/${id}`),

  // إنشاء معدة جديدة
  create: (data) => api.post('/equipment', data),

  // تحديث معدة
  update: (id, data) => api.put(`/equipment/${id}`, data),

  // حذف معدة
  delete: (id) => api.delete(`/equipment/${id}`),

  // سجلات الصيانة لمعدة
  getMaintenanceRecords: (id) => api.get(`/equipment/${id}/maintenance`),

  // إضافة سجل صيانة
  addMaintenance: (id, data) => api.post(`/equipment/${id}/maintenance`, data),

  // ==========================================
  // المستلزمات والأدوية
  // ==========================================

  // إحصائيات المستلزمات
  getSuppliesStats: () => api.get('/equipment/supplies/stats'),

  // قائمة المستلزمات
  getAllSupplies: (params = {}) => api.get('/equipment/supplies/list', { params }),

  // إنشاء مستلزم
  createSupply: (data) => api.post('/equipment/supplies', data),

  // تحديث مستلزم
  updateSupply: (id, data) => api.put(`/equipment/supplies/${id}`, data),

  // حذف مستلزم
  deleteSupply: (id) => api.delete(`/equipment/supplies/${id}`),

  // تسجيل معاملة مخزون
  recordTransaction: (id, data) => api.post(`/equipment/supplies/${id}/transaction`, data),

  // تفاصيل مستلزم واحد (مع آخر المعاملات)
  getSupplyById: (id) => api.get(`/equipment/supplies/${id}`),

  // سجل معاملات مستلزم
  getSupplyTransactions: (id, params = {}) => api.get(`/equipment/supplies/${id}/transactions`, { params }),

  // سجل معاملات حسب اللاعب
  getPlayerTransactions: (playerId, params = {}) => api.get(`/equipment/supplies/player/${playerId}/transactions`, { params }),
};
