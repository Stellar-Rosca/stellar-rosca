import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Add any authentication logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', error);
    return Promise.reject(new Error(message));
  }
);

// Contract API
export const contractAPI = {
  getInfo: () => api.get('/contract/info'),
  getEvents: (params) => api.get('/contract/events', { params }),
  createGroup: (data) => api.post('/contract/create-group', data),
  joinGroup: (data) => api.post('/contract/join-group', data),
  contribute: (data) => api.post('/contract/contribute', data),
  claimPayout: (data) => api.post('/contract/claim-payout', data),
};

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (groupId) => api.get(`/groups/${groupId}`),
  getStats: (groupId) => api.get(`/groups/${groupId}/stats`),
  getEvents: (groupId, params) => api.get(`/groups/${groupId}/events`, { params }),
};

// Members API
export const membersAPI = {
  getContributions: (memberId, groupId) => 
    api.get(`/members/${memberId}/contributions`, { params: { groupId } }),
  getStats: (memberId, groupId) => 
    api.get(`/members/${memberId}/stats`, { params: { groupId } }),
  getGroups: (memberId) => api.get(`/members/${memberId}/groups`),
  getPayouts: (memberId, groupId) => 
    api.get(`/members/${memberId}/payouts`, { params: { groupId } }),
};

export default api;
