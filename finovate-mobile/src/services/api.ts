import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your local backend URL - update this for production
const BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => 
    api.post('/auth/register', data),
};

// Transactions API
export const transactionsApi = {
  getAll: (filters?: any) => 
    api.get('/transactions', { params: filters }),
  create: (data: any) => 
    api.post('/transactions', data),
  update: (id: string, data: any) => 
    api.put(`/transactions/${id}`, data),
  delete: (id: string) => 
    api.delete(`/transactions/${id}`),
};

// Invoices API
export const invoicesApi = {
  getAll: (filters?: any) => 
    api.get('/invoices', { params: filters }),
  create: (data: any) => 
    api.post('/invoices', data),
  update: (id: string, data: any) => 
    api.put(`/invoices/${id}`, data),
  delete: (id: string) => 
    api.delete(`/invoices/${id}`),
  markPaid: (id: string) => 
    api.patch(`/invoices/${id}/paid`),
  markUnpaid: (id: string) => 
    api.patch(`/invoices/${id}/unpaid`),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => 
    api.get('/dashboard/summary'),
  getIncomeExpense: (period?: string) => 
    api.get('/dashboard/income-expense', { params: { period } }),
  getCategoryExpenses: (period?: string) => 
    api.get('/dashboard/category-expenses', { params: { period } }),
};
