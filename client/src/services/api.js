import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Users
export const updateProfile = (data) => api.put('/users/profile', data);
export const getAllUsers = () => api.get('/users');
export const getUserStats = () => api.get('/users/stats');

// Emergency Alerts
export const createEmergencyAlert = (data) => api.post('/emergency-alerts', data);
export const getEmergencyAlerts = (status = 'active') => api.get(`/emergency-alerts?status=${status}`);
export const getAllEmergencyAlerts = () => api.get('/emergency-alerts/all');
export const getEmergencyAlertById = (id) => api.get(`/emergency-alerts/${id}`);

// Blood Requests
export const createBloodRequest = (data) => api.post('/blood-requests', data);
export const getBloodRequests = (status = 'active') => api.get(`/blood-requests?status=${status}`);
export const getAllBloodRequests = () => api.get('/blood-requests/all');
export const getBloodRequestById = (id) => api.get(`/blood-requests/${id}`);

// Donor Responses
export const respondToBloodRequest = (data) => api.post('/donor-responses', data);
export const getResponsesForRequest = (requestId) => api.get(`/donor-responses/request/${requestId}`);
export const getMyResponses = () => api.get('/donor-responses/mine');

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

export default api;
