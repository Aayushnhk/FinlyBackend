import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser'; // Import cookie-parser

import CategoriesController from './controllers/CategoriesController.js';
import BudgetsController from './controllers/BudgetsController.js';
import FinancialReportsController from './controllers/FinancialReportsController.js';
import TransactionsController from './controllers/TransactionsController.js';
import AuthController from './controllers/AuthController.js';

const app = express();
app.use(bodyParser.json());

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));

// Use cookie-parser middleware
app.use(cookieParser());

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