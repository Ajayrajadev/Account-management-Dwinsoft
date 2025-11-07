export interface DashboardSummary {
  totalBalance: number;
  totalInvoiceAmount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  monthlyGoal?: number;
}

export interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}
