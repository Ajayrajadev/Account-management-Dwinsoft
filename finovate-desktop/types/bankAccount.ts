export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'CREDIT_CARD' | 'LOAN' | 'INVESTMENT';
  ifscCode?: string;
  branchName?: string;
  isActive: boolean;
  balance: number;
  credits?: number;
  debits?: number;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountWithTransactions extends BankAccount {
  transactions: Transaction[];
  invoices: Invoice[];
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  category?: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
}

export interface CreateBankAccountData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'CREDIT_CARD' | 'LOAN' | 'INVESTMENT';
  ifscCode?: string;
  branchName?: string;
  balance?: number;
}

export interface UpdateBankAccountData extends Partial<CreateBankAccountData> {}
