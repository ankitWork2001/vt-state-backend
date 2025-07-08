import express from 'express';
import { register, login, getUserProfile, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const AuthRoutes = () => {
  const router = express.Router();

  router.post('/register', register);
  router.post('/login', login);
  router.get('/user/me', verifyToken, getUserProfile);
  router.patch('/update-profile', verifyToken, updateProfile);

  return router;
};

export default AuthRoutes();