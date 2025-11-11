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
  percentage: number;
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
      allInvoices,
      recentTransactions,
      recentInvoices,
      categoryExpenses,
      yearlyData,
      goalSetting
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

    // All invoices for total invoice amount (not just paid ones)
    prisma.invoice.findMany({
      where: {
        userId
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

      // Yearly income/expense data using PostgreSQL query
      prisma.$queryRaw<MonthlyTransactionResult[]>`
        SELECT 
          TO_CHAR(date, 'YYYY-MM') as month,
          type,
          CAST(COALESCE(SUM(amount), 0) AS TEXT) as total
        FROM transactions
        WHERE "userId" = ${userId} 
          AND date >= ${startOfYear}
        GROUP BY TO_CHAR(date, 'YYYY-MM'), type
        ORDER BY month
      `,

      // Monthly goal setting
      prisma.settings.findUnique({
        where: { key: `monthly_goal_${userId}` }
      })
  ]);

  // Calculate totals with proper Decimal type handling
  const totalBalance = allTransactions.reduce((sum, t) => {
    const amount = typeof t.amount === 'object' ? parseFloat(t.amount.toString()) : t.amount;
    return sum + (t.type === 'CREDIT' ? amount : -amount);
  }, 0);

  const totalInvoiceAmount = allInvoices.reduce((sum, invoice) => {
    const amount = typeof invoice.totalAmount === 'object' ? parseFloat(invoice.totalAmount.toString()) : invoice.totalAmount;
    return sum + amount;
  }, 0);

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'object' ? parseFloat(t.amount.toString()) : t.amount;
      return sum + amount;
    }, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'object' ? parseFloat(t.amount.toString()) : t.amount;
      return sum + amount;
    }, 0);

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  // Get monthly goal from settings
  const monthlyGoal = goalSetting ? parseFloat(goalSetting.value) || 0 : 0;

    // Process category expenses with proper typing
    const totalCategoryExpenses = (categoryExpenses as CategoryExpenseResult[]).reduce((sum, cat) => sum + (cat._sum.amount ?? 0), 0);
    const processedCategoryExpenses: ProcessedCategoryExpense[] = (categoryExpenses as CategoryExpenseResult[]).map(cat => {
      const amount = cat._sum.amount ?? 0;
      const percentage = totalCategoryExpenses > 0 ? Math.round((amount / totalCategoryExpenses) * 100) : 0;
      return {
        category: cat.category || 'Uncategorized',
        amount,
        count: cat._count.category ?? 0,
        percentage
      };
    });

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
      monthlyGoal,
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
        TO_CHAR(date, 'YYYY-MM') as month,
        type,
        CAST(COALESCE(SUM(amount), 0) AS TEXT) as total
      FROM transactions
      WHERE "userId" = ${userId} 
        AND date >= ${startDate}
      GROUP BY TO_CHAR(date, 'YYYY-MM'), type
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
  
  // Handle different period formats
  let daysBack: number;
  if (period === 'monthly') {
    daysBack = 30;
  } else if (period === 'weekly') {
    daysBack = 7;
  } else if (period === 'yearly') {
    daysBack = 365;
  } else {
    daysBack = Math.min(Math.max(1, parseInt(period, 10) || 30), 365); // Limit to 1-365 days
  }
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  try {

    // Get real expense transactions and group by category
    // First try DEBIT, then debit if no results
    let expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'DEBIT',
        date: { gte: startDate },
        category: { not: null }
      },
      select: {
        category: true,
        amount: true
      }
    });

    // If no DEBIT transactions found, try lowercase 'debit'
    if (expenseTransactions.length === 0) {
      expenseTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'debit' as any,
          date: { gte: startDate },
          category: { not: null }
        },
        select: {
          category: true,
          amount: true
        }
      });
    }


    // Group by category manually
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      const amount = Number(transaction.amount);
      
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          amount: existing.amount + amount,
          count: existing.count + 1
        });
      } else {
        categoryMap.set(category, { amount, count: 1 });
      }
    });

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
    
    let processedData: ProcessedCategoryExpense[] = Array.from(categoryMap.entries()).map(([category, data]) => {
      const percentage = totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0;
      return {
        category,
        amount: data.amount,
        count: data.count,
        percentage
      };
    }).sort((a, b) => b.amount - a.amount); // Sort by amount descending


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

  // Convert to number if it's a string
  const goalNumber = typeof goal === 'string' ? parseFloat(goal) : goal;
  
  if (typeof goalNumber !== 'number' || isNaN(goalNumber) || goalNumber < 0 || goalNumber > 10000000) {
    return res.status(400).json({
      success: false,
      message: 'Goal must be a positive number between 0 and 10,000,000'
    });
  }

  try {
    // Store goal in settings table
    await prisma.settings.upsert({
      where: { key: `monthly_goal_${userId}` },
      update: { value: goalNumber.toString() },
      create: {
        key: `monthly_goal_${userId}`,
        value: goalNumber.toString()
      }
    });

    const response: ApiResponse<{ goal: number }> = {
      success: true,
      message: 'Monthly goal updated successfully',
      data: { goal: goalNumber }
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

export const getYearlyProfitData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { months = '12' } = req.query as { months?: string };
  
  // Validate months parameter
  const monthsBack = Math.min(Math.max(1, parseInt(months, 10) || 12), 24); // Limit to 1-24 months
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - monthsBack);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  try {
    const data = await prisma.$queryRaw<MonthlyTransactionResult[]>`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        type,
        CAST(COALESCE(SUM(amount), 0) AS TEXT) as total
      FROM transactions
      WHERE "userId" = ${userId} 
        AND date >= ${startDate}
      GROUP BY TO_CHAR(date, 'YYYY-MM'), type
      ORDER BY month
    `;

    // Process data for profit calculation
    const monthlyData = new Map<string, { month: string; income: number; expenses: number; profit: number }>();
    
    data.forEach((row: MonthlyTransactionResult) => {
      const monthKey = typeof row.month === 'string' ? row.month : new Date(row.month).toISOString().slice(0, 7);
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthKey, income: 0, expenses: 0, profit: 0 });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      const amount = parseFloat(row.total) || 0;
      
      if (row.type === 'CREDIT') {
        monthData.income = amount;
      } else {
        monthData.expenses = amount;
      }
      
      // Calculate profit
      monthData.profit = monthData.income - monthData.expenses;
    });

    // Fill in missing months with zero values
    const result: Array<{ month: string; income: number; expenses: number; profit: number }> = [];
    const currentDate = new Date(startDate);
    
    // Include all months from start to current month
    while (currentDate.getFullYear() < endDate.getFullYear() || 
           (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())) {
      const monthKey = currentDate.toISOString().slice(0, 7);
      const existingData = monthlyData.get(monthKey);
      
      if (existingData) {
        result.push(existingData);
      } else {
        result.push({
          month: monthKey,
          income: 0,
          expenses: 0,
          profit: 0
        });
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const response: ApiResponse<Array<{ month: string; income: number; expenses: number; profit: number }>> = {
      success: true,
      message: 'Yearly profit data retrieved successfully',
      data: result
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getYearlyProfitData:', error);
    throw new Error('Failed to load yearly profit data');
  }
});
