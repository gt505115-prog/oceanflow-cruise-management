import axios from 'axios';

// Vite proxies /api, /auth, /todos to http://127.0.0.1:9999
const apiClient = axios.create({
  baseURL: '',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an isolated token for each application area.
apiClient.interceptors.request.use((config) => {
  const isAdminRoute = window.location.pathname.startsWith('/admin') || new URLSearchParams(window.location.search).get('audience') === 'admin';
  const token = localStorage.getItem(isAdminRoute ? 'oceanflow_admin_token' : 'oceanflow_passenger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
