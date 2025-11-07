import { Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';
import { AppError, asyncHandler } from '@/middlewares/error.middleware';
import {
  InvoiceSchema,
  InvoiceUpdateSchema,
  InvoiceStatusSchema,
  InvoiceQuerySchema,
  ApiResponse
} from '@/types';

export const getInvoices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const query = InvoiceQuerySchema.parse(req.query);

  const where: any = { userId };

  // Apply filters
  if (query.status) {
    where.status = query.status;
  }

  if (query.clientName) {
    where.clientName = { contains: query.clientName, mode: 'insensitive' };
  }

  if (query.dateFrom || query.dateTo) {
    where.issueDate = {};
    if (query.dateFrom) {
      where.issueDate.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      where.issueDate.lte = new Date(query.dateTo);
    }
  }

  if (query.search) {
    where.OR = [
      { clientName: { contains: query.search, mode: 'insensitive' } },
      { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
      { notes: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  // Get total count for pagination
  const total = await prisma.invoice.count({ where });

  // Get invoices with pagination
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: [
      { issueDate: 'desc' },
      { createdAt: 'desc' }
    ],
    skip: (query.page - 1) * query.limit,
    take: query.limit
  });

  const totalPages = Math.ceil(total / query.limit);

  const response: ApiResponse = {
    success: true,
    message: 'Invoices retrieved successfully',
    data: invoices,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages
    }
  };

  res.json(response);
});

export const getInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId }
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Invoice retrieved successfully',
    data: invoice
  };

  res.json(response);
});

export const createInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = InvoiceSchema.parse(req.body);

  // Generate unique invoice number if not provided
  let invoiceNumber = data.invoiceNumber;
  if (!invoiceNumber) {
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true }
    });

    const lastNumber = lastInvoice?.invoiceNumber.match(/\d+$/)?.[0] || '0';
    invoiceNumber = `INV-${String(parseInt(lastNumber) + 1).padStart(4, '0')}`;
  }

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
      invoiceNumber,
      userId,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    }
  });

  logger.info(`Invoice created: ${invoice.id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice created successfully',
    data: invoice
  };

  res.status(201).json(response);
});

export const updateInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = InvoiceUpdateSchema.parse(req.body);

  // Check if invoice exists and belongs to user
  const existingInvoice = await prisma.invoice.findFirst({
    where: { id, userId }
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  const updateData: any = { ...data };
  if (data.issueDate) {
    updateData.issueDate = new Date(data.issueDate);
  }
  if (data.dueDate) {
    updateData.dueDate = new Date(data.dueDate);
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData
  });

  logger.info(`Invoice updated: ${invoice.id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice updated successfully',
    data: invoice
  };

  res.json(response);
});

export const updateInvoiceStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { status, paidDate } = InvoiceStatusSchema.parse(req.body);

  // Check if invoice exists and belongs to user
  const existingInvoice = await prisma.invoice.findFirst({
    where: { id, userId }
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  const updateData: any = { status };
  
  if (status === 'PAID' && paidDate) {
    updateData.paidDate = new Date(paidDate);
  } else if (status === 'PAID' && !paidDate) {
    updateData.paidDate = new Date();
  } else if (status !== 'PAID') {
    updateData.paidDate = null;
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData
  });

  logger.info(`Invoice status updated: ${invoice.id} to ${status} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: `Invoice marked as ${status.toLowerCase()}`,
    data: invoice
  };

  res.json(response);
});

export const deleteInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check if invoice exists and belongs to user
  const existingInvoice = await prisma.invoice.findFirst({
    where: { id, userId }
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  await prisma.invoice.delete({
    where: { id }
  });

  logger.info(`Invoice deleted: ${id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice deleted successfully'
  };

  res.json(response);
});

export const duplicateInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Check if invoice exists and belongs to user
  const existingInvoice = await prisma.invoice.findFirst({
    where: { id, userId }
  });

  if (!existingInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Generate new invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true }
  });

  const lastNumber = lastInvoice?.invoiceNumber.match(/\d+$/)?.[0] || '0';
  const newInvoiceNumber = `INV-${String(parseInt(lastNumber) + 1).padStart(4, '0')}`;

  // Create duplicate invoice
  const { id: _, createdAt, updatedAt, paidDate, items, ...invoiceData } = existingInvoice;
  
  const duplicatedInvoice = await prisma.invoice.create({
    data: {
      ...invoiceData,
      items: items as any,
      invoiceNumber: newInvoiceNumber,
      status: 'PENDING',
      issueDate: new Date(),
      paidDate: null
    }
  });

  logger.info(`Invoice duplicated: ${id} -> ${duplicatedInvoice.id} by user: ${userId}`);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice duplicated successfully',
    data: duplicatedInvoice
  };

  res.status(201).json(response);
});

export const getInvoiceStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const stats = await prisma.invoice.groupBy({
    by: ['status'],
    where: { userId },
    _count: {
      status: true
    },
    _sum: {
      totalAmount: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Invoice statistics retrieved successfully',
    data: stats.map((stat: any) => ({
      status: stat.status,
      count: stat._count.status,
      totalAmount: stat._sum.totalAmount || 0
    }))
  };

  res.json(response);
});
