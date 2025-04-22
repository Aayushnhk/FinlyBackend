import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import controllers
import CategoriesController from './controllers/CategoriesController.js';
import BudgetsController from './controllers/BudgetsController.js';
import FinancialReportsController from './controllers/FinancialReportsController.js';
import TransactionsController from './controllers/TransactionsController.js';
import AuthController from './controllers/AuthController.js';

// Initialize Express app
const app = express();

// ======================
// Middleware Setup
// ======================
app.use(bodyParser.json());
app.use(cookieParser());

// Configure CORS using Railway environment variable
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Fallback for local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ======================
// Routes
// ======================

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'API Server Running',
    timestamp: new Date().toISOString(),
    environment: {
      port: process.env.PORT,
      frontend: process.env.FRONTEND_URL,
      node_version: process.version
    }
  });
});

// API routes
app.use('/api/auth', AuthController);
app.use('/api/categories', CategoriesController);
app.use('/api/transactions', TransactionsController);
app.use('/api/budgets', BudgetsController);
app.use('/api/financialReports', FinancialReportsController);

// ======================
// Error Handling
// ======================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      '/api/auth',
      '/api/categories',
      '/api/transactions',
      '/api/budgets',
      '/api/financialReports'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Required for Railway deployment

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server launched on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('Available routes:');
  console.log('- GET  /');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- GET  /api/categories');
  console.log('- GET  /api/transactions');
  console.log('- GET  /api/budgets');
  console.log('- GET  /api/financialReports');
});