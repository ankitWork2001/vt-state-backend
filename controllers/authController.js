import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/mailsend.js';
import cloudinaryUtils from '../config/cloudinary.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const OTP_VALIDITY = 10 * 60 * 1000; // 10 minutes
const otpStore = new Map(); // OTP storage for registration
const passwordResetOtpStore = new Map(); // OTP storage for password reset

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Cleanup expired OTPs from passwordResetOtpStore
const cleanupExpiredOtps = () => {
  const now = Date.now();
  for (const [email, data] of passwordResetOtpStore.entries()) {
    if (data.expires < now) {
      passwordResetOtpStore.delete(email);
    }
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate and store OTP
    // const otp = generateOtp();
    const otp = 12345;
    const expires = Date.now() + OTP_VALIDITY;
    otpStore.set(email, { otp, expires });

    // Send OTP email
    // const subject = 'Verify Your Email';
    // const message = `Your OTP for registration is: <b>${otp}</b>. It is valid for 10 minutes.`;
    // await sendEmail(email, subject, message);

    // console.log('Request OTP called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Verify OTP
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Clear OTP
    // otpStore.delete(email);

    // console.log('Register called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and store OTP
    const otp = generateOtp();
    const expires = Date.now() + OTP_VALIDITY;
    passwordResetOtpStore.set(email, { otp, expires, isVerified: false });

    // Send OTP email
    const subject = 'Password Reset OTP';
    const message = `Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes.`;
    await sendEmail(email, subject, message);

    // Cleanup expired OTPs
    cleanupExpiredOtps();

    console.log('Forgot Password called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'OTP sent to email for password reset' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Clean up expired OTPs
    cleanupExpiredOtps();

    // Verify OTP
    const storedOtpData = passwordResetOtpStore.get(email);
    if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    passwordResetOtpStore.set(email, { ...storedOtpData, isVerified: true });

    console.log('Verify OTP called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Clean up expired OTPs
    cleanupExpiredOtps();

    // Check if OTP is verified
    const storedOtpData = passwordResetOtpStore.get(email);
    if (!storedOtpData || !storedOtpData.isVerified) {
      return res.status(400).json({ message: 'OTP not verified' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password' });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    // Clear OTP
    passwordResetOtpStore.delete(email);

    console.log('Reset Password called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email ,isAdmin: false});
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '30h' }
    );

    console.log('Login called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ 
      message: 'User logged in successfully',
      token,
      user: { username: user.username,userid:user.id, email: user.email, isAdmin: user.isAdmin, profilePic: user.profilePic }  
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email ,isAdmin: true});
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '30h' }
    );

    console.log('Login called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ 
      message: 'User logged in successfully',
      token,
      user: { username: user.username,userid:user.id, email: user.email, isAdmin: user.isAdmin, profilePic: user.profilePic }  
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
  .select('-password')
  .populate({
    path: 'savedBlogs',
    select: 'title thumbnail createdAt',
    populate: {
      path: 'categoryId',
      select: 'name'
    }
  })
  .populate({
    path: 'likedBlogs',
    select: 'title thumbnail createdAt',
    populate: {
      path: 'categoryId',
      select: 'name'
    },
    
  });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Get User Profile called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ 
      username: user.username, 
      email: user.email,
      isAdmin: user.isAdmin,
      profilePic: user.profilePic,
      savedBlogs: user.savedBlogs,
      likedBlogs: user.likedBlogs,
      
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const profilePic = req.file;

    // Log request body for debugging
    console.log('Update Profile request body:', { username, email });
    console.log('Profile pic file:', profilePic ? 'Present' : 'Missing');

    // Validate inputs
    if (username && username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check for existing email (email must remain unique)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Prepare update object
    const updateData = {};
    if (username) updateData.username = username.trim();
    if (email) updateData.email = email.toLowerCase();

    // Update profile picture if provided
    if (profilePic) {
      const profilePicUrl = await cloudinaryUtils.uploadImage(profilePic.buffer, 'profile_pics');
      updateData.profilePic = profilePicUrl;
    }

    // Ensure at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Update Profile called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePic: user.profilePic,
        
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user
    const username = email.split('@')[0]; // Generate username from email
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: true
    });

    await user.save();

    console.log('Register Admin called at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
};
