import api from '../axios';

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getActivity: (limit = 10) => api.get('/dashboard/activity', { params: { limit } }),
  getTodayAppointments: () => api.get('/dashboard/today-appointments'),
  getCharts: () => api.get('/dashboard/charts'),
};
