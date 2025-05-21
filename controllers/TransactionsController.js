import express from "express";
const router = express.Router();
import authenticateToken from "../middleware/auth.js";
import {
  createTransaction,
  getTransactionsForUser,
  getExpenses,
  getExpenseTransactionsForUser,
  getIncome,
  getIncomeTransactionsForUser,
  getTransactionsForCategory,
  editTransaction,
  deleteTransaction,
} from "../services/TransactionServices.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.post("/createTransaction", authenticateToken, createTransaction);

router.get(
  "/getTransactionsForUser/:userId",
  authenticateToken,
  getTransactionsForUser
);

router.get("/getExpenses", authenticateToken, getExpenses);

router.get(
  "/getExpenseTransactionsForUser/:userId",
  authenticateToken,
  getExpenseTransactionsForUser
);

router.get("/getIncome", authenticateToken, getIncome);
router.get(
  "/getIncomeTransactionsForUser/:userId",
  authenticateToken,
  getIncomeTransactionsForUser
);

router.get(
  "/getExpensesForCategory/:categoryName/:userId",
  authenticateToken,
  getTransactionsForCategory
);

router.put("/editTransaction/:id", authenticateToken, editTransaction);

router.delete("/deleteTransaction/:id", authenticateToken, deleteTransaction);

router.delete(
  "/resetTransactions/:userId",
  authenticateToken,
  async (req, res) => {
    const { userId } = req.params;

    try {
      await prisma.transaction.deleteMany({
        where: {
          userId,
        },
      });
      res
        .status(200)
        .json({ message: "All transactions deleted successfully" });
    } catch (error) {
      console.error("Error resetting transactions:", error);
      res.status(500).json({ error: "Failed to reset transactions" });
    }
  }
);

export default router;
