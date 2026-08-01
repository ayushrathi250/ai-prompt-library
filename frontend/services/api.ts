import axios, { type AxiosInstance } from 'axios';

/**
 * Single shared Axios instance.
 *
 * Dev  -> "/api"                (proxy to your local backend via vite.config)
 * Prod -> import.meta.env.VITE_API_URL
 */
const baseURL =
  (import.meta.env.PROD ? (import.meta.env.VITE_API_URL as string | undefined) : '/api') ||
  '/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Always attempt real backend calls (via /api proxy in dev or VITE_API_URL in prod). */
export const hasBackend = true;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('app-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Unexpected network error';
    return Promise.reject(new Error(message));
  },
);

export default api;
