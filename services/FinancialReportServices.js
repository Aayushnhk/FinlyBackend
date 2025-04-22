import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient();

export const getReportForAMonth = async (req, res) => {
  const month = req.params.month;
  const userId = req.params.userId; // userId is now a String (ObjectId)

  try {
    const transactions = await prismaClient.transaction.findMany({
      where: {
        userId: userId,
        date: {
          contains: `/${month}/`
        }
      }
    });

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ transactions: [], netAmount: 0, message: 'No transactions found for the month!' });
    }

    let netAmount = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        netAmount += transaction.amount;
      } else {
        netAmount -= transaction.amount;
      }
    });

    res.status(200).json({ transactions, netAmount });

  } catch (error) {
    console.error('Error fetching financial report:', error);
    res.status(500).send('Server error');
  }
};