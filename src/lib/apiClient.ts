import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG, LOCAL_STORAGE_KEYS } from '@/lib/constants';

let inMemoryToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    inMemoryToken = stored;
    return stored;
  }
  return inMemoryToken;
};


export const setAccessToken = (token: string | null) => {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    }
  }
};

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ access_token: string }>(
          `${APP_CONFIG.apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.access_token;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);

        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
