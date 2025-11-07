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
  clientPhone?: string;
  clientEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  status: InvoiceStatus;
  date: string;
  dueDate?: string;
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
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  date: string;
  dueDate?: string;
  notes?: string;
}
