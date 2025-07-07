import express from 'express';
import { createCategory, createSubcategory, getAllCategories, updateCategory, deleteCategory, deleteSubcategory } from '../controllers/categoryController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const CategoryRoutes = () => {
  const router = express.Router();

  router.post('/', verifyToken, isAdmin, createCategory);
  router.post('/:categoryId/subcategories', verifyToken, isAdmin, createSubcategory);
  router.get('/', getAllCategories);
  router.put('/:id', verifyToken, isAdmin, updateCategory);
  router.delete('/:id', verifyToken, isAdmin, deleteCategory);
  router.delete('/subcategories/:id', verifyToken, isAdmin, deleteSubcategory);

  return router;
};

export default CategoryRoutes();