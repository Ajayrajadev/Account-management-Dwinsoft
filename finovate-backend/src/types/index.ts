import { z } from 'zod';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Transaction Types
export const TransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().datetime().optional(),
  bankAccountId: z.string().optional(),
  recurring: z.boolean().optional().default(false),
  recurringType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  recurringEndDate: z.string().datetime().optional(),
});

export const BatchTransactionSchema = z.array(TransactionSchema).min(1, 'At least one transaction is required');

export const TransactionUpdateSchema = TransactionSchema.partial();

export const TransactionQuerySchema = z.object({
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
  type: z.enum(['CREDIT', 'DEBIT', 'credit', 'debit']).optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

// Invoice Types
export const InvoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
  amount: z.number().positive('Amount must be positive').optional(),
});

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientAddress: z.string().optional(),
  // Support both complex (items-based) and simple (amount-based) invoices
  items: z.array(InvoiceItemSchema).optional(), // Made optional for simple invoices
  amount: z.number().positive('Amount must be positive').optional(), // Simple amount field
  subtotal: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  // Accept both date formats
  date: z.string().optional(),
  issueDate: z.string().optional(),
  notes: z.string().optional(),
  bankAccountId: z.string().optional(),
}).refine(
  (data) => {
    // Either items array OR amount must be provided
    return (data.items && data.items.length > 0) || (data.amount && data.amount > 0);
  },
  {
    message: 'Either items or amount must be provided',
    path: ['items'], // This will show the error on the items field
  }
);

export const InvoiceUpdateSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required').optional(),
  clientName: z.string().min(1, 'Client name is required').optional(),
  clientAddress: z.string().optional(),
  items: z.array(InvoiceItemSchema).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  subtotal: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  date: z.string().optional(),
  issueDate: z.string().optional(),
  notes: z.string().optional(),
  bankAccountId: z.string().optional(),
});

export const InvoiceStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  paidDate: z.string().datetime().optional(),
});

export const InvoiceQuerySchema = z.object({
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  clientName: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

// User Types
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['USER', 'ADMIN', 'STAFF']).optional().default('USER'),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Dashboard Types
export interface DashboardSummary {
  totalBalance: number;
  totalInvoiceAmount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  monthlyGoal?: number;
  recentTransactions: any[];
  recentInvoices: any[];
  categoryExpenses: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  incomeExpenseData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

// Recurring Transaction Types
export const RecurringTransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  nextDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

// Export Types
export const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  type: z.enum(['transactions', 'invoices', 'all']).default('all'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type BatchTransactionInput = z.infer<typeof BatchTransactionSchema>;
export type TransactionUpdateInput = z.infer<typeof TransactionUpdateSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export type InvoiceInput = z.infer<typeof InvoiceSchema>;
export type InvoiceUpdateInput = z.infer<typeof InvoiceUpdateSchema>;
export type InvoiceStatusInput = z.infer<typeof InvoiceStatusSchema>;
export type InvoiceQuery = z.infer<typeof InvoiceQuerySchema>;

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;

export type RecurringTransactionInput = z.infer<typeof RecurringTransactionSchema>;
export type ExportQuery = z.infer<typeof ExportQuerySchema>;
