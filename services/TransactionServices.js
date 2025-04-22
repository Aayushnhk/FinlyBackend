import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient();

export const createTransaction = async (req, res) => {
  const data = req.body;
  const userId = req.userId; // Get userId from the authenticated token!

  if (!data.amount || !data.type) {
    return res.status(400).json({ error: 'Amount and type are required' });
  }

  const { type, amount } = data;
  let name = '';
  let categoryId = null;

  if (type === 'expense') {
    if (!data.categoryId) {
      return res.status(400).json({ error: 'Category is required for expenses' });
    }
    const category = await prismaClient.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }
    categoryId = category.id;
    name = category.name.toLowerCase(); // Use category name as transaction name for expense
  } else if (type === 'income') {
    if (!data.incomeSourceName) {
      return res.status(400).json({ error: 'Source is required for income' });
    }
    name = data.incomeSourceName.toLowerCase();
  } else {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  try {
    var currentDate = new Date();
    var formattedDate = `${currentDate.getFullYear()}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}`;

    const transactionData = {
      amount,
      type,
      name: name,
      date: formattedDate,
      userId: userId,
      categoryId: categoryId,
    };

    if (type === 'expense' && categoryId) {
      const budgets = await prismaClient.budget.findMany({
        where: {
          userId: userId,
          categoryId: categoryId,
          startDate: { lte: formattedDate },
          endDate: { gte: formattedDate },
        },
      });

      let remainingAmount = amount;
      let budgetUpdated = false;

      for (const budget of budgets) {
        if (budget.leftAmount >= remainingAmount) {
          await prismaClient.budget.update({
            where: { id: budget.id },
            data: { leftAmount: { decrement: remainingAmount } },
          });
          budgetUpdated = true;
          break;
        }
      }

      //if (!budgetUpdated) {
      //  return res.status(400).json({ error: 'You are going over-budget or no sufficient budget found for this expense.' });
      //}
    }

    const transaction = await prismaClient.transaction.create({
      data: transactionData,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error creating transaction', message: error.message });
  }
};

// Keep other transaction service functions as they are, as their route parameters seem to align with how you're calling them.

export const getTransactionsForUser = async (req, res) => {
  const userId = req.params.userId; // userId is now a String (ObjectId)

  try {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId: userId },
      include: { category: true },
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await prismaClient.transaction.findMany({
      where: { type: 'expense' },
      include: { category: true },
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

export const getExpenseTransactionsForUser = async (req, res) => {
  const userId = req.params.userId; // userId is now a String (ObjectId)

  try {
    const expenses = await prismaClient.transaction.findMany({
      where: {
        type: 'expense',
        userId,
      },
      include: { category: true },
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses for user:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

export const getIncome = async (req, res) => {
  try {
    const incomes = await prismaClient.transaction.findMany({
      where: { type: 'income' },
    });
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ error: 'Error fetching incomes' });
  }
};

export const getIncomeTransactionsForUser = async (req, res) => {
  const userId = req.params.userId; // userId is now a String (ObjectId)

  try {
    const incomes = await prismaClient.transaction.findMany({
      where: {
        userId,
        type: 'income',
      },
    });
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes for user:', error);
    res.status(500).json({ error: 'Error fetching incomes' });
  }
};

export const getTransactionsForCategory = async (req, res) => {
  const categoryName = req.params.categoryName;
  const userId = req.params.userId; // userId is now a String (ObjectId)

  const lowerCaseCategoryName = categoryName.toLowerCase();

  try {
    const category = await prismaClient.category.findUnique({
      where: {
        name: lowerCaseCategoryName
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found!!' });
    }

    const expenses = await prismaClient.transaction.findMany({
      where: {
        userId,
        categoryId: category.id,
      },
      include: { category: true },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses for this category:', error);
    res.status(500).json({ error: 'Error fetching expenses for this category' });
  }
}


export const editTransaction = async (req, res) => {
  const id = req.params.id; // id is now a String (ObjectId)
  const { amount, type, categoryId, incomeSourceName } = req.body;
  let name = '';

  if (!amount || !type) {
    return res.status(400).json({ error: 'Amount and type are required' });
  }

  if (type === 'expense' && !categoryId) return res.status(400).json({ error: 'Category ID is required for type expense' });

  if (type === 'income' && !incomeSourceName) return res.status(400).json({ error: 'Income Source is required for type income' });

  try {
    const oldTransaction = await prismaClient.transaction.findUnique({
      where: {
        id
      }
    });

    if (!oldTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (oldTransaction.type !== type) return res.status(400).json({ error: 'You cannot change the transaction type. Delete and create a new transaction instead.' });

    const editDataBody = {
      amount,
      type
    };

    if (type === 'expense') {
      const category = await prismaClient.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
      editDataBody.categoryId = category.id;
      editDataBody.name = category.name.toLowerCase();
    } else if (type === 'income') {
      editDataBody.name = incomeSourceName.toLowerCase();
      editDataBody.categoryId = null;
    }

    const updatedTransaction = await prismaClient.transaction.update({
      where: { id },
      data: editDataBody,
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Error updating transaction', message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const id = req.params.id; // id is now a String (ObjectId)

  try {
    const transaction = await prismaClient.transaction.findUnique({
      where: {
        id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.type === 'expense' && transaction.categoryId) {
      const budgets = await prismaClient.budget.findMany({
        where: {
          userId: transaction.userId,
          categoryId: transaction.categoryId,
          startDate: { lte: transaction.date },
          endDate: { gte: transaction.date },
        },
      });

      for (const budget of budgets) {
        await prismaClient.budget.update({
          where: { id: budget.id },
          data: { leftAmount: { increment: transaction.amount } },
        });
      }
    }

    await prismaClient.transaction.delete({ where: { id } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Error deleting transaction' });
  }
};

export const resetTransactionsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await prismaClient.transaction.deleteMany({
      where: { userId },
    });

    res.status(200).json({ message: 'All transactions deleted successfully.' });
  } catch (error) {
    console.error('Error resetting transactions:', error);
    res.status(500).json({ error: 'Failed to reset transactions.' });
  }
};