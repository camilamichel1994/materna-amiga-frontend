import { apiRequest, setAuthToken, removeAuthToken } from '../api';

export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  location?: string;
  baby_age_range?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    location?: string;
  };
}

export interface GoogleAuthInput {
  idToken: string;
}

export const loginService = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.token) {
    setAuthToken(response.token, data.remember || false);
  }
  
  return response;
};

export const googleAuthService = async (data: GoogleAuthInput): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.token) {
    setAuthToken(response.token, true);
  }

  return response;
};

export const registerService = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.token) {
    setAuthToken(response.token, true);
  }
  
  return response;
};

export const forgotPasswordService = async (data: ForgotPasswordInput): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const resetPasswordService = async (data: ResetPasswordInput): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getMeService = async (): Promise<AuthResponse['user']> => {
  return apiRequest<AuthResponse['user']>('/auth/me', {
    method: 'GET',
    requireAuth: true,
  });
};

export const logoutService = async (): Promise<void> => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
      requireAuth: true,
    });
  } finally {
    removeAuthToken();
  }
};

