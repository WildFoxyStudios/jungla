'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, getErrorMessage } from '@/lib/api';
import type { User, LoginData, RegisterData } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem('session_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      localStorage.setItem('session_token', response.session_token);
      setUser(response.user);
      router.push('/home');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      localStorage.setItem('session_token', response.session_token);
      setUser(response.user);
      router.push('/home');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('session_token');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
