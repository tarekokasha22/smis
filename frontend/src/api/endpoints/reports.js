import api from '../axios';

export const reportsApi = {
  // قائمة اللاعبين للتقارير
  getPlayers: () => api.get('/reports/players'),

  // تقرير صحة الفريق
  getTeamHealthReport: (params = {}) => api.get('/reports/team-health', { params }),

  // تقرير لاعب محدد
  getPlayerReport: (playerId) => api.get(`/reports/player/${playerId}`),

  // تقرير الإصابات
  getInjuryReport: (params = {}) => api.get('/reports/injuries', { params }),

  // تقرير التأهيل
  getRehabReport: (params = {}) => api.get('/reports/rehabilitation', { params }),

  // تقرير المؤشرات الحيوية
  getVitalsReport: (params = {}) => api.get('/reports/vitals', { params }),

  // تقرير المواعيد
  getAppointmentsReport: (params = {}) => api.get('/reports/appointments', { params }),

  // تقرير تقييم الأداء
  getPerformanceReport: (params = {}) => api.get('/reports/performance', { params }),

  // تقرير المعدات والصيانة
  getEquipmentReport: (params = {}) => api.get('/reports/equipment', { params }),

  // تقرير المستلزمات والمخزون
  getSuppliesReport: (params = {}) => api.get('/reports/supplies', { params }),

  // تقرير قياسات الجسم
  getMeasurementsReport: (params = {}) => api.get('/reports/measurements', { params }),
};
