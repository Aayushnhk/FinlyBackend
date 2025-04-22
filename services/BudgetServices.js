import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient();

// Helper function for date formatting (add this at the top)
function formatStoredDateToDisplay(dateString) {
  const [year, month, day] = dateString.split('/');
  return `${day}/${month}/${year}`;
}

export const createBudget = async (req, res) => {
  const userId = req.params.userId;
  let { amount, startDate, endDate, categoryName } = req.body;

  if (!amount || !startDate || !endDate || !categoryName) {
    return res.status(400).json({ error: "One of the fields is missing!" });
  }

  const [startDay, startMonth, startYear] = startDate.split('/');
  startDate = `${startYear}/${startMonth}/${startDay}`;

  const [endDay, endMonth, endYear] = endDate.split('/');
  endDate = `${endYear}/${endMonth}/${endDay}`;

  const lowerCaseCategoryName = categoryName.toLowerCase();

  try {
    let category = await prismaClient.category.findFirst({
      where: { name: lowerCaseCategoryName, userId: userId },
    });

    if (!category) {
      category = await prismaClient.category.create({
        data: { name: lowerCaseCategoryName, userId: userId },
      });
      if (!category) {
        return res.status(500).json({ error: 'Failed to create new category' });
      }
    }

    const isPresent = await prismaClient.budget.findFirst({
      where: {
        userId: userId,
        categoryId: category.id,
        startDate: startDate,
        endDate: endDate,
      },
    });

    if (isPresent) {
      return res.status(400).json({ error: 'You cannot create multiple budgets for the same category for the same start/end dates' });
    }

    const budget = await prismaClient.budget.create({
      data: {
        amount,
        leftAmount: amount,
        startDate,
        endDate,
        categoryId: category.id,
        userId: userId,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget or category:', error);
    res.status(500).json({ error: "Error creating budget!!", message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  const id = req.params.id;
  const userId = req.params.userId;

  try {
    const budgetToDelete = await prismaClient.budget.findUnique({
      where: {
        id: id,
        userId: userId,
      },
      include: { category: true }, // Include category to access categoryId
    });

    if (!budgetToDelete) {
      return res.status(404).json({ error: 'Budget not found or does not belong to the user' });
    }

    await prismaClient.budget.delete({
      where: {
        id: id,
        userId: userId,
      },
    });

    // Delete the associated category
    if (budgetToDelete.category?.id) {
      await prismaClient.category.delete({
        where: {
          id: budgetToDelete.category.id,
          userId: userId, // Ensure the category belongs to the user
        },
      });
      res.json({ message: 'Budget and associated category deleted successfully' });
    } else {
      res.json({ message: 'Budget deleted successfully, but no category information found to delete.' });
    }
  } catch (error) {
    console.error('Error deleting budget and/or category:', error);
    res.status(500).json({ error: 'Error deleting budget and/or category' });
  }
};

export const getBudgetsForUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const budgets = await prismaClient.budget.findMany({
      where: { userId: userId },
      include: { category: true }
    });

    const formattedBudgets = budgets.map(budget => ({
      ...budget,
      startDate: formatStoredDateToDisplay(budget.startDate),
      endDate: formatStoredDateToDisplay(budget.endDate)
    }));

    res.json(formattedBudgets);
  } catch (error) {
    console.error('Error fetching budgets for user:', error);
    res.status(500).json({ error: 'Error fetching budgets' });
  }
};

export const trackBudget = async (req, res) => {
  const categoryName = req.query.categoryName;
  const lowerCaseCategoryName = categoryName.toLowerCase();
  const userId = req.query.userId;

  try {
    const category = await prismaClient.category.findFirst({
      where: {
        name: lowerCaseCategoryName,
        userId: userId,
      }
    });

    if (!category) return res.status(404).json({ error: "Category not found for this user!" });

    const budgets = await prismaClient.budget.findMany({
      where: {
        categoryId: category.id,
        userId: userId,
      },
      include: { category: true }
    });

    const formattedBudgets = budgets.map(budget => ({
      ...budget,
      startDate: formatStoredDateToDisplay(budget.startDate),
      endDate: formatStoredDateToDisplay(budget.endDate)
    }));

    res.json(formattedBudgets);
  } catch (error) {
    console.error('Error tracking budget:', error);
    res.status(500).json({ error: 'Error fetching budgets', message: error.message });
  }
};

export const getBudgetsForCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const budgets = await prismaClient.budget.findMany({
      where: { categoryId: categoryId },
      include: { category: true }
    });

    const formattedBudgets = budgets.map(budget => ({
      ...budget,
      startDate: formatStoredDateToDisplay(budget.startDate),
      endDate: formatStoredDateToDisplay(budget.endDate)
    }));

    res.json(formattedBudgets);
  } catch (error) {
    console.error('Error fetching budgets for category:', error);
    res.status(500).json({ error: 'Error fetching budgets' });
  }
};

export const editBudget = async (req, res) => {
  const id = req.params.id;
  const userId = req.params.userId;
  let { amount, startDate, endDate, categoryName } = req.body;

  if (!amount || !startDate || !endDate || !categoryName) {
    return res.status(400).json({ error: "One of the fields is missing!" });
  }

  const [startDay, startMonth, startYear] = startDate.split('/');
  startDate = `${startYear}/${startMonth}/${startDay}`;

  const [endDay, endMonth, endYear] = endDate.split('/');
  endDate = `${endYear}/${endMonth}/${endDay}`;

  const lowerCaseCategoryName = categoryName.toLowerCase();

  try {
    const oldBudget = await prismaClient.budget.findUnique({
      where: {
        id: id,
        userId: userId,
      }
    });

    if (!oldBudget) {
      return res.status(404).json({ error: 'Budget not found or does not belong to the user' });
    }

    const amountDiff = amount - oldBudget.amount;
    var leftAmount = oldBudget.leftAmount + amountDiff;

    let category = await prismaClient.category.findFirst({
      where: { name: lowerCaseCategoryName, userId: userId },
    });

    if (!category) {
      category = await prismaClient.category.create({
        data: { name: lowerCaseCategoryName, userId: userId },
      });
      if (!category) {
        return res.status(500).json({ error: 'Failed to create new category' });
      }
    }
    const categoryId = category.id;

    const isPresent = await prismaClient.budget.findFirst({
      where: {
        userId: userId,
        categoryId: category.id,
        startDate: startDate,
        endDate: endDate,
        NOT: {
          id: id,
        },
      },
    });

    if (isPresent) {
      return res.status(400).json({ error: 'You cannot create multiple budgets for the same category for the same start/end dates' });
    }

    const updatedBudget = await prismaClient.budget.update({
      where: { id: id, userId: userId },
      data: { amount, leftAmount, startDate, endDate, categoryId },
    });

    const response = {
      ...updatedBudget,
      startDate: formatStoredDateToDisplay(updatedBudget.startDate),
      endDate: formatStoredDateToDisplay(updatedBudget.endDate)
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Error updating budget' });
  }
};



export const resetBudgetSpendingForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const budgetsToReset = await prismaClient.budget.findMany({
      where: { userId },
    });

    for (const budget of budgetsToReset) {
      await prismaClient.budget.update({
        where: { id: budget.id },
        data: { leftAmount: budget.amount },
      });
    }

    res.status(200).json({ message: 'Budget spending reset successfully.' });
  } catch (error) {
    console.error('Error resetting budget spending:', error);
    res.status(500).json({ error: 'Failed to reset budget spending.' });
  }
};

