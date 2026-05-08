import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://deev--edu-platform--fnj72wsf9xl6.code.run/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'TEACHER' | 'STUDENT';
    avatar?: string;
  };
}

// Login with email and password
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    // Save the token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
    throw new Error(errorMessage);
  }
};

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    // Save the token to localStorage after registration
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again with different credentials.';
    throw new Error(errorMessage);
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    // Always remove the token from localStorage on logout
    localStorage.removeItem('token');
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<AuthResponse['user'] | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get<AuthResponse['user']>('/auth/me');
    return response.data;
  } catch (error) {
    // If the token is invalid, remove it
    localStorage.removeItem('token');
    return null;
  }
};
