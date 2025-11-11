import { Router } from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  duplicateInvoice,
  getInvoiceStats
} from '@/controllers/invoices.controller';
import { authenticateToken } from '@/middlewares/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices with filtering and pagination
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 */
router.get('/', getInvoices);

/**
 * @swagger
 * /api/invoices/stats:
 *   get:
 *     summary: Get invoice statistics
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice statistics retrieved successfully
 */
router.get('/stats', getInvoiceStats);

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceInput'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post('/', createInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get a specific invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', getInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceInput'
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 */
router.put('/:id', updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}/status:
 *   patch:
 *     summary: Update invoice status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *               paidDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Invoice status updated successfully
 *       404:
 *         description: Invoice not found
 */
router.patch('/:id/status', updateInvoiceStatus);

/**
 * @swagger
 * /api/invoices/{id}/paid:
 *   patch:
 *     summary: Mark invoice as paid
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice marked as paid successfully
 *       404:
 *         description: Invoice not found
 */
router.patch('/:id/paid', (req, res, next) => {
  req.body = { status: 'PAID', paidDate: new Date().toISOString() };
  updateInvoiceStatus(req, res, next);
});

/**
 * @swagger
 * /api/invoices/{id}/unpaid:
 *   patch:
 *     summary: Mark invoice as unpaid
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice marked as unpaid successfully
 *       404:
 *         description: Invoice not found
 */
router.patch('/:id/unpaid', (req, res, next) => {
  req.body = { status: 'PENDING' };
  updateInvoiceStatus(req, res, next);
});

/**
 * @swagger
 * /api/invoices/{id}/duplicate:
 *   post:
 *     summary: Duplicate an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Invoice duplicated successfully
 *       404:
 *         description: Invoice not found
 */
router.post('/:id/duplicate', duplicateInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
router.delete('/:id', deleteInvoice);

export default router;
