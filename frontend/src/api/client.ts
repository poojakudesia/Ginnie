import axios from 'axios';
import { useAuthStore } from '../store/auth';

// In dev the Vite proxy maps '/api' → the backend (stripping /api). In a
// packaged native app (Capacitor) or a static deploy there is no proxy, so
// point VITE_API_BASE_URL at the backend's root, e.g. https://api.yourapp.com
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default client;
