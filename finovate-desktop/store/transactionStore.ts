import { create } from 'zustand';
import { transactionsApi } from '@/lib/api';
import type { Transaction, TransactionFilters, BatchTransactionInput } from '@/types/transaction';

interface TransactionState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  batchCreateTransactions: (data: BatchTransactionInput[]) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  applyFilters: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  loading: false,
  error: null,
  filters: {},

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await transactionsApi.getAll(get().filters);
      // Handle the API response structure: { success: true, data: [...] }
      const transactions = response.data?.data || [];
      
      // Convert lowercase types from backend to uppercase for desktop app consistency
      const processedTransactions = transactions.map((t: any) => ({
        ...t,
        type: t.type === 'credit' ? 'CREDIT' : t.type === 'debit' ? 'DEBIT' : t.type
      }));
      
      set({ transactions: processedTransactions, filteredTransactions: processedTransactions, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch transactions', loading: false });
    }
  },

  createTransaction: async (data) => {
    try {
      const response = await transactionsApi.create(data);
      const newTransaction = response.data?.data || response.data;
      
      // Convert type to uppercase for consistency
      const processedTransaction = {
        ...newTransaction,
        type: newTransaction.type === 'credit' ? 'CREDIT' : newTransaction.type === 'debit' ? 'DEBIT' : newTransaction.type
      };
      
      set((state) => ({
        transactions: [processedTransaction, ...state.transactions],
        filteredTransactions: [processedTransaction, ...state.filteredTransactions],
      }));
      // Refresh the transactions list to ensure UI is updated
      get().fetchTransactions();
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create transaction' });
      return Promise.reject(error);
    }
  },

  batchCreateTransactions: async (data) => {
    try {
      const response = await transactionsApi.batchCreate(data);
      const newTransactions = response.data?.data || [];
      
      // Convert types to uppercase for consistency
      const processedTransactions = newTransactions.map((t: any) => ({
        ...t,
        type: t.type === 'credit' ? 'CREDIT' : t.type === 'debit' ? 'DEBIT' : t.type
      }));
      
      set((state) => ({
        transactions: [...processedTransactions, ...state.transactions],
        filteredTransactions: [...processedTransactions, ...state.filteredTransactions],
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create transactions' });
      return Promise.reject(error);
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const response = await transactionsApi.update(id, data);
      const updated = response.data?.data || response.data;
      
      // Convert type to uppercase for consistency
      const processedTransaction = {
        ...updated,
        type: updated.type === 'credit' ? 'CREDIT' : updated.type === 'debit' ? 'DEBIT' : updated.type
      };
      
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? processedTransaction : t)),
        filteredTransactions: state.filteredTransactions.map((t) => (t.id === id ? processedTransaction : t)),
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update transaction' });
      return Promise.reject(error);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionsApi.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        filteredTransactions: state.filteredTransactions.filter((t) => t.id !== id),
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete transaction' });
      return Promise.reject(error);
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { transactions, filters } = get();
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
      );
    }

    set({ filteredTransactions: filtered });
  },
}));
