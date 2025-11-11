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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useBankAccountStore } from '@/store/bankAccountStore';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import type { Invoice } from '@/types/invoice';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  amount: z.union([z.string(), z.number()]).transform(val => val === '' ? 0 : Number(val)).refine(val => val > 0, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  bankAccountId: z.string().optional(),
});

interface InvoiceFormProps {
  trigger: ReactNode;
  invoice?: Invoice;
  onSuccess?: () => void;
}

export function InvoiceForm({ trigger, invoice, onSuccess }: InvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const { createInvoice, updateInvoice } = useInvoiceStore();
  const { refresh: refreshDashboard } = useDashboardStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();

  useEffect(() => {
    if (open) {
      fetchBankAccounts();
    }
  }, [open, fetchBankAccounts]);

  const form = useForm({
    resolver: zodResolver(invoiceSchema as any),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || '',
      clientName: invoice?.clientName || '',
      amount: invoice?.total || '',
      date: invoice?.date || new Date().toISOString().split('T')[0],
      bankAccountId: invoice?.bankAccountId || 'none',
    },
  });


  const onSubmit = async (data: any) => {
    try {
      // Handle 'none' value for bank account
      const invoiceData = {
        ...data,
        bankAccountId: data.bankAccountId === 'none' ? undefined : data.bankAccountId
      };
      
      if (invoice) {
        await updateInvoice(invoice.id, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        await createInvoice(invoiceData);
        toast.success('Invoice added successfully');
      }
      await refreshDashboard();
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save invoice');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit' : 'Add'} Invoice</DialogTitle>
          <DialogDescription>
            {invoice
              ? 'Update the invoice details'
              : 'Add a new invoice for your client'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invoice number (e.g., INV-001)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter invoice amount"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
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
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account (Optional)</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account for payments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No bank account</SelectItem>
                        {bankAccounts
                          .filter(account => account.isActive)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName} - {account.accountHolder} (****{account.accountNumber.slice(-4)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{invoice ? 'Update' : 'Add'} Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

