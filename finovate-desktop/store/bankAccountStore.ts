import { create } from 'zustand';
import { BankAccount, BankAccountWithTransactions, CreateBankAccountData, UpdateBankAccountData } from '@/types/bankAccount';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface BankAccountStore {
  bankAccounts: BankAccount[];
  selectedBankAccount: BankAccountWithTransactions | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchBankAccounts: () => Promise<void>;
  fetchBankAccount: (id: string) => Promise<void>;
  createBankAccount: (data: CreateBankAccountData) => Promise<void>;
  updateBankAccount: (id: string, data: UpdateBankAccountData) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  toggleBankAccountStatus: (id: string) => Promise<void>;
  clearSelectedBankAccount: () => void;
  clearError: () => void;
}

export const useBankAccountStore = create<BankAccountStore>((set, get) => ({
  bankAccounts: [],
  selectedBankAccount: null,
  loading: false,
  error: null,

  fetchBankAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/bank-accounts');
      const data = response.data?.data || response.data;
      set({ bankAccounts: data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch bank accounts',
        loading: false 
      });
      toast.error('Failed to fetch bank accounts');
    }
  },

  fetchBankAccount: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/bank-accounts/${id}`);
      const data = response.data?.data || response.data;
      set({ selectedBankAccount: data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch bank account',
        loading: false 
      });
      toast.error('Failed to fetch bank account details');
    }
  },

  createBankAccount: async (data: CreateBankAccountData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/bank-accounts', data);
      const newBankAccount = response.data?.data || response.data;
      
      set(state => ({
        bankAccounts: [newBankAccount, ...state.bankAccounts],
        loading: false
      }));
      
      toast.success('Bank account created successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create bank account';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateBankAccount: async (id: string, data: UpdateBankAccountData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/bank-accounts/${id}`, data);
      const updatedBankAccount = response.data?.data || response.data;
      
      set(state => ({
        bankAccounts: state.bankAccounts.map(account => 
          account.id === id ? updatedBankAccount : account
        ),
        selectedBankAccount: state.selectedBankAccount?.id === id 
          ? { ...state.selectedBankAccount, ...updatedBankAccount }
          : state.selectedBankAccount,
        loading: false
      }));
      
      toast.success('Bank account updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update bank account';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteBankAccount: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/bank-accounts/${id}`);
      
      set(state => ({
        bankAccounts: state.bankAccounts.filter(account => account.id !== id),
        selectedBankAccount: state.selectedBankAccount?.id === id ? null : state.selectedBankAccount,
        loading: false
      }));
      
      toast.success('Bank account deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete bank account';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  toggleBankAccountStatus: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/bank-accounts/${id}/toggle-status`);
      const updatedBankAccount = response.data?.data || response.data;
      
      set(state => ({
        bankAccounts: state.bankAccounts.map(account => 
          account.id === id ? updatedBankAccount : account
        ),
        selectedBankAccount: state.selectedBankAccount?.id === id 
          ? { ...state.selectedBankAccount, ...updatedBankAccount }
          : state.selectedBankAccount,
        loading: false
      }));
      
      toast.success(`Bank account ${updatedBankAccount.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle bank account status';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearSelectedBankAccount: () => {
    set({ selectedBankAccount: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
