import api from '../axios';

export const usersApi = {
  getAll: (params = {}) => api.get('/users', { params }),

  getMeta: () => api.get('/users/meta'),

  getById: (id) => api.get(`/users/${id}`),

  create: (data) => api.post('/users', data),

  update: (id, data) => api.put(`/users/${id}`, data),

  resetPassword: (id, password) => api.post(`/users/${id}/reset-password`, { password }),

  toggleStatus: (id, is_active) => api.patch(`/users/${id}/status`, { is_active }),

  delete: (id) => api.delete(`/users/${id}`),
};