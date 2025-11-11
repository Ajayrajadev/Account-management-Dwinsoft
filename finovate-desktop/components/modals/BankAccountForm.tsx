'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBankAccountStore } from '@/store/bankAccountStore';
import { BankAccount } from '@/types/bankAccount';
import { Plus, Edit } from 'lucide-react';

const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountHolder: z.string().min(1, 'Account holder name is required'),
  accountType: z.enum(['SAVINGS', 'CURRENT', 'CREDIT_CARD', 'LOAN', 'INVESTMENT']),
  ifscCode: z.string().optional(),
  branchName: z.string().optional(),
  balance: z.union([z.string(), z.number()]).transform(val => val === '' ? 0 : Number(val)).optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  bankAccount?: BankAccount;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BankAccountForm({ bankAccount, trigger, onSuccess }: BankAccountFormProps) {
  const [open, setOpen] = useState(false);
  const { createBankAccount, updateBankAccount, loading } = useBankAccountStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(bankAccountSchema as any),
    defaultValues: bankAccount ? {
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountHolder: bankAccount.accountHolder,
      accountType: bankAccount.accountType,
      ifscCode: bankAccount.ifscCode || '',
      branchName: bankAccount.branchName || '',
      balance: bankAccount.balance ? String(bankAccount.balance) : '',
    } : {
      accountType: 'SAVINGS',
      balance: '',
    },
  });

  const accountType = watch('accountType');

  const onSubmit = async (data: any) => {
    try {
      if (bankAccount) {
        await updateBankAccount(bankAccount.id, data);
      } else {
        await createBankAccount(data);
      }
      
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {bankAccount ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Account
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {bankAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
          </DialogTitle>
          <DialogDescription>
            {bankAccount 
              ? 'Update your bank account information.' 
              : 'Add a new bank account to track your finances.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                placeholder="e.g., State Bank of India"
                {...register('bankName')}
              />
              {errors.bankName && (
                <p className="text-sm text-red-600">{errors.bankName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                value={accountType}
                onValueChange={(value) => setValue('accountType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings Account</SelectItem>
                  <SelectItem value="CURRENT">Current Account</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="LOAN">Loan Account</SelectItem>
                  <SelectItem value="INVESTMENT">Investment Account</SelectItem>
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-sm text-red-600">{errors.accountType.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                {...register('accountNumber')}
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-600">{errors.accountNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder *</Label>
              <Input
                id="accountHolder"
                placeholder="Enter account holder name"
                {...register('accountHolder')}
              />
              {errors.accountHolder && (
                <p className="text-sm text-red-600">{errors.accountHolder.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                placeholder="e.g., SBIN0001234"
                {...register('ifscCode')}
              />
              {errors.ifscCode && (
                <p className="text-sm text-red-600">{errors.ifscCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                placeholder="Enter branch name"
                {...register('branchName')}
              />
              {errors.branchName && (
                <p className="text-sm text-red-600">{errors.branchName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Initial Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('balance')}
            />
            {errors.balance && (
              <p className="text-sm text-red-600">{errors.balance.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : bankAccount ? 'Update Account' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
