// src/api/axios.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://deev--edu-platform--fnj72wsf9xl6.code.run/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for sending cookies if using sessions
});

// Request interceptor to attach Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if localStorage is available (browser environment)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error('API Error:', error);
    
    // Extract message from backend error response if available
    if (error.response?.data?.message) {
      // Use the backend's error message
      const errorMessage = error.response.data.message;
      console.error('Backend Error Message:', errorMessage);
      error.message = errorMessage;
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network Error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Create a separate instance for file uploads with longer timeout
export const uploadInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for upload instance
uploadInstance.interceptors.request.use(
  (config) => {
    // Check if localStorage is available (browser environment)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for upload instance
uploadInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Upload Error:', error);
    
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      console.error('Backend Upload Error Message:', errorMessage);
      error.message = errorMessage;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Upload timeout. Please try again with a smaller file or check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;