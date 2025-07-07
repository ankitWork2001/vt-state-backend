// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log(
      'Token verified at',
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  console.log(
    'Admin access granted at',
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );

  next();
};
