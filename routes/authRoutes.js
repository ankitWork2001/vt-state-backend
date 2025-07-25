import express from 'express';
import { requestOtp, register, login, adminLogin, getUserProfile, updateProfile, forgotPassword, verifyOtp, resetPassword, registerAdmin } from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const AuthRoutes = () => {
  const router = express.Router();

  router.post('/request-otp', requestOtp);
  router.post('/register', register);
  router.post('/register-admin',verifyToken,isAdmin, registerAdmin);
  router.post('/forgot-password', forgotPassword);
  router.post('/verify-otp', verifyOtp);
  router.post('/reset-password', resetPassword);
  router.post('/login', login);
  router.post('/admin/login', adminLogin); 
  router.get('/user/me', verifyToken, getUserProfile);
  router.patch('/update-profile', verifyToken, upload.single('profilePic'), updateProfile);
  router.get('/verify-token', verifyToken, (req, res) => {
    console.log('Verify Token called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({
      message: 'Token is valid',
      user: {
        userId: req.user.userId,
        isAdmin: req.user.isAdmin,
        
      }
    });
  });

  return router;
};

export default AuthRoutes();