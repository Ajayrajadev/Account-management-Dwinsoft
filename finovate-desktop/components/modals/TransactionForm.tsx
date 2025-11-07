'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/store/transactionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { toast } from 'sonner';
import type { TransactionType } from '@/types/transaction';
import { ReactNode } from 'react';

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  recurring: z.boolean().optional(),
});

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

interface TransactionFormProps {
  type: TransactionType;
  trigger: ReactNode;
  transaction?: any;
  onSuccess?: () => void;
}

export function TransactionForm({
  type,
  trigger,
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { createTransaction, updateTransaction } = useTransactionStore();
  const { refresh: refreshDashboard } = useDashboardStore();

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || '',
      category: transaction?.category || '',
      amount: transaction?.amount || 0,
      date: transaction?.date || new Date().toISOString().split('T')[0],
      recurring: transaction?.recurring || false,
    },
  });

  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    try {
      // Convert date to ISO datetime string and ensure amount is a number
      const transactionData = {
        ...data,
        type: type.toUpperCase(), // Convert to uppercase for backend
        amount: Number(data.amount),
        date: new Date(data.date).toISOString()
      };
      
      if (transaction) {
        await updateTransaction(transaction.id, transactionData as any);
        toast.success('Transaction updated successfully');
      } else {
        await createTransaction(transactionData as any);
        toast.success('Transaction created successfully');
      }
      // Refresh both dashboard and transactions
      await refreshDashboard();
      // Small delay to ensure backend has processed the transaction
      setTimeout(() => {
        refreshDashboard();
      }, 500);
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Transaction save error:', error);
      console.error('Error details:', error.response?.data);
      
      // Handle validation errors specifically
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details.map((detail: any) => 
          `${detail.field}: ${detail.message}`
        ).join(', ');
        toast.error(`Validation error: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save transaction';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit' : 'Add'} {type === 'credit' ? 'Income' : 'Expense'}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Update the transaction details'
              : 'Add a new transaction to your account'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {transaction ? 'Update' : 'Create'} Transaction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

