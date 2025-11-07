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
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';
import type { Invoice } from '@/types/invoice';

const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
});

const invoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100),
  discount: z.number().min(0),
  discountType: z.enum(['percentage', 'fixed']),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
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

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientName: invoice?.clientName || '',
      clientPhone: invoice?.clientPhone || '',
      clientEmail: invoice?.clientEmail || '',
      items: invoice?.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
      })) || [{ name: '', quantity: 1, rate: 0 }],
      taxRate: invoice?.taxRate || 0,
      discount: invoice?.discount || 0,
      discountType: invoice?.discountType || 'percentage',
      date: invoice?.date || new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate || '',
      notes: invoice?.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const calculateTotals = () => {
    const items = form.watch('items');
    const taxRate = form.watch('taxRate') || 0;
    const discount = form.watch('discount') || 0;
    const discountType = form.watch('discountType') || 'percentage';

    const subtotal = items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );

    const discountAmount =
      discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
    const afterDiscount = subtotal - discountAmount;
    const tax = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + tax;

    return { subtotal, discountAmount, tax, total };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: z.infer<typeof invoiceSchema>) => {
    try {
      if (invoice) {
        await updateInvoice(invoice.id, data);
        toast.success('Invoice updated successfully');
      } else {
        await createInvoice(data);
        toast.success('Invoice created successfully');
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
          <DialogTitle>{invoice ? 'Edit' : 'Create'} Invoice</DialogTitle>
          <DialogDescription>
            {invoice
              ? 'Update the invoice details'
              : 'Create a new invoice for your client'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Items</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="col-span-5">
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Qty"
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
                    name={`items.${index}.rate`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Rate"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2 text-right font-semibold">
                    ${((form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.rate`) || 0)).toFixed(2)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', quantity: 1, rate: 0 })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Discount</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
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
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">$</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {totals.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{invoice ? 'Update' : 'Create'} Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

