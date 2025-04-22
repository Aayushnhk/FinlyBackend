import express from 'express';
const router = express.Router();
import authenticateToken from '../middleware/auth.js';
import {
  createBudget,
  getBudgetsForUser,
  trackBudget,
  getBudgetsForCategory,
  editBudget,
  deleteBudget,
  resetBudgetSpendingForUser, // Import the new function
} from '../services/BudgetServices.js';

router.post('/createBudget/:userId', authenticateToken, createBudget);
router.get('/getBudgetsForUser/:userId', authenticateToken, getBudgetsForUser);
router.get('/trackBudget', authenticateToken, trackBudget);
router.get('/getBudgetsForCategory/:categoryId', authenticateToken, getBudgetsForCategory);
router.put('/editBudget/:id/:userId', authenticateToken, editBudget);
router.delete('/deleteBudget/:id/:userId', authenticateToken, deleteBudget); // Updated delete route

// New route for resetting budget spending
router.post('/resetBudgetSpending/:userId', authenticateToken, resetBudgetSpendingForUser);

export default router;