export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  session_token: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email_or_username: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}
