import express from 'express';
import { subscribe } from '../controllers/newsletterController.js';

const NewsletterRoutes = () => {
  const router = express.Router();

  router.post('/', subscribe);

  return router;
};

export default NewsletterRoutes();