import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  RegisterData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  MessageResponse,
  User,
  ErrorResponse,
} from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/api/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/api/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/api/auth/reset-password', data);
    return response.data;
  },
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return axiosError.response?.data?.error || 'Ha ocurrido un error';
  }
  return 'Ha ocurrido un error inesperado';
};
