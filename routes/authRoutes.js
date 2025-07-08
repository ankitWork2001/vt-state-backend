import express from 'express';
import { requestOtp, register, login, getUserProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const AuthRoutes = () => {
  const router = express.Router();

  router.post('/request-otp', requestOtp);
  router.post('/register', register);
  router.post('/forgot-password', forgotPassword);
  router.post('/reset-password', resetPassword);
  router.post('/login', login);
  router.get('/user/me', verifyToken, getUserProfile);
  router.patch('/update-profile', verifyToken, updateProfile);

  return router;
};

export default AuthRoutes();