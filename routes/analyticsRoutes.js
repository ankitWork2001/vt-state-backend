import express from 'express';
import { startVisit, endVisit, getWebsiteOverview, getArticleAnalytics } from '../controllers/analyticsController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const AnalyticsRoutes = () => {
  const router = express.Router();

  router.post('/visit/start', startVisit);
  router.post('/visit/end', endVisit);
  router.get('/summary', verifyToken, isAdmin, getWebsiteOverview);
  router.get('/article/:id', verifyToken, isAdmin, getArticleAnalytics);

  return router;
};

export default AnalyticsRoutes();