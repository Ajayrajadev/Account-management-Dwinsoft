export type InvoiceStatus = 'paid' | 'pending';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  items?: InvoiceItem[]; // Made optional for simplified invoices
  subtotal?: number; // Made optional
  tax?: number; // Made optional
  taxRate?: number; // Made optional
  discount?: number; // Made optional
  discountType?: 'percentage' | 'fixed'; // Made optional
  total: number; // Keep required as this is the main amount
  status: InvoiceStatus;
  date: string;
  bankAccountId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  clientName?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number; // Simplified to just amount
  date: string;
  bankAccountId?: string;
  // Removed items, tax, discount, and notes for simplified structure
}
