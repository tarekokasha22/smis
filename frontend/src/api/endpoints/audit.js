import api from '../axios';

export const auditApi = {
  getAll: (params = {}) => api.get('/audit', { params }),

  getMeta: () => api.get('/audit/meta'),

  getById: (id) => api.get(`/audit/${id}`),

  export: (params = {}) => api.get('/audit/export', { params }),
};