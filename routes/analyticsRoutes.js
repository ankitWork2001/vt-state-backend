import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import { startVisit, endVisit, getWebsiteOverview, getArticleAnalytics, getPageAnalytics, getBlogs } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/visit/start', startVisit);
router.post('/visit/end', endVisit);
router.get('/summary', verifyToken, isAdmin, getWebsiteOverview);
router.get('/article/:id', verifyToken, isAdmin, getArticleAnalytics);
router.get('/page', verifyToken, isAdmin, getPageAnalytics);
router.get('/blogs', verifyToken, isAdmin, getBlogs); 

export default router;