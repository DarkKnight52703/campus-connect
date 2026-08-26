import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL });
const adminApi = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// User API
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const getUserProfile = () => api.get('/api/user/profile');
export const getMyMatch = () => api.get('/api/user/my-match');

// Admin API
export const adminLogin = (data) => adminApi.post('/api/admin/login', data);
export const getAdminStats = () => adminApi.get('/api/admin/stats');
export const getUsers = () => adminApi.get('/api/admin/users');
export const getEvents = () => adminApi.get('/api/admin/events');
export const createEvent = (data) => adminApi.post('/api/admin/events', data);
export const getEvent = (id) => adminApi.get(`/api/admin/events/${id}`);
export const deleteEvent = (id) => adminApi.delete(`/api/admin/events/${id}`);
export const setSpecialPair = (eventId, data) => adminApi.post(`/api/admin/events/${eventId}/special-pair`, data);
export const shuffleEvent = (eventId) => adminApi.post(`/api/admin/events/${eventId}/shuffle`);
export const revealEvent = (eventId) => adminApi.post(`/api/admin/events/${eventId}/reveal`);
export const getEventMatches = (eventId) => adminApi.get(`/api/admin/events/${eventId}/matches`);
