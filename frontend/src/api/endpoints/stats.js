import api from '../axios';

export const statsApi = {
  getAnalytics: (params) => api.get('/statistics/analytics', { params }),
};
