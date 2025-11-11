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
  clearStore: () => void;
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
      const transactions = response.data || [];
      
      // Backend already converts types correctly, so use the response directly
      const processedTransactions = transactions;
      
      set({ transactions: processedTransactions, filteredTransactions: processedTransactions, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch transactions', loading: false });
    }
  },

  createTransaction: async (data) => {
    try {
      // Ensure type is explicitly set and valid
      if (!data.type || (data.type !== 'credit' && data.type !== 'debit')) {
        throw new Error('Invalid transaction type');
      }
      
      // Convert frontend lowercase types to backend uppercase types
      const backendData = {
        ...data,
        type: data.type === 'credit' ? 'CREDIT' : 'DEBIT'
      };
      
      const response = await transactionsApi.create(backendData);
      const newTransaction = response.data;
      
      // Ensure the response has the correct type
      if (!newTransaction.type) {
        newTransaction.type = data.type;
      }
      
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        filteredTransactions: [newTransaction, ...state.filteredTransactions],
      }));
      
      // Re-apply filters to ensure correct display
      setTimeout(() => {
        get().applyFilters();
      }, 100);
      
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create transaction' });
      return Promise.reject(error);
    }
  },

  batchCreateTransactions: async (data) => {
    try {
      // Convert frontend lowercase types to backend uppercase types
      const validTransactions = data.map((t) => ({
        ...t,
        type: t.type === 'credit' ? 'CREDIT' : t.type === 'debit' ? 'DEBIT' : 'DEBIT',
      }));
      
      const response = await transactionsApi.batchCreate(validTransactions);
      const newTransactions = response.data || [];
      
      // Ensure all transactions have correct type
      const validatedTransactions = newTransactions.map((t: any) => ({
        ...t,
        type: t.type || (data.find((d) => d.description === t.description)?.type || 'debit'),
      }));
      
      set((state) => ({
        transactions: [...validatedTransactions, ...state.transactions],
        filteredTransactions: [...validatedTransactions, ...state.filteredTransactions],
      }));
      
      // Re-apply filters to ensure correct display
      setTimeout(() => {
        get().applyFilters();
      }, 100);
      
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create transactions' });
      return Promise.reject(error);
    }
  },

  updateTransaction: async (id, data) => {
    try {
      // Convert frontend lowercase types to backend uppercase types if type is provided
      const backendData = {
        ...data,
        ...(data.type && {
          type: data.type === 'credit' ? 'CREDIT' : data.type === 'debit' ? 'DEBIT' : data.type
        })
      };
      
      const response = await transactionsApi.update(id, backendData);
      const updated = response.data;
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
        filteredTransactions: state.filteredTransactions.map((t) => (t.id === id ? updated : t)),
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

  clearStore: () => {
    set({
      transactions: [],
      filteredTransactions: [],
      loading: false,
      error: null,
      filters: {}
    });
  },
}));
