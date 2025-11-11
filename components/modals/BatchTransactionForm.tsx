'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';
import type { TransactionType } from '@/types/transaction';

const transactionItemSchema = z.object({
  type: z.enum(['credit', 'debit']),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  recurring: z.boolean().optional(),
});

const batchSchema = z.object({
  transactions: z.array(transactionItemSchema).min(1, 'At least one transaction is required'),
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

interface BatchTransactionFormProps {
  trigger: ReactNode;
  onSuccess?: () => void;
}

export function BatchTransactionForm({ trigger, onSuccess }: BatchTransactionFormProps) {
  const [open, setOpen] = useState(false);
  const { batchCreateTransactions } = useTransactionStore();
  const { refresh: refreshDashboard } = useDashboardStore();

  const form = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      transactions: [
        {
          type: 'credit' as TransactionType,
          description: '',
          category: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          recurring: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions',
  });

  const onSubmit = async (data: z.infer<typeof batchSchema>) => {
    try {
      // Ensure all transactions have valid types
      const validTransactions = data.transactions.map((t) => ({
        ...t,
        type: t.type === 'credit' || t.type === 'debit' ? t.type : 'debit', // Default to debit if invalid
      }));
      
      await batchCreateTransactions(validTransactions);
      toast.success(`${validTransactions.length} transactions created successfully`);
      await refreshDashboard();
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        setOpen(false);
        form.reset();
        onSuccess?.();
      }, 200);
    } catch (error) {
      toast.error('Failed to create transactions');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Add Transactions</DialogTitle>
          <DialogDescription>
            Add multiple transactions at once. You can add income and expenses in the same batch.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Transaction {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="credit">Income</SelectItem>
                              <SelectItem value="debit">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.category`}
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
                  </div>
                  <FormField
                    control={form.control}
                    name={`transactions.${index}.description`}
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`transactions.${index}.amount`}
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
                      name={`transactions.${index}.date`}
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
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  type: 'credit',
                  description: '',
                  category: '',
                  amount: 0,
                  date: new Date().toISOString().split('T')[0],
                  recurring: false,
                })
              }
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Transaction
            </Button>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create {fields.length} Transaction(s)</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

