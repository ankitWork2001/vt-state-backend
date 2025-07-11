import express from 'express';
import { createCategory, createSubcategory, getAllCategories, updateCategory, deleteCategory, deleteSubcategory ,updateSubcategory} from '../controllers/categoryController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const CategoryRoutes = () => {
  const router = express.Router();

  router.post('/', verifyToken, isAdmin,upload.single('categoryImage'), createCategory);
  router.post('/:categoryId/subcategories', verifyToken, isAdmin, createSubcategory);
  router.get('/', getAllCategories);
  router.put('/:id', verifyToken, isAdmin,upload.single('categoryImage'), updateCategory);
  router.put('/subcategories/:id', verifyToken, isAdmin, updateSubcategory);
  router.delete('/:id', verifyToken, isAdmin, deleteCategory);
  router.delete('/subcategories/:id', verifyToken, isAdmin, deleteSubcategory);

  return router;
};

export default CategoryRoutes();