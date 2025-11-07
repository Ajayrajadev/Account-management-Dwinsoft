import { Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';
import { AppError, asyncHandler } from '@/middlewares/error.middleware';
import {
  TransactionSchema,
  BatchTransactionSchema,
  TransactionUpdateSchema,
  TransactionQuerySchema,
  ApiResponse
} from '@/types';

export const getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const query = TransactionQuerySchema.parse(req.query);

  const where: any = { userId };

  // Apply filters
  if (query.type) {
    where.type = query.type;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.dateFrom || query.dateTo) {
    where.date = {};
    if (query.dateFrom) {
      where.date.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      where.date.lte = new Date(query.dateTo);
    }
  }

  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  // Get total count for pagination
  const total = await prisma.transaction.count({ where });

  // Get transactions with pagination
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' }
    ],
    skip: (query.page - 1) * query.limit,
    take: query.limit
  });

  const totalPages = Math.ceil(total / query.limit);

  const response: ApiResponse = {
    success: true,
    message: 'Transactions retrieved successfully',
    data: transactions,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages
    }
  };

  res.json(response);
});

export const getTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId }
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Transaction retrieved successfully',
    data: transaction
  };

  res.json(response);
});

export const createTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = TransactionSchema.parse(req.body);

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      userId,
      date: data.date ? new Date(data.date) : new Date(),
      recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null
    }
  });

  logger.info(`Transaction created: ${transaction.id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Transaction created successfully',
    data: transaction
  };

  res.status(201).json(response);
});

export const createBatchTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const transactions = BatchTransactionSchema.parse(req.body);

  const createdTransactions = await prisma.$transaction(
    transactions.map(data => 
      prisma.transaction.create({
        data: {
          ...data,
          userId,
          date: data.date ? new Date(data.date) : new Date(),
          recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null
        }
      })
    )
  );

  logger.info(`Batch transactions created: ${createdTransactions.length} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: `${createdTransactions.length} transactions created successfully`,
    data: createdTransactions
  };

  res.status(201).json(response);
});

export const updateTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = TransactionUpdateSchema.parse(req.body);

  // Check if transaction exists and belongs to user
  const existingTransaction = await prisma.transaction.findFirst({
    where: { id, userId }
  });

  if (!existingTransaction) {
    throw new AppError('Transaction not found', 404);
  }

  const updateData: any = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);
  }
  if (data.recurringEndDate) {
    updateData.recurringEndDate = new Date(data.recurringEndDate);
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: updateData
  });

  logger.info(`Transaction updated: ${transaction.id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Transaction updated successfully',
    data: transaction
  };

  res.json(response);
});

export const deleteTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check if transaction exists and belongs to user
  const existingTransaction = await prisma.transaction.findFirst({
    where: { id, userId }
  });

  if (!existingTransaction) {
    throw new AppError('Transaction not found', 404);
  }

  await prisma.transaction.delete({
    where: { id }
  });

  logger.info(`Transaction deleted: ${id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Transaction deleted successfully'
  };

  res.json(response);
});

export const getTransactionCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const categories = await prisma.transaction.groupBy({
    by: ['category'],
    where: { 
      userId,
      category: { not: null }
    },
    _count: {
      category: true
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Transaction categories retrieved successfully',
    data: categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
      totalAmount: cat._sum.amount || 0
    }))
  };

  res.json(response);
});
