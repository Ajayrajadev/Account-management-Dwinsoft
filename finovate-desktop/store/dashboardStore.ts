import { create } from 'zustand';
import { dashboardApi } from '@/lib/api';
import type { DashboardSummary, IncomeExpenseData, CategoryExpense } from '@/types/dashboard';

interface DashboardState {
  summary: DashboardSummary | null;
  incomeExpenseData: IncomeExpenseData[];
  categoryExpenses: CategoryExpense[];
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchIncomeExpense: (period?: string) => Promise<void>;
  fetchCategoryExpenses: (period?: string) => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  incomeExpenseData: [],
  categoryExpenses: [],
  loading: false,
  error: null,

  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await dashboardApi.getSummary();
      set({ summary: response.data?.data || response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch dashboard summary', loading: false });
    }
  },

  fetchIncomeExpense: async (period = 'monthly') => {
    try {
      const response = await dashboardApi.getIncomeExpense(period);
      set({ incomeExpenseData: response.data?.data || response.data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch income/expense data' });
    }
  },

  fetchCategoryExpenses: async (period = 'monthly') => {
    try {
      const response = await dashboardApi.getCategoryExpenses(period);
      set({ categoryExpenses: response.data?.data || response.data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch category expenses' });
    }
  },

  updateGoal: async (goal: number) => {
    try {
      await dashboardApi.updateGoal(goal);
      const summary = get().summary;
      if (summary) {
        set({ summary: { ...summary, monthlyGoal: goal } });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update goal' });
    }
  },

  refresh: async () => {
    await Promise.all([
      get().fetchSummary(),
      get().fetchIncomeExpense(),
      get().fetchCategoryExpenses(),
    ]);
  },
}));
