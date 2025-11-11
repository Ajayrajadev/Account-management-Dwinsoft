import { create } from 'zustand';
import { invoicesApi } from '@/lib/api';
import type { Invoice, InvoiceFilters, InvoiceFormData } from '@/types/invoice';

interface InvoiceState {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  loading: boolean;
  error: string | null;
  filters: InvoiceFilters;
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: InvoiceFormData) => Promise<void>;
  updateInvoice: (id: string, data: Partial<InvoiceFormData>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  markPaid: (id: string) => Promise<void>;
  markUnpaid: (id: string) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<void>;
  setFilters: (filters: InvoiceFilters) => void;
  applyFilters: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  filteredInvoices: [],
  loading: false,
  error: null,
  filters: {},

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await invoicesApi.getAll(get().filters);
      const invoices = response.data || [];
      set({ invoices, filteredInvoices: invoices, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch invoices', loading: false });
    }
  },

  createInvoice: async (data) => {
    try {
      const response = await invoicesApi.create(data);
      const newInvoice = response.data;
      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
        filteredInvoices: [newInvoice, ...state.filteredInvoices],
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to add invoice' });
      return Promise.reject(error);
    }
  },

  updateInvoice: async (id, data) => {
    try {
      const response = await invoicesApi.update(id, data);
      const updated = response.data;
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        filteredInvoices: state.filteredInvoices.map((inv) => (inv.id === id ? updated : inv)),
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update invoice' });
      return Promise.reject(error);
    }
  },

  deleteInvoice: async (id) => {
    try {
      await invoicesApi.delete(id);
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        filteredInvoices: state.filteredInvoices.filter((inv) => inv.id !== id),
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete invoice' });
      return Promise.reject(error);
    }
  },

  markPaid: async (id) => {
    try {
      const response = await invoicesApi.markPaid(id);
      const updated = response.data;
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        filteredInvoices: state.filteredInvoices.map((inv) => (inv.id === id ? updated : inv)),
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark invoice as paid' });
      return Promise.reject(error);
    }
  },

  markUnpaid: async (id) => {
    try {
      const response = await invoicesApi.markUnpaid(id);
      const updated = response.data;
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        filteredInvoices: state.filteredInvoices.map((inv) => (inv.id === id ? updated : inv)),
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark invoice as unpaid' });
      return Promise.reject(error);
    }
  },

  duplicateInvoice: async (id) => {
    try {
      const invoice = get().invoices.find((inv) => inv.id === id);
      if (!invoice) throw new Error('Invoice not found');

      const formData: InvoiceFormData = {
        clientName: invoice.clientName,
        clientPhone: invoice.clientPhone,
        clientEmail: invoice.clientEmail,
        items: invoice.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
        })),
        taxRate: invoice.taxRate,
        discount: invoice.discount,
        discountType: invoice.discountType,
        date: new Date().toISOString().split('T')[0],
        notes: invoice.notes,
      };

      await get().createInvoice(formData);
      return Promise.resolve();
    } catch (error: any) {
      set({ error: error.message || 'Failed to duplicate invoice' });
      return Promise.reject(error);
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { invoices, filters } = get();
    let filtered = [...invoices];

    if (filters.status) {
      filtered = filtered.filter((inv) => inv.status === filters.status);
    }

    if (filters.clientName) {
      filtered = filtered.filter((inv) =>
        inv.clientName.toLowerCase().includes(filters.clientName!.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((inv) => inv.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((inv) => inv.date <= filters.dateTo!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(searchLower) ||
          inv.clientName.toLowerCase().includes(searchLower)
      );
    }

    set({ filteredInvoices: filtered });
  },
}));
