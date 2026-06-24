// src/services/portalService.js
import api from './api';

export const studentService = {
  getAll: (search) => api.get('/students', { params: { search } }).then((r) => r.data),
  getMe: () => api.get('/students/me').then((r) => r.data),
  getById: (id) => api.get(`/students/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/students/${id}`, payload).then((r) => r.data),
  uploadAvatar: (id, file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api
      .post(`/students/${id}/avatar`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};

export const scheduleService = {
  getAll: (search) => api.get('/schedules', { params: { search } }).then((r) => r.data),
  getById: (id) => api.get(`/schedules/${id}`).then((r) => r.data),
};

export const announcementService = {
  getAll: (category) => api.get('/announcements', { params: { category } }).then((r) => r.data),
  getById: (id) => api.get(`/announcements/${id}`).then((r) => r.data),
  create: (payload) => api.post('/announcements', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/announcements/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/announcements/${id}`).then((r) => r.data),
};

export const bookService = {
  getAll: (search) => api.get('/books', { params: { search } }).then((r) => r.data),
  getById: (id) => api.get(`/books/${id}`).then((r) => r.data),
};

export const facultyService = {
  getAll: (search) => api.get('/faculty', { params: { search } }).then((r) => r.data),
  getById: (id) => api.get(`/faculty/${id}`).then((r) => r.data),
};

export const eventService = {
  getAll: () => api.get('/events').then((r) => r.data),
  getById: (id) => api.get(`/events/${id}`).then((r) => r.data),
  register: (eventId) => api.post('/events/register', { eventId }).then((r) => r.data),
  myRegistrations: () => api.get('/events/registrations/mine').then((r) => r.data),
};
