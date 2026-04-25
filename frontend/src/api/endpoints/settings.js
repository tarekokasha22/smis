import api from '../axios';

export const settingsApi = {
  getMeta: () => api.get('/settings/meta'),

  getClub: () => api.get('/settings/club'),

  updateClub: (data) => api.put('/settings/club', data),

  uploadLogo: (formData) => api.post('/settings/club/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  getProfile: () => api.get('/settings/profile'),

  updateProfile: (data) => api.put('/settings/profile', data),

  uploadAvatar: (formData) => api.post('/settings/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  changePassword: (data) => api.post('/settings/change-password', data),
};