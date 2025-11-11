import { Response } from 'express';
import { prisma } from '@/config/database';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/middlewares/error.middleware';
import { ApiResponse } from '@/types';
import { z } from 'zod';

// Type assertion to fix Prisma client issues
const db = prisma as any;

// Validation schemas
const CreateBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountHolder: z.string().min(1, 'Account holder name is required'),
  accountType: z.enum(['SAVINGS', 'CURRENT', 'CREDIT_CARD', 'LOAN', 'INVESTMENT']).default('SAVINGS'),
  ifscCode: z.string().optional(),
  branchName: z.string().optional(),
  balance: z.number().optional().default(0)
});

const UpdateBankAccountSchema = CreateBankAccountSchema.partial();

// Get all bank accounts for user
export const getBankAccounts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  const bankAccounts = await db.bankAccount.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          transactions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate credits and debits for each bank account
  const bankAccountsWithStats = await Promise.all(
    bankAccounts.map(async (account: any) => {
      const transactions = await (prisma as any).transaction.findMany({
        where: {
          userId,
          bankAccountId: account.id
        },
        select: {
          type: true,
          amount: true
        }
      });

      const credits = transactions
        .filter((t: any) => t.type === 'CREDIT')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

      const debits = transactions
        .filter((t: any) => t.type === 'DEBIT')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

      // Calculate dynamic balance based on transactions
      const calculatedBalance = credits - debits;
      
      return {
        ...account,
        balance: calculatedBalance,
        credits,
        debits,
        transactionCount: account._count.transactions
      };
    })
  );

  const response: ApiResponse<typeof bankAccountsWithStats> = {
    success: true,
    message: 'Bank accounts retrieved successfully',
    data: bankAccountsWithStats
  };

  res.json(response);
});

// Get single bank account with transactions
export const getBankAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const bankAccount = await db.bankAccount.findFirst({
    where: {
      id,
      userId
    },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        select: {
          id: true,
          type: true,
          description: true,
          category: true,
          amount: true,
          date: true,
          createdAt: true
        }
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          clientName: true,
          totalAmount: true,
          status: true,
          issueDate: true
        }
      }
    }
  });

  if (!bankAccount) {
    return res.status(404).json({
      success: false,
      message: 'Bank account not found'
    });
  }

  // Calculate totals
  const credits = bankAccount.transactions
    .filter((t: any) => t.type === 'CREDIT')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

  const debits = bankAccount.transactions
    .filter((t: any) => t.type === 'DEBIT')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

  // Calculate dynamic balance based on transactions
  const calculatedBalance = credits - debits;
  
  const accountWithStats = {
    ...bankAccount,
    balance: calculatedBalance,
    credits,
    debits,
    transactions: bankAccount.transactions.map((t: any) => ({
      ...t,
      amount: parseFloat(t.amount.toString())
    })),
    invoices: bankAccount.invoices.map((i: any) => ({
      ...i,
      totalAmount: parseFloat(i.totalAmount.toString())
    }))
  };

  const response: ApiResponse<typeof accountWithStats> = {
    success: true,
    message: 'Bank account retrieved successfully',
    data: accountWithStats
  };

  res.json(response);
});

// Create new bank account
export const createBankAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  
  try {
    const validatedData = CreateBankAccountSchema.parse(req.body);

    // Check if account number already exists for this user
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        userId,
        accountNumber: validatedData.accountNumber
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Bank account with this account number already exists'
      });
    }

    const bankAccount = await db.bankAccount.create({
      data: {
        ...validatedData,
        userId
      }
    });

    const response: ApiResponse<typeof bankAccount> = {
      success: true,
      message: 'Bank account created successfully',
      data: {
        ...bankAccount,
        balance: parseFloat(bankAccount.balance.toString())
      }
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.errors
      });
    }
    throw error;
  }
});

// Update bank account
export const updateBankAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const validatedData = UpdateBankAccountSchema.parse(req.body);

    // Check if bank account exists and belongs to user
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // If updating account number, check for duplicates
    if (validatedData.accountNumber && validatedData.accountNumber !== existingAccount.accountNumber) {
      const duplicateAccount = await db.bankAccount.findFirst({
        where: {
          userId,
          accountNumber: validatedData.accountNumber,
          id: { not: id }
        }
      });

      if (duplicateAccount) {
        return res.status(400).json({
          success: false,
          message: 'Bank account with this account number already exists'
        });
      }
    }

    const updatedAccount = await db.bankAccount.update({
      where: { id },
      data: validatedData
    });

    const response: ApiResponse<typeof updatedAccount> = {
      success: true,
      message: 'Bank account updated successfully',
      data: {
        ...updatedAccount,
        balance: parseFloat(updatedAccount.balance.toString())
      }
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.errors
      });
    }
    throw error;
  }
});

// Delete bank account
export const deleteBankAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check if bank account exists and belongs to user
  const existingAccount = await db.bankAccount.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingAccount) {
    return res.status(404).json({
      success: false,
      message: 'Bank account not found'
    });
  }

  // Check if there are any linked transactions or invoices
  const transactionCount = await (prisma as any).transaction.count({
    where: { bankAccountId: id }
  });

  const invoiceCount = await (prisma as any).invoice.count({
    where: { bankAccountId: id }
  });

  if (transactionCount > 0 || invoiceCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete bank account. It has ${transactionCount} transactions and ${invoiceCount} invoices linked to it.`
    });
  }

  await db.bankAccount.delete({
    where: { id }
  });

  const response: ApiResponse<null> = {
    success: true,
    message: 'Bank account deleted successfully',
    data: null
  };

  res.json(response);
});

// Toggle bank account active status
export const toggleBankAccountStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existingAccount = await db.bankAccount.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingAccount) {
    return res.status(404).json({
      success: false,
      message: 'Bank account not found'
    });
  }

  const updatedAccount = await db.bankAccount.update({
    where: { id },
    data: {
      isActive: !existingAccount.isActive
    }
  });

  const response: ApiResponse<typeof updatedAccount> = {
    success: true,
    message: `Bank account ${updatedAccount.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      ...updatedAccount,
      balance: parseFloat(updatedAccount.balance.toString())
    }
  };

  res.json(response);
});
