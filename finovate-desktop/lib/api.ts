import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (Zustand persist storage)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
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
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth storage and redirect to login
      localStorage.removeItem('auth-storage');
      // Force a full page reload to trigger the AuthWrapper to show login
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Transactions API
export const transactionsApi = {
  getAll: (filters?: any) => api.get('/transactions', { params: filters }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  create: (data: any) => api.post('/transactions', data),
  batchCreate: (data: any[]) => api.post('/transactions/batch', data),
  update: (id: string, data: any) => api.put(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
};

// Invoices API
export const invoicesApi = {
  getAll: (filters?: any) => api.get('/invoices', { params: filters }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  markPaid: (id: string) => api.patch(`/invoices/${id}/paid`),
  markUnpaid: (id: string) => api.patch(`/invoices/${id}/unpaid`),
  downloadPDF: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id: string) => api.post(`/invoices/${id}/email`),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getIncomeExpense: (period?: string) => api.get('/dashboard/income-expense', { params: { period } }),
  getCategoryExpenses: (period?: string) => api.get('/dashboard/category-expenses', { params: { period } }),
  updateGoal: (goal: number) => api.put('/dashboard/goal', { goal }),
  getYearlyProfit: (months?: string) => api.get('/dashboard/yearly-profit', { params: { months } }),
};
