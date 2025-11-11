'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { PageShell } from '@/components/PageShell';
import { StatCard } from '@/components/StatCard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryExpenseChart } from '@/components/charts/CategoryExpenseChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/transactionStore';
import { useInvoiceStore } from '@/store/invoiceStore';
import { format } from 'date-fns';
import Link from 'next/link';
import { TransactionForm } from '@/components/modals/TransactionForm';
import { InvoiceForm } from '@/components/modals/InvoiceForm';

export default function DashboardPage() {
  const {
    summary,
    incomeExpenseData,
    categoryExpenses,
    loading,
    fetchSummary,
    fetchIncomeExpense,
    fetchCategoryExpenses,
    updateGoal,
    refresh,
  } = useDashboardStore();

  const { transactions, fetchTransactions } = useTransactionStore();
  const { invoices, fetchInvoices } = useInvoiceStore();

  const [goalValue, setGoalValue] = useState('');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchIncomeExpense();
    fetchCategoryExpenses();
    fetchTransactions();
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (summary?.monthlyGoal) {
      setGoalValue(summary.monthlyGoal.toString());
    }
  }, [summary]);

  const handleGoalUpdate = async () => {
    const goal = parseFloat(goalValue);
    if (isNaN(goal) || goal < 0) {
      toast.error('Please enter a valid goal amount');
      return;
    }
    await updateGoal(goal);
    setIsGoalDialogOpen(false);
    toast.success('Goal updated successfully');
    await refresh();
  };

  const recentTransactions = transactions.slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);

  // Mock data if API doesn't return data
  const mockIncomeExpense = incomeExpenseData.length > 0 ? incomeExpenseData : [
    { month: 'Jan', income: 5000, expenses: 3000 },
    { month: 'Feb', income: 6000, expenses: 3500 },
    { month: 'Mar', income: 5500, expenses: 3200 },
    { month: 'Apr', income: 7000, expenses: 4000 },
  ];

  const mockCategoryExpenses = categoryExpenses.length > 0 ? categoryExpenses : [
    { category: 'Food', amount: 1200, percentage: 30 },
    { category: 'Transport', amount: 800, percentage: 20 },
    { category: 'Utilities', amount: 600, percentage: 15 },
    { category: 'Entertainment', amount: 400, percentage: 10 },
  ];

  return (
    <PageShell
      title="Dashboard"
      description="Overview of your finances and recent activity"
    >
      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Balance"
          value={summary?.totalBalance || 0}
          icon={Wallet}
        />
        <StatCard
          title="Total Invoice Amount"
          value={summary?.totalInvoiceAmount || 0}
          icon={FileText}
        />
        <StatCard
          title="Monthly Income"
          value={summary?.monthlyIncome || 0}
          icon={TrendingUp}
          trend={{
            value: 12,
            label: 'from last month',
            isPositive: true,
          }}
        />
        <StatCard
          title="Monthly Expenses"
          value={summary?.monthlyExpenses || 0}
          icon={TrendingDown}
          trend={{
            value: 5,
            label: 'from last month',
            isPositive: false,
          }}
        />
        <StatCard
          title="Monthly Profit"
          value={summary?.monthlyProfit || 0}
          icon={DollarSign}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 md:grid-cols-2">
        <IncomeExpenseChart data={mockIncomeExpense} />
        <CategoryExpenseChart data={mockCategoryExpenses} />
      </div>

      {/* Goal Tracker and Quick Actions */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Monthly Goal</CardTitle>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Monthly Goal</DialogTitle>
                    <DialogDescription>
                      Set your monthly income or profit goal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal">Goal Amount</Label>
                      <Input
                        id="goal"
                        type="number"
                        value={goalValue}
                        onChange={(e) => setGoalValue(e.target.value)}
                        placeholder="Enter goal amount"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGoalUpdate}>Update Goal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Progress</span>
                <span>
                  {summary?.monthlyGoal
                    ? `${Math.round(((summary?.monthlyIncome || 0) / summary.monthlyGoal) * 100)}%`
                    : 'No goal set'}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: summary?.monthlyGoal
                      ? `${Math.min(((summary?.monthlyIncome || 0) / summary.monthlyGoal) * 100, 100)}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Goal: ${summary?.monthlyGoal?.toLocaleString() || 'Not set'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TransactionForm type="credit" trigger={
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium">
                <Plus className="mr-2 h-4 w-4" />Add Income
              </Button>
            } />
            <TransactionForm type="debit" trigger={
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium">
                <Plus className="mr-2 h-4 w-4" />Add Expense
              </Button>
            } />
            <InvoiceForm trigger={
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium">
                <Plus className="mr-2 h-4 w-4" />Add Invoice
              </Button>
            } />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Invoices */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} • {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}$
                      {transaction.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Invoices</CardTitle>
              <Link href="/invoices">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{invoice.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.invoiceNumber} • {format(new Date(invoice.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${invoice.total.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${
                          invoice.status === 'paid'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

