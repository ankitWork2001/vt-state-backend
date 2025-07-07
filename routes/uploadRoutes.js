import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const UploadRoutes = () => {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  router.post('/', verifyToken, isAdmin, upload.single('file'), uploadImage);

  return router;
};

export default UploadRoutes();