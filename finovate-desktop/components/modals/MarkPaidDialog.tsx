'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBankAccountStore } from '@/store/bankAccountStore';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { formatRupees } from '@/lib/utils';
import { toast } from 'sonner';
import { Building2, CreditCard } from 'lucide-react';

const markPaidSchema = z.object({
  bankAccountId: z.string().min(1, 'Please select a bank account'),
  paidDate: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
});

type MarkPaidFormData = z.infer<typeof markPaidSchema>;

interface MarkPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    clientName: string;
    totalAmount: number | string;
    bankAccountId?: string;
  } | null;
  onSuccess?: () => void;
}

export function MarkPaidDialog({ 
  open, 
  onOpenChange, 
  invoice, 
  onSuccess 
}: MarkPaidDialogProps) {
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { markPaid } = useInvoiceStore();
  const { createTransaction, fetchTransactions } = useTransactionStore();
  const { refresh: refreshDashboard } = useDashboardStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<MarkPaidFormData>({
    resolver: zodResolver(markPaidSchema as any),
    defaultValues: {
      bankAccountId: invoice?.bankAccountId || '',
      paidDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchBankAccounts();
    }
  }, [open, fetchBankAccounts]);

  useEffect(() => {
    if (open && bankAccounts.length > 0) {
      // Reset form with proper values when dialog opens and bank accounts are loaded
      const defaultBankAccountId = invoice?.bankAccountId || 
        bankAccounts.find(account => account.isActive)?.id || '';
      
      form.reset({
        bankAccountId: defaultBankAccountId,
        paidDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [open, invoice, bankAccounts, form]);

  const onSubmit = async (data: MarkPaidFormData) => {
    if (!invoice) return;

    setLoading(true);
    try {
      // Mark invoice as paid
      await markPaid(invoice.id);

      // Create a credit transaction for the payment received
      const amount = typeof invoice.totalAmount === 'string' 
        ? parseFloat(invoice.totalAmount) 
        : invoice.totalAmount;

      await createTransaction({
        type: 'credit'.toUpperCase() as any,
        description: `Payment received for invoice ${invoice.invoiceNumber} from ${invoice.clientName}${data.notes ? ` - ${data.notes}` : ''}`,
        category: 'Invoice Payment',
        amount: amount,
        date: new Date(data.paidDate).toISOString(),
        bankAccountId: data.bankAccountId,
      });

      toast.success(`Invoice marked as paid and ₹${amount.toLocaleString('en-IN')} credited to bank account`);
      
      // Refresh all related data
      await Promise.all([
        refreshDashboard(),
        fetchTransactions(),
      ]);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error);
      toast.error(error.response?.data?.message || 'Failed to mark invoice as paid');
    } finally {
      setLoading(false);
    }
  };

  const invoiceAmount = invoice ? (
    typeof invoice.totalAmount === 'string' 
      ? parseFloat(invoice.totalAmount) 
      : invoice.totalAmount
  ) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Mark Invoice as Paid
          </DialogTitle>
          <DialogDescription>
            Mark invoice <strong>{invoice?.invoiceNumber}</strong> as paid and credit{' '}
            <strong>{formatRupees(invoiceAmount)}</strong> to your selected bank account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account to Credit *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account to receive payment" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts
                          .filter(account => account.isActive)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  {account.bankName} - {account.accountHolder} (****{account.accountNumber.slice(-4)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Add any notes about this payment..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Transaction Summary</span>
              </div>
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                <p>• Invoice will be marked as PAID</p>
                <p>• Credit transaction of {formatRupees(invoiceAmount)} will be created</p>
                <p>• Selected bank account balance will be updated</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : `Mark Paid & Credit ${formatRupees(invoiceAmount)}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
