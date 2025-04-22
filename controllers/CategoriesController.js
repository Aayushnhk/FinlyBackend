import express from 'express';
const router = express.Router();
import authenticateToken from '../middleware/auth.js'; // Added .js extension
import {
  createCategory,
  getCategories,
  editCategory,
  deleteCategory
} from '../services/CategoriesServices.js'; // Added .js extension

router.post('/createCategory', authenticateToken, createCategory);
router.get('/getCategories', authenticateToken, getCategories);
router.put('/editCategory/:id', editCategory);
router.delete('/deleteCategory/:id', deleteCategory);

export default router;