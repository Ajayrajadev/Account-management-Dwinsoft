export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  category?: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalInvoiceAmount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  recentTransactions: Transaction[];
  recentInvoices: Invoice[];
  categoryExpenses: CategoryExpense[];
  incomeExpenseData: IncomeExpenseData[];
}

export interface CategoryExpense {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
