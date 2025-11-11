'use client';

import { useEffect, useState } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionForm } from '@/components/modals/TransactionForm';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { Plus, Edit, Trash2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { BatchTransactionForm } from '@/components/modals/BatchTransactionForm';

const categories = [
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

export default function TransactionsPage() {
  const {
    filteredTransactions,
    loading,
    filters,
    fetchTransactions,
    deleteTransaction,
    setFilters,
  } = useTransactionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchTerm || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteTransaction(transactionToDelete);
      toast.success('Transaction deleted successfully');
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const getCategoryTotals = () => {
    const totals: Record<string, { credit: number; debit: number }> = {};
    filteredTransactions.forEach((t) => {
      if (!totals[t.category]) {
        totals[t.category] = { credit: 0, debit: 0 };
      }
      // Handle both uppercase and lowercase types for backward compatibility
      const transactionType = (t.type as string).toLowerCase();
      if (transactionType === 'credit') {
        totals[t.category].credit += t.amount;
      } else {
        totals[t.category].debit += t.amount;
      }
    });
    return totals;
  };

  const categoryTotals = getCategoryTotals();

  return (
    <PageShell
      title="Transactions"
      description="Manage your income and expenses"
      actions={
        <div className="flex gap-2">
          <BatchTransactionForm
            trigger={
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Batch Add
              </Button>
            }
          />
          <TransactionForm
            type="credit"
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Income
              </Button>
            }
          />
          <TransactionForm
            type="debit"
            trigger={
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            }
          />
        </div>
      }
    >
      {/* Filters */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              {showFilters ? (
                <>
                  Hide <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value === 'all' ? undefined : (value as any) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Income</SelectItem>
                  <SelectItem value="debit">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value || undefined })
                  }
                  className="flex-1"
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={filters.dateTo || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value || undefined })
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Category Cards */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoryTotals).map(([category, totals]) => (
            <Card
              key={category}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-neutral-200 rounded-xl shadow-sm hover:scale-[1.02]"
              onClick={() => setFilters({ ...filters, category })}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Income:</span>
                    <span className="font-semibold">${totals.credit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">Expense:</span>
                    <span className="font-semibold">${totals.debit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t">
                    <span>Net:</span>
                    <span
                      className={
                        totals.credit - totals.debit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      ${(totals.credit - totals.debit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Transactions Table */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (transaction as any).type === 'CREDIT'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {(transaction as any).type === 'CREDIT' ? 'Income' : 'Expense'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        {transaction.date ? format(new Date(transaction.date), 'MMM d, yyyy') : 'No date'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span
                          className={
                            (transaction as any).type === 'CREDIT'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          {(transaction as any).type === 'CREDIT' ? '+' : '-'}$
                          {transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TransactionForm
                            type={transaction.type}
                            transaction={transaction}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTransactionToDelete(transaction.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </PageShell>
  );
}

