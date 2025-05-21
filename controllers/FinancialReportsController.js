import express from 'express';
const router = express.Router();
import authenticateToken from '../middleware/auth.js';
import { getReportForAMonth } from '../services/FinancialReportServices.js';

router.get('/getReportForAMonth/:month/:userId', authenticateToken, getReportForAMonth);

export default router;