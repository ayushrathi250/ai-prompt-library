import axios, { type AxiosInstance } from 'axios';

/**
 * Single shared Axios instance.
 *
 * Dev  -> "/api"                (proxy to your local backend via vite.config)
 * Prod -> import.meta.env.VITE_API_URL
 *
 * TODO(backend): point VITE_API_URL at the deployed API and remove the
 * localStorage fallback inside `promptService.ts`.
 */
const baseURL =
  (import.meta.env.PROD ? (import.meta.env.VITE_API_URL as string | undefined) : '/api') ||
  '/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
});

/** True when a real backend URL has been configured. */
export const hasBackend = Boolean(import.meta.env.VITE_API_URL);

// TODO(backend): attach the auth token once sessions exist.
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
