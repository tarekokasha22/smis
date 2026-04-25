import api from '../axios';

// رفع ملف يستخدم multipart/form-data
const uploadFile = (formData, onUploadProgress) =>
  api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const filesApi = {
  // قائمة الملفات مع الفلترة
  getAll: (params = {}) => api.get('/files', { params }),

  // إحصائيات الملفات
  getStats: () => api.get('/files/stats'),

  // تفاصيل ملف
  getById: (id) => api.get(`/files/${id}`),

  // رفع ملف جديد
  upload: uploadFile,

  // تحديث بيانات ملف
  update: (id, data) => api.put(`/files/${id}`, data),

  // حذف ملف
  delete: (id) => api.delete(`/files/${id}`),

  // رابط تحميل ملف (مباشر عبر auth header)
  getDownloadUrl: (id) => `/api/v1/files/${id}/download`,
};
