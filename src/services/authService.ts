import apiClient from '@/lib/apiClient';
import { AuthSession, Role } from '@/types';
import { ApiResponse } from '@/types/api';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthSession>>('/auth/login', payload),

  
  logout: () => apiClient.post('/auth/logout'),

  
  refresh: () => apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh'),

  
  saveSession: (session: AuthSession) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, session.token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, session.user.role);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, session.user.name);
  },

  clearSession: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  },

  getRole: (): Role | null =>
    (localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE) as Role) ?? null,

  getUserName: (): string | null =>
    localStorage.getItem(LOCAL_STORAGE_KEYS.USER),
};
