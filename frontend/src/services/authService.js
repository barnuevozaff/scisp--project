// src/services/authService.js
import api from './api';

export const authService = {
  login: (identifier, password) =>
    api.post('/auth/login', { identifier, password }).then((res) => res.data),

  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),

  loginWithGoogle: (idToken) => api.post('/auth/google', { idToken }).then((res) => res.data),

  logout: () => api.post('/auth/logout').then((res) => res.data),
};
