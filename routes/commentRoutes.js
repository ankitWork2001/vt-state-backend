import express from 'express';
import { addComment, getBlogComments, deleteComment } from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const CommentRoutes = () => {
  const router = express.Router();

  router.post('/:blogId', verifyToken, addComment);
  router.get('/:blogId', getBlogComments);
  router.delete('/:commentId', verifyToken, deleteComment); // Owner or Admin only logic in controller

  return router;
};

export default CommentRoutes();