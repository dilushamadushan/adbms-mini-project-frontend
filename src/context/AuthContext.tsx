"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, Role, LoginPayload, AuthContextType } from '@/types';
import { authService } from '@/services/authService';
import { getAccessToken } from '@/lib/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const existingToken = getAccessToken();
    const storedRole = authService.getRole();
    const storedUser = authService.getUserName();

    if (existingToken) {
      setToken(existingToken);
      if (storedRole) setRole(storedRole);

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setRole(currentUser.role);
      } catch {
        setUser(null);
        setRole(null);
        setToken(null);
      }
    } else if (storedRole && storedUser) {
      setRole(storedRole);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: LoginPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const { access_token, user: loggedInUser } = await authService.login(credentials);
      setToken(access_token);
      setUser(loggedInUser);
      setRole(loggedInUser.role);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setRole(null);
      setToken(null);
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      await authService.logoutAll();
    } finally {
      setUser(null);
      setRole(null);
      setToken(null);
    }
  };

  const refreshProfile = async (): Promise<AuthUser | null> => {
    try {
      const refreshed = await authService.getCurrentUser();
      setUser(refreshed);
      setRole(refreshed.role);
      return refreshed;
    } catch {
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    role,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    logoutAll,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType & {
  userName: string | null;
  isLoaded: boolean;
} {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    ...context,
    userName: context.user?.username ?? authService.getUserName(),
    isLoaded: !context.isLoading,
  };
}
