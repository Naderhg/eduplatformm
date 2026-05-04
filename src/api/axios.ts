// src/api/axios.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export default axiosInstance;