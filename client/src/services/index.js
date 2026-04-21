import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateEvent: (id, data) => api.put(`/events/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getMyEvents: (params) => api.get('/events/my-events', { params }),
};

export const registrationService = {
  register: (eventId) => api.post(`/registrations/${eventId}`),
  cancel: (eventId) => api.delete(`/registrations/${eventId}`),
  getMyTickets: (params) => api.get('/registrations/my-tickets', { params }),
  getParticipants: (eventId) => api.get(`/registrations/event/${eventId}`),
  verifyQR: (qrData) => api.post('/registrations/verify-qr', { qrData }),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getPendingEvents: () => api.get('/admin/events/pending'),
  approveEvent: (id) => api.put(`/admin/events/${id}/approve`),
  rejectEvent: (id, reason) => api.put(`/admin/events/${id}/reject`, { reason }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getReports: (params) => api.get('/admin/reports', { params }),
};
