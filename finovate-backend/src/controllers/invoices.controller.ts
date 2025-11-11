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

// Helper function to parse invoice items from JSON string
const parseInvoiceItems = (invoice: any) => {
  if (!invoice) return invoice;
  
  try {
    return {
      ...invoice,
      items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
    };
  } catch (error) {
    console.error('Error parsing invoice items:', error);
    return {
      ...invoice,
      items: []
    };
  }
};

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

  // Parse items field for all invoices
  const parsedInvoices = invoices.map(parseInvoiceItems);

  const response: ApiResponse = {
    success: true,
    message: 'Invoices retrieved successfully',
    data: parsedInvoices,
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

  // Parse items field
  const parsedInvoice = parseInvoiceItems(invoice);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice retrieved successfully',
    data: parsedInvoice
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

  // Calculate totals from frontend data
  const items = data.items.map(item => ({
    ...item,
    amount: item.amount || (item.quantity * item.rate)
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  
  // Handle discount
  const discount = data.discount || 0;
  const discountType = data.discountType || 'percentage';
  const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const afterDiscount = subtotal - discountAmount;
  
  // Handle tax
  const taxRate = data.taxRate || 0;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const totalAmount = afterDiscount + taxAmount;

  // Use date field if issueDate not provided
  const issueDate = data.issueDate || data.date;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      clientAddress: data.clientAddress || null,
      items: JSON.stringify(items),
      subtotal,
      taxAmount,
      totalAmount,
      status: 'PENDING',
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      userId
    }
  });

  logger.info(`Invoice created: ${invoice.id} by user: ${userId}`);

  // Parse items field before returning
  const parsedInvoice = parseInvoiceItems(invoice);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice created successfully',
    data: parsedInvoice
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
  if (data.items) {
    updateData.items = JSON.stringify(data.items);
  }
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

  // Parse items field before returning
  const parsedInvoice = parseInvoiceItems(invoice);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice updated successfully',
    data: parsedInvoice
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

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update invoice status
    const invoice = await tx.invoice.update({
      where: { id },
      data: updateData
    });

    // If marking as paid and wasn't paid before, create a credit transaction
    if (status === 'PAID' && existingInvoice.status !== 'PAID') {
      await tx.transaction.create({
        data: {
          type: 'CREDIT',
          description: `Payment received for invoice ${existingInvoice.invoiceNumber}`,
          category: 'Invoice Payment',
          amount: existingInvoice.totalAmount,
          date: updateData.paidDate || new Date(),
          userId
        }
      });
      logger.info(`Created credit transaction for invoice payment: ${invoice.id}, amount: ${existingInvoice.totalAmount}`);
    }

    // If marking as unpaid and was paid before, remove the corresponding transaction
    if (status !== 'PAID' && existingInvoice.status === 'PAID') {
      await tx.transaction.deleteMany({
        where: {
          userId,
          type: 'CREDIT',
          description: `Payment received for invoice ${existingInvoice.invoiceNumber}`,
          amount: existingInvoice.totalAmount
        }
      });
      logger.info(`Removed credit transaction for unpaid invoice: ${invoice.id}`);
    }

    return invoice;
  });

  logger.info(`Invoice status updated: ${result.id} to ${status} by user: ${userId}`);

  // Parse items field before returning
  const parsedInvoice = parseInvoiceItems(result);

  const response: ApiResponse = {
    success: true,
    message: `Invoice marked as ${status.toLowerCase()}`,
    data: parsedInvoice
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

  // Parse items field before returning
  const parsedInvoice = parseInvoiceItems(duplicatedInvoice);

  const response: ApiResponse = {
    success: true,
    message: 'Invoice duplicated successfully',
    data: parsedInvoice
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
