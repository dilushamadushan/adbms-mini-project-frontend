import axios from 'axios';
import { APP_CONFIG, LOCAL_STORAGE_KEYS } from '@/lib/constants';

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
