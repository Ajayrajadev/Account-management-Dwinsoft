import { Router } from 'express';
import {
  getBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  toggleBankAccountStatus
} from '@/controllers/bankAccounts.controller';
import { authenticateToken } from '@/middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Bank account routes
router.get('/', getBankAccounts);
router.get('/:id', getBankAccount);
router.post('/', createBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);
router.patch('/:id/toggle-status', toggleBankAccountStatus);

export default router;
