import express from 'express';
const router = express.Router();
import authenticateToken from '../middleware/auth.js'; // Added .js extension
import {
  createTransaction,
  getTransactionsForUser,
  getExpenses,
  getExpenseTransactionsForUser,
  getIncome,
  getIncomeTransactionsForUser,
  getTransactionsForCategory,
  editTransaction,
  deleteTransaction
} from '../services/TransactionServices.js'; // Added .js extension

import { PrismaClient } from '@prisma/client'; // Needed for reset
const prisma = new PrismaClient();

//  POST /api/transactions/createTransaction
//  Authenticate the user, and create a new transaction
//  The userId is taken from the token, NOT the route or body.
router.post('/createTransaction', authenticateToken, createTransaction);

//  GET /api/transactions/getTransactionsForUser/:userId
//  Authenticate the user, and get all transactions for that user.
//  The userId is taken from the token, NOT the route.
router.get('/getTransactionsForUser/:userId', authenticateToken, getTransactionsForUser);

//  GET /api/transactions/getExpenses
//  Gets all expenses.  userId from token.
router.get('/getExpenses', authenticateToken, getExpenses);

//  GET /api/transactions/getExpenseTransactionsForUser/:userId
//   Gets expenses for a specific user. userId from token.
router.get('/getExpenseTransactionsForUser/:userId', authenticateToken, getExpenseTransactionsForUser);

router.get('/getIncome', authenticateToken, getIncome);
router.get('/getIncomeTransactionsForUser/:userId', authenticateToken, getIncomeTransactionsForUser);

//  GET /api/transactions/getExpensesForCategory/:categoryName/:userId
//  Gets all expenses for a specific category.
//  userId is from token, NOT route.
router.get('/getExpensesForCategory/:categoryName/:userId', authenticateToken, getTransactionsForCategory);

//  PUT /api/transactions/editTransaction/:id
//  Edits a specific transaction.
//  userId is taken from token for validation.  Transaction ID from route.
router.put('/editTransaction/:id', authenticateToken, editTransaction);

//  DELETE /api/transactions/deleteTransaction/:id
//  Deletes a transaction
//  userId is from token for validation. Transaction ID from route.
router.delete('/deleteTransaction/:id', authenticateToken, deleteTransaction);

//  DELETE /api/transactions/resetTransactions/:userId
//  Deletes all transactions for a user (reset)
router.delete('/resetTransactions/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    await prisma.transaction.deleteMany({
      where: {
        userId,
      },
    });
    res.status(200).json({ message: 'All transactions deleted successfully' });
  } catch (error) {
    console.error('Error resetting transactions:', error);
    res.status(500).json({ error: 'Failed to reset transactions' });
  }
});

export default router;
