'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBankAccountStore } from '@/store/bankAccountStore';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BankAccountForm } from '@/components/modals/BankAccountForm';
import { formatRupees } from '@/lib/utils';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Edit,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const accountTypeIcons = {
  SAVINGS: Wallet,
  CURRENT: Building2,
  CREDIT_CARD: CreditCard,
  LOAN: TrendingDown,
  INVESTMENT: TrendingUp,
};

const accountTypeLabels = {
  SAVINGS: 'Savings Account',
  CURRENT: 'Current Account',
  CREDIT_CARD: 'Credit Card',
  LOAN: 'Loan Account',
  INVESTMENT: 'Investment Account',
};

export default function BankAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedBankAccount, loading, fetchBankAccount, clearSelectedBankAccount } = useBankAccountStore();

  const accountId = params.id as string;

  useEffect(() => {
    if (accountId) {
      fetchBankAccount(accountId);
    }
    return () => {
      clearSelectedBankAccount();
    };
  }, [accountId, fetchBankAccount, clearSelectedBankAccount]);

  if (loading) {
    return (
      <PageShell
        title="Bank Account Details"
        description="Loading account information..."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (!selectedBankAccount) {
    return (
      <PageShell
        title="Bank Account Not Found"
        description="The requested bank account could not be found."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      >
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Account Not Found</h3>
            <p className="text-muted-foreground">
              The bank account you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const IconComponent = accountTypeIcons[selectedBankAccount.accountType];

  return (
    <PageShell
      title={selectedBankAccount.bankName}
      description={`${accountTypeLabels[selectedBankAccount.accountType]} - ${selectedBankAccount.accountHolder}`}
      actions={
        <div className="flex gap-2">
          <BankAccountForm
            bankAccount={selectedBankAccount}
            trigger={
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Account
              </Button>
            }
            onSuccess={() => fetchBankAccount(accountId)}
          />
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Account Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupees(selectedBankAccount.balance)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatRupees(selectedBankAccount.credits || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatRupees(selectedBankAccount.debits || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (selectedBankAccount.credits || 0) - (selectedBankAccount.debits || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatRupees((selectedBankAccount.credits || 0) - (selectedBankAccount.debits || 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                  <p className="text-sm font-semibold">{selectedBankAccount.accountHolder}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                  <p className="text-sm font-mono">{selectedBankAccount.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {accountTypeLabels[selectedBankAccount.accountType]}
                    </Badge>
                    <Badge variant={selectedBankAccount.isActive ? 'default' : 'secondary'}>
                      {selectedBankAccount.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {selectedBankAccount.ifscCode && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                    <p className="text-sm font-mono">{selectedBankAccount.ifscCode}</p>
                  </div>
                )}
                {selectedBankAccount.branchName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Branch</label>
                    <p className="text-sm">{selectedBankAccount.branchName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">
                    {format(new Date(selectedBankAccount.createdAt), 'PPP')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBankAccount.transactions && selectedBankAccount.transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBankAccount.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {transaction.category || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'CREDIT' ? 'default' : 'secondary'}>
                          {transaction.type === 'CREDIT' ? 'Income' : 'Expense'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}{formatRupees(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No transactions found for this account</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Invoices */}
        {selectedBankAccount.invoices && selectedBankAccount.invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Related Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBankAccount.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.clientName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          invoice.status === 'PAID' ? 'default' : 
                          invoice.status === 'PENDING' ? 'secondary' : 'destructive'
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatRupees(invoice.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
