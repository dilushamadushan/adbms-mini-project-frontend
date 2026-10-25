import apiClient, { setAccessToken } from '@/lib/apiClient';
import { AuthUser, LoginPayload, LoginResponse, Role } from '@/types';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

export const authService = {
  login: async (payload: LoginPayload): Promise<{ access_token: string; user: AuthUser }> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    const { access_token, user } = response.data;

    const normalizedUser: AuthUser = {
      user_id: user.user_id,
      username: user.username,
      role: (user.role ? user.role.toUpperCase() : 'PATIENT') as Role,
      is_active: user.is_active,
    };

    authService.saveSession(access_token, normalizedUser);
    return { access_token, user: normalizedUser };
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/me');
    const user = response.data;
    const normalizedUser: AuthUser = {
      ...user,
      role: (user.role ? user.role.toUpperCase() : 'PATIENT') as Role,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, normalizedUser.role);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, normalizedUser.username);
    }

    return normalizedUser;
  },

  refresh: async (): Promise<{ access_token: string }> => {
    const response = await apiClient.post<{ access_token: string }>('/auth/refresh');
    const { access_token } = response.data;
    setAccessToken(access_token);
    return { access_token };
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      authService.clearSession();
    }
  },

  logoutAll: async (): Promise<{ message: string; revoked_sessions: number }> => {
    try {
      const response = await apiClient.post<{ message: string; revoked_sessions: number }>('/auth/logout-all');
      return response.data;
    } finally {
      authService.clearSession();
    }
  },

  saveSession: (token: string, user: AuthUser) => {
    setAccessToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, user.role);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, user.username);
    }
  },

  clearSession: () => {
    setAccessToken(null);
  },

  getRole: (): Role | null => {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE) as Role) ?? null;
  },

  getUserName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<{ valid: boolean; message: string }> => {
    const response = await apiClient.post<{ valid: boolean; message: string }>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    new_password: string;
    confirm_password?: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', payload);
    return response.data;
  },
};

export const requestOtp = authService.forgotPassword;
export const verifyOtp = authService.verifyOtp;
export const resetPassword = authService.resetPassword;
