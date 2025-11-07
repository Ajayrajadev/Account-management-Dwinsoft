import { Router } from 'express';
import {
  getDashboardSummary,
  getIncomeExpenseData,
  getCategoryExpenses,
  updateGoal,
  getGoal
} from '@/controllers/dashboard.controller';
import { authenticateToken } from '@/middlewares/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get comprehensive dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBalance:
 *                       type: number
 *                     totalInvoiceAmount:
 *                       type: number
 *                     monthlyIncome:
 *                       type: number
 *                     monthlyExpenses:
 *                       type: number
 *                     monthlyProfit:
 *                       type: number
 *                     recentTransactions:
 *                       type: array
 *                     recentInvoices:
 *                       type: array
 *                     categoryExpenses:
 *                       type: array
 *                     incomeExpenseData:
 *                       type: array
 */
router.get('/summary', getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/income-expense:
 *   get:
 *     summary: Get income vs expense data for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "12"
 *         description: Number of months to include
 *     responses:
 *       200:
 *         description: Income/Expense data retrieved successfully
 */
router.get('/income-expense', getIncomeExpenseData);

/**
 * @swagger
 * /api/dashboard/category-expenses:
 *   get:
 *     summary: Get category-wise expense breakdown
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Number of days to include
 *     responses:
 *       200:
 *         description: Category expenses retrieved successfully
 */
router.get('/category-expenses', getCategoryExpenses);

/**
 * @swagger
 * /api/dashboard/goal:
 *   get:
 *     summary: Get monthly savings goal
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly goal retrieved successfully
 */
router.get('/goal', getGoal);

/**
 * @swagger
 * /api/dashboard/goal:
 *   put:
 *     summary: Update monthly savings goal
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Monthly goal updated successfully
 */
router.put('/goal', updateGoal);

export default router;
