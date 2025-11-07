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
      const transactions = response.data || [];
      set({ transactions, filteredTransactions: transactions, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch transactions', loading: false });
    }
  },

  createTransaction: async (data) => {
    try {
      const response = await transactionsApi.create(data);
      const newTransaction = response.data;
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        filteredTransactions: [newTransaction, ...state.filteredTransactions],
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to create transaction' });
      return Promise.reject(error);
    }
  },

  batchCreateTransactions: async (data) => {
    try {
      const response = await transactionsApi.batchCreate(data);
      const newTransactions = response.data || [];
      set((state) => ({
        transactions: [...newTransactions, ...state.transactions],
        filteredTransactions: [...newTransactions, ...state.filteredTransactions],
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
}));
