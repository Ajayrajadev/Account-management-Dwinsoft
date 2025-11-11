'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBankAccountStore } from '@/store/bankAccountStore';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BankAccountForm } from '@/components/modals/BankAccountForm';
import { formatRupees } from '@/lib/utils';
import {
  Building2,
  CreditCard,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BankAccount } from '@/types/bankAccount';
import Link from 'next/link';

const accountTypeIcons = {
  SAVINGS: Wallet,
  CURRENT: Building2,
  CREDIT_CARD: CreditCard,
  LOAN: TrendingDown,
  INVESTMENT: TrendingUp,
};

const accountTypeLabels = {
  SAVINGS: 'Savings',
  CURRENT: 'Current',
  CREDIT_CARD: 'Credit Card',
  LOAN: 'Loan',
  INVESTMENT: 'Investment',
};

const accountTypeColors = {
  SAVINGS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CURRENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CREDIT_CARD: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  LOAN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  INVESTMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export default function BankAccountsPage() {
  const router = useRouter();
  const {
    bankAccounts,
    loading,
    fetchBankAccounts,
    deleteBankAccount,
    toggleBankAccountStatus,
  } = useBankAccountStore();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteBankAccount(id);
        setDeleteConfirm(null);
      } catch (error) {
        // Error handled in store
      }
    } else {
      setDeleteConfirm(id);
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBankAccountStatus(id);
    } catch (error) {
      // Error handled in store
    }
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const activeAccounts = bankAccounts.filter(account => account.isActive).length;
  const totalCredits = bankAccounts.reduce((sum, account) => sum + (account.credits || 0), 0);
  const totalDebits = bankAccounts.reduce((sum, account) => sum + (account.debits || 0), 0);

  return (
    <PageShell
      title="Bank Accounts"
      description="Manage your bank accounts and track transactions"
      actions={
        <BankAccountForm
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          }
          onSuccess={() => fetchBankAccounts()}
        />
      }
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupees(totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              of {bankAccounts.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupees(totalCredits)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupees(totalDebits)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bankAccounts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bank Accounts</h3>
            <p className="text-muted-foreground mb-4">
              Add your first bank account to start tracking your finances.
            </p>
            <BankAccountForm
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              }
              onSuccess={() => fetchBankAccounts()}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bankAccounts.map((account, index) => {
            const IconComponent = accountTypeIcons[account.accountType];
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-primary/50 ${
                    !account.isActive ? 'opacity-60' : ''
                  }`}
                  onClick={() => router.push(`/bank-accounts/${account.id}`)}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          {account.bankName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {account.accountHolder}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ****{account.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/bank-accounts/${account.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <BankAccountForm
                          bankAccount={account}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Account
                            </DropdownMenuItem>
                          }
                          onSuccess={() => fetchBankAccounts()}
                        />
                        <DropdownMenuItem onClick={() => handleToggleStatus(account.id)}>
                          {account.isActive ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteConfirm === account.id ? 'Confirm Delete' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={accountTypeColors[account.accountType]}>
                          {accountTypeLabels[account.accountType]}
                        </Badge>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Balance:</span>
                          <span className="font-semibold">{formatRupees(account.balance || 0)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">Credits:</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatRupees(account.credits || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-600">Debits:</span>
                          <span className="text-sm font-medium text-red-600">
                            {formatRupees(account.debits || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Transactions:</span>
                          <span className="text-sm font-medium">{account.transactionCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <p className="text-xs text-muted-foreground text-center">
                          Click to view details →
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
