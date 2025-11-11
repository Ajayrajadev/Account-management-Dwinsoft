import { create } from 'zustand';

// Import the comprehensive Electron API types
/// <reference path="../types/electron.d.ts" />

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TransactionFilters {
  type?: 'credit' | 'debit';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface TransactionStore {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  filters: TransactionFilters;
  
  // Actions
  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  
  // Desktop-specific actions
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
}

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export const useDesktopTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  loading: false,
  filters: {},

  fetchTransactions: async () => {
    if (!isElectron) return;
    
    set({ loading: true });
    try {
      const transactions = await (window as any).electronAPI?.database.getTransactions(get().filters);
      set({ 
        transactions,
        filteredTransactions: transactions,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
    }
  },

  createTransaction: async (transactionData) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      const transaction = await (window as any).electronAPI?.database.createTransaction(transactionData);
      
      // Update local state
      const { transactions } = get();
      const updatedTransactions = [transaction, ...transactions];
      set({ 
        transactions: updatedTransactions,
        filteredTransactions: updatedTransactions 
      });
      
      return transaction;
    } catch (error) {
      throw error;
    }
  },

  updateTransaction: async (id, transactionData) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      const updatedTransaction = await (window as any).electronAPI?.database.updateTransaction(id, transactionData);
      
      // Update local state
      const { transactions } = get();
      const updatedTransactions = transactions.map(t => 
        t.id === id ? updatedTransaction : t
      );
      set({ 
        transactions: updatedTransactions,
        filteredTransactions: updatedTransactions 
      });
      
      return updatedTransaction;
    } catch (error) {
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      await (window as any).electronAPI?.database.deleteTransaction(id);
      
      // Update local state
      const { transactions } = get();
      const updatedTransactions = transactions.filter(t => t.id !== id);
      set({ 
        transactions: updatedTransactions,
        filteredTransactions: updatedTransactions 
      });
    } catch (error) {
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    
    // Apply filters locally for immediate UI response
    const { transactions } = get();
    let filtered = [...transactions];
    
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.date >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(t => t.date <= filters.dateTo!);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }
    
    set({ filteredTransactions: filtered });
    
    // Fetch from database with new filters
    if (isElectron) {
      get().fetchTransactions();
    }
  },

  exportData: async () => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      return await (window as any).electronAPI?.database.exportData();
    } catch (error) {
      throw error;
    }
  },

  importData: async (data) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      await (window as any).electronAPI?.database.importData(data);
      // Refresh transactions after import
      await get().fetchTransactions();
    } catch (error) {
      throw error;
    }
  }
}));
