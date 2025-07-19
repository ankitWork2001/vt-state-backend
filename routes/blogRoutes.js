import express from 'express';
import multer from 'multer';
import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog, likeBlog, bookmarkBlog, getSavedBlogs, setAllBlogsIsLive } from '../controllers/blogController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const RouteTemplate = () => {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  router.post('/', verifyToken, isAdmin, upload.single('thumbnail'), createBlog);
  router.get('/', getAllBlogs);
  router.get('/:id', getBlogById);
  router.put('/set-all-isLive', verifyToken, isAdmin, setAllBlogsIsLive); // Moved before /:id
  router.put('/:id', verifyToken, isAdmin, upload.single('thumbnail'), updateBlog);
  router.delete('/:id', verifyToken, isAdmin, deleteBlog);
  router.post('/:id/like', verifyToken, likeBlog);
  router.post('/:id/bookmark', verifyToken, bookmarkBlog);
  router.get('/user/saved', verifyToken, getSavedBlogs);

  return router;
};

export default RouteTemplate();