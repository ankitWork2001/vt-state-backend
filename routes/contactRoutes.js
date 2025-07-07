import express from 'express';
import { submitContact } from '../controllers/contactController.js';

const contactRoutes = () => {
  const router = express.Router();

  router.post('/', submitContact);

  return router;
};

export default contactRoutes();