import express from 'express';
const router = express.Router();
import authenticateToken from '../middleware/auth.js'; // Added .js extension
import { getReportForAMonth } from '../services/FinancialReportServices.js'; // Added .js extension

router.get('/getReportForAMonth/:month/:userId', authenticateToken, getReportForAMonth);

export default router;