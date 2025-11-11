import { create } from 'zustand';

// Import the comprehensive Electron API types
/// <reference path="../types/electron.d.ts" />

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  status: 'pending' | 'paid';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceFilters {
  status?: 'pending' | 'paid';
  clientName?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface InvoiceStore {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  loading: boolean;
  filters: InvoiceFilters;
  
  // Actions
  fetchInvoices: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  setFilters: (filters: InvoiceFilters) => void;
  
  // Desktop-specific actions
  exportInvoicePDF: (invoice: Invoice) => Promise<{ success: boolean; filePath?: string }>;
  markPaid: (id: string) => Promise<Invoice>;
  markUnpaid: (id: string) => Promise<Invoice>;
  duplicateInvoice: (id: string) => Promise<Invoice>;
}

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export const useDesktopInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  filteredInvoices: [],
  loading: false,
  filters: {},

  fetchInvoices: async () => {
    if (!isElectron) return;
    
    set({ loading: true });
    try {
      const invoices = await (window as any).electronAPI?.database.getInvoices(get().filters);
      set({ 
        invoices,
        filteredInvoices: invoices,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
    }
  },

  createInvoice: async (invoiceData) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      const invoice = await (window as any).electronAPI?.database.createInvoice(invoiceData);
      
      // Update local state
      const { invoices } = get();
      const updatedInvoices = [invoice, ...invoices];
      set({ 
        invoices: updatedInvoices,
        filteredInvoices: updatedInvoices 
      });
      
      return invoice;
    } catch (error) {
      throw error;
    }
  },

  updateInvoice: async (id, invoiceData) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      const updatedInvoice = await (window as any).electronAPI?.database.updateInvoice(id, invoiceData);
      
      // Update local state
      const { invoices } = get();
      const updatedInvoices = invoices.map(i => 
        i.id === id ? updatedInvoice : i
      );
      set({ 
        invoices: updatedInvoices,
        filteredInvoices: updatedInvoices 
      });
      
      return updatedInvoice;
    } catch (error) {
      throw error;
    }
  },

  deleteInvoice: async (id) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      await (window as any).electronAPI?.database.deleteInvoice(id);
      
      // Update local state
      const { invoices } = get();
      const updatedInvoices = invoices.filter(i => i.id !== id);
      set({ 
        invoices: updatedInvoices,
        filteredInvoices: updatedInvoices 
      });
    } catch (error) {
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    
    // Apply filters locally for immediate UI response
    const { invoices } = get();
    let filtered = [...invoices];
    
    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    
    if (filters.clientName) {
      filtered = filtered.filter(i => 
        i.clientName.toLowerCase().includes(filters.clientName!.toLowerCase())
      );
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(i => i.issueDate >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(i => i.issueDate <= filters.dateTo!);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(i => 
        i.clientName.toLowerCase().includes(searchLower) ||
        i.invoiceNumber.toLowerCase().includes(searchLower) ||
        (i.notes && i.notes.toLowerCase().includes(searchLower))
      );
    }
    
    set({ filteredInvoices: filtered });
    
    // Fetch from database with new filters
    if (isElectron) {
      get().fetchInvoices();
    }
  },

  exportInvoicePDF: async (invoice) => {
    if (!isElectron) throw new Error('Desktop API not available');
    
    try {
      return await (window as any).electronAPI?.files.saveInvoicePDF(invoice);
    } catch (error) {
      throw error;
    }
  },

  markPaid: async (id) => {
    return await get().updateInvoice(id, { status: 'paid' });
  },

  markUnpaid: async (id) => {
    return await get().updateInvoice(id, { status: 'pending' });
  },

  duplicateInvoice: async (id) => {
    const { invoices } = get();
    const originalInvoice = invoices.find(i => i.id === id);
    
    if (!originalInvoice) {
      throw new Error('Invoice not found');
    }
    
    // Create a new invoice based on the original
    const duplicatedInvoice = {
      ...originalInvoice,
      invoiceNumber: `${originalInvoice.invoiceNumber}-COPY`,
      status: 'pending' as const,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    };
    
    // Remove the id so a new one is generated
    const { id: _, createdAt, updatedAt, ...invoiceData } = duplicatedInvoice;
    
    return await get().createInvoice(invoiceData);
  }
}));
