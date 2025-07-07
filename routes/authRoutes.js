import express from 'express';
import { register, login, getUserProfile, updateUsername } from '../controllers/authController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const AuthRoutes = () => {
  const router = express.Router();

  router.post('/register', register);
  router.post('/login', login);
  router.get('/user/me', verifyToken, getUserProfile);
  router.patch('/user/update-username', verifyToken, updateUsername);

  return router;
};

export default AuthRoutes();