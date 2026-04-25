import api from '../axios';

export const performanceApi = {
  getAll: (params = {}) => api.get('/performance', { params }),
  getMeta: () => api.get('/performance/meta'),
  getPlayerHistory: (playerId, params = {}) => api.get(`/performance/player/${playerId}`, { params }),
  getTeamAverage: (params = {}) => api.get('/performance/team-average', { params }),
  getById: (id) => api.get(`/performance/${id}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
};