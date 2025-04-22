import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config'; // This is fine for local, Railway handles env vars differently
import cookieParser from 'cookie-parser';

import CategoriesController from './controllers/CategoriesController.js';
import BudgetsController from './controllers/BudgetsController.js';
import FinancialReportsController from './controllers/FinancialReportsController.js';
import TransactionsController from './controllers/TransactionsController.js';
import AuthController from './controllers/AuthController.js';

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Railway will provide this env var
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());

// Use Railway's PORT environment variable, default to 3000 for local
const PORT = process.env.PORT || 3000;

// API routes
app.use('/api/auth', AuthController);
app.use('/api/categories', CategoriesController);
app.use('/api/transactions', TransactionsController);
app.use('/api/budgets', BudgetsController);
app.use('/api/financialReports', FinancialReportsController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});