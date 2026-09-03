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

// ── Helper: add auth token to any instance ──────────────────────────
function addAuthInterceptor(instance: ReturnType<typeof axios.create>) {
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// ── Generic file upload instance (images, PDFs …) — 2 minutes ───────
export const uploadInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,           // 2 minutes
  headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
  withCredentials: true,
});
addAuthInterceptor(uploadInstance);
uploadInstance.interceptors.response.use(
  (r) => r,
  (error) => {
    console.error('Upload Error:', error);
    if (error.response?.data?.message) error.message = error.response.data.message;
    else if (error.code === 'ECONNABORTED') error.message = 'Upload timeout. Please try again with a smaller file.';
    return Promise.reject(error);
  }
);

// ── Video upload instance — 10 minutes (Cloudinary re-upload takes time) ──
export const videoUploadInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000,           // 10 minutes
  headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
  withCredentials: true,
});
addAuthInterceptor(videoUploadInstance);
videoUploadInstance.interceptors.response.use(
  (r) => r,
  (error) => {
    console.error('Video Upload Error:', error);
    if (error.response?.data?.message) error.message = error.response.data.message;
    else if (error.code === 'ECONNABORTED') error.message = 'Video upload timed out. Please try a smaller video or check your connection.';
    return Promise.reject(error);
  }
);

export default axiosInstance;