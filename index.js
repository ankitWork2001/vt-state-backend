import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import limiter from './middlewares/rateLimiterMiddleware.js';
import dbConnect from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

/// Middleware
app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",       // dev
  "https://mindful-path.onrender.com", // prod
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true,
// }));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});
// Database Connection and Server Start
const PORT = process.env.PORT || 5000;
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} at ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed at', new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }), err);
    process.exit(1);
  });
