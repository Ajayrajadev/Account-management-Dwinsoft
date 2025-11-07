'use client';

import { useEffect, useState } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';
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
import { InvoiceForm } from '@/components/modals/InvoiceForm';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { Plus, Edit, Trash2, Search, Copy, Download, Mail, Check, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b'];

export default function InvoicesPage() {
  const {
    filteredInvoices,
    loading,
    filters,
    fetchInvoices,
    deleteInvoice,
    markPaid,
    markUnpaid,
    duplicateInvoice,
    setFilters,
  } = useInvoiceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [invoiceToChangeStatus, setInvoiceToChangeStatus] = useState<{
    id: string;
    newStatus: 'paid' | 'pending';
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchTerm || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteInvoice(invoiceToDelete);
      toast.success('Invoice deleted successfully');
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleStatusChange = async () => {
    if (!invoiceToChangeStatus) return;
    try {
      if (invoiceToChangeStatus.newStatus === 'paid') {
        await markPaid(invoiceToChangeStatus.id);
        toast.success('Invoice marked as paid');
      } else {
        await markUnpaid(invoiceToChangeStatus.id);
        toast.success('Invoice marked as unpaid');
      }
      setStatusChangeDialogOpen(false);
      setInvoiceToChangeStatus(null);
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateInvoice(id);
      toast.success('Invoice duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate invoice');
    }
  };

  const handleDownloadPDF = async (id: string) => {
    toast.info('PDF download feature - connect to your PDF generation API');
    // In a real app, you would call: invoicesApi.downloadPDF(id)
  };

  const handleSendEmail = async (id: string) => {
    toast.info('Email feature - connect to your email API');
    // In a real app, you would call: invoicesApi.sendEmail(id)
  };

  const invoiceStats = {
    total: filteredInvoices.reduce((sum, inv) => sum + ((inv as any).totalAmount || 0), 0),
    paid: filteredInvoices.filter((inv) => (inv as any).status === 'PAID').reduce((sum, inv) => sum + ((inv as any).totalAmount || 0), 0),
    pending: filteredInvoices.filter((inv) => (inv as any).status === 'PENDING').reduce((sum, inv) => sum + ((inv as any).totalAmount || 0), 0),
  };

  const chartData = [
    { name: 'Paid', value: invoiceStats.paid },
    { name: 'Pending', value: invoiceStats.pending },
  ];

  return (
    <PageShell
      title="Invoices"
      description="Create and manage your invoices"
      actions={
        <InvoiceForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          }
        />
      }
    >
      {/* Invoice Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              ${invoiceStats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${invoiceStats.paid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ${invoiceStats.pending.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paid vs Pending Chart */}
      {invoiceStats.total > 0 && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
          <CardHeader>
            <CardTitle>Paid vs Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(value)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === 'all' ? undefined : (value as any) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Client name"
                value={filters.clientName || ''}
                onChange={(e) =>
                  setFilters({ ...filters, clientName: e.target.value || undefined })
                }
              />
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

      {/* Invoices Table */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-neutral-200 rounded-xl">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invoices found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>
                        {(invoice as any).issueDate ? format(new Date((invoice as any).issueDate), 'MMM d, yyyy') : 'No date'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={(invoice as any).status === 'PAID' ? 'default' : 'secondary'}
                          className={
                            (invoice as any).status === 'PAID'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${(invoice as any).totalAmount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <InvoiceForm
                              invoice={invoice}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(invoice.id)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(invoice.id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendEmail(invoice.id)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setInvoiceToChangeStatus({
                                  id: invoice.id,
                                  newStatus: invoice.status === 'paid' ? 'pending' : 'paid',
                                });
                                setStatusChangeDialogOpen(true);
                              }}
                            >
                              {invoice.status === 'paid' ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Mark Unpaid
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark Paid
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setInvoiceToDelete(invoice.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={statusChangeDialogOpen}
        onOpenChange={setStatusChangeDialogOpen}
        title={
          invoiceToChangeStatus?.newStatus === 'paid'
            ? 'Mark Invoice as Paid'
            : 'Mark Invoice as Unpaid'
        }
        description={
          invoiceToChangeStatus?.newStatus === 'paid'
            ? 'Are you sure you want to mark this invoice as paid?'
            : 'Are you sure you want to mark this invoice as unpaid?'
        }
        onConfirm={handleStatusChange}
        confirmText="Confirm"
      />
    </PageShell>
  );
}
