import { useState, useEffect, useCallback } from 'react';
import { Role } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  role: Role | null;
  userName: string | null;
  isLoaded: boolean;
}

export function useAuth(): AuthState & { logout: () => void } {
  const [state, setState] = useState<AuthState>({
    role: null,
    userName: null,
    isLoaded: false,
  });

  useEffect(() => {
    setState({
      role: authService.getRole(),
      userName: authService.getUserName(),
      isLoaded: true,
    });
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setState({ role: null, userName: null, isLoaded: true });
  }, []);

  return { ...state, logout };
}
