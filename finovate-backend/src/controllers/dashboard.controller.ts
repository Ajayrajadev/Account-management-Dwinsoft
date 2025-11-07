import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/middlewares/error.middleware';
import { ApiResponse, DashboardSummary } from '@/types';

// Type definitions for raw query results
interface MonthlyTransactionResult {
  month: Date;
  type: 'CREDIT' | 'DEBIT';
  total: string; // Prisma returns numeric types as strings in raw queries
}

interface CategoryExpenseResult {
  category: string | null;
  _sum: { amount: number | null };
  _count: { category: number };
}

interface ProcessedCategoryExpense {
  category: string;
  amount: number;
  count: number;
}

interface MonthlyTransactionData {
  month: string;
  income: number;
  expenses: number;
}

export const getDashboardSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  try {
    // Get all transactions for calculations using Promise.all for better performance
    const [
      allTransactions,
      monthlyTransactions,
      paidInvoices,
      recentTransactions,
      recentInvoices,
      categoryExpenses,
      yearlyData
    ] = await Promise.all([
    // Total balance calculation
    prisma.transaction.findMany({
      where: { userId },
      select: { type: true, amount: true }
    }),

    // Monthly transactions
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth }
      },
      select: { type: true, amount: true }
    }),

    // Paid invoices for total invoice amount
    prisma.invoice.findMany({
      where: {
        userId,
        status: 'PAID'
      },
      select: { totalAmount: true }
    }),

    // Recent transactions (last 5)
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        description: true,
        category: true,
        amount: true,
        date: true,
        createdAt: true
      }
    }),

    // Recent invoices (last 5)
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        totalAmount: true,
        status: true,
        issueDate: true,
        createdAt: true
      }
    }),

    // Category expenses for current month
    prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'DEBIT',
        date: { gte: startOfMonth },
        category: { not: null }
      },
      _sum: { amount: true },
      _count: { category: true },
      orderBy: { _sum: { amount: 'desc' } }
    }),

      // Yearly income/expense data using SQLite-compatible query
      prisma.$queryRaw<MonthlyTransactionResult[]>`
        SELECT 
          strftime('%Y-%m', date) as month,
          type,
          CAST(COALESCE(SUM(amount), 0) AS TEXT) as total
        FROM transactions
        WHERE userId = ${userId} 
          AND date >= ${startOfYear}
        GROUP BY strftime('%Y-%m', date), type
        ORDER BY month
      `
  ]);

  // Calculate totals
  const totalBalance = allTransactions.reduce((sum: number, t: any) => {
    return sum + (t.type === 'CREDIT' ? t.amount : -t.amount);
  }, 0);

  const totalInvoiceAmount = paidInvoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);

  const monthlyIncome = monthlyTransactions
    .filter((t: any) => t.type === 'CREDIT')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t: any) => t.type === 'DEBIT')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const monthlyProfit = monthlyIncome - monthlyExpenses;

    // Process category expenses with proper typing
    const processedCategoryExpenses: ProcessedCategoryExpense[] = (categoryExpenses as CategoryExpenseResult[]).map(cat => ({
      category: cat.category || 'Uncategorized',
      amount: cat._sum.amount ?? 0,
      count: cat._count.category ?? 0
    }));

    // Process yearly income/expense data for charts with proper typing
    const monthlyData = new Map<string, MonthlyTransactionData>();
    
    (yearlyData as MonthlyTransactionResult[]).forEach(row => {
      const monthKey = typeof row.month === 'string' ? row.month : new Date(row.month).toISOString().slice(0, 7);
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthKey, income: 0, expenses: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      const amount = parseFloat(row.total) || 0;
      
      if (row.type === 'CREDIT') {
        data.income = amount;
      } else {
        data.expenses = amount;
      }
    });

    const incomeExpenseData = Array.from(monthlyData.values()).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    const summary: DashboardSummary = {
      totalBalance,
      totalInvoiceAmount,
      monthlyIncome,
      monthlyExpenses,
      monthlyProfit,
      recentTransactions,
      recentInvoices,
      categoryExpenses: processedCategoryExpenses,
      incomeExpenseData
    };

    const response: ApiResponse<DashboardSummary> = {
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: summary
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    throw new Error('Failed to load dashboard data');
  }
});

export const getIncomeExpenseData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { period = '12' } = req.query as { period?: string };
  
  // Validate period parameter
  const monthsBack = Math.min(Math.max(1, parseInt(period, 10) || 12), 60); // Limit to 1-60 months
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  startDate.setHours(0, 0, 0, 0);

  try {
    const data = await prisma.$queryRaw<MonthlyTransactionResult[]>`
      SELECT 
        strftime('%Y-%m', date) as month,
        type,
        CAST(COALESCE(SUM(amount), 0) AS TEXT) as total
      FROM transactions
      WHERE userId = ${userId} 
        AND date >= ${startDate}
      GROUP BY strftime('%Y-%m', date), type
      ORDER BY month
    `;

    // Process data for chart with proper typing
    const monthlyData = new Map<string, MonthlyTransactionData>();
    
    data.forEach((row: MonthlyTransactionResult) => {
      const monthKey = typeof row.month === 'string' ? row.month : new Date(row.month).toISOString().slice(0, 7);
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthKey, income: 0, expenses: 0 });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      const amount = parseFloat(row.total) || 0;
      
      if (row.type === 'CREDIT') {
        monthData.income = amount;
      } else {
        monthData.expenses = amount;
      }
    });

    const response: ApiResponse<MonthlyTransactionData[]> = {
      success: true,
      message: 'Income/expense data retrieved successfully',
      data: Array.from(monthlyData.values())
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getIncomeExpenseData:', error);
    throw new Error('Failed to load income/expense data');
  }
});

export const getCategoryExpenses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { period = '30' } = req.query as { period?: string };
  
  // Validate period parameter
  const daysBack = Math.min(Math.max(1, parseInt(period, 10) || 30), 365); // Limit to 1-365 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  try {
    const categoryData = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'DEBIT',
        date: { gte: startDate },
        category: { not: null }
      },
      _sum: { amount: true },
      _count: { category: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    const processedData: ProcessedCategoryExpense[] = (categoryData as CategoryExpenseResult[]).map(cat => ({
      category: cat.category || 'Uncategorized',
      amount: cat._sum.amount ?? 0,
      count: cat._count.category ?? 0
    }));

    const response: ApiResponse<ProcessedCategoryExpense[]> = {
      success: true,
      message: 'Category expenses retrieved successfully',
      data: processedData
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getCategoryExpenses:', error);
    throw new Error('Failed to load category expenses');
  }
});

export const updateGoal = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { goal } = req.body;

  if (typeof goal !== 'number' || goal < 0 || goal > 1000000) {
    return res.status(400).json({
      success: false,
      message: 'Goal must be a positive number between 0 and 1,000,000'
    });
  }

  try {
    // Store goal in settings table
    await prisma.settings.upsert({
      where: { key: `monthly_goal_${userId}` },
      update: { value: goal.toString() },
      create: {
        key: `monthly_goal_${userId}`,
        value: goal.toString()
      }
    });

    const response: ApiResponse<{ goal: number }> = {
      success: true,
      message: 'Monthly goal updated successfully',
      data: { goal }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in updateGoal:', error);
    throw new Error('Failed to update monthly goal');
  }
});

export const getGoal = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const goalSetting = await prisma.settings.findUnique({
      where: { key: `monthly_goal_${userId}` }
    });

    const goal = goalSetting ? parseFloat(goalSetting.value) || 0 : 0;

    const response: ApiResponse<{ goal: number }> = {
      success: true,
      message: 'Monthly goal retrieved successfully',
      data: { goal }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getGoal:', error);
    throw new Error('Failed to retrieve monthly goal');
  }
});
