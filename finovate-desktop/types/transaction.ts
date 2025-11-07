export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string;
  recurring?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface BatchTransactionInput {
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string;
  recurring?: boolean;
}
