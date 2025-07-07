// controllers/authController.js

export const register = (req, res) => {
  console.log('Register called at', new Date().toLocaleString());
  res.status(201).json({ message: 'User registered successfully' });
};

export const login = (req, res) => {
  console.log('Login called at', new Date().toLocaleString());
  res.status(200).json({ message: 'User logged in successfully' });
};

export const getUserProfile = (req, res) => {
  console.log('Get User Profile called at', new Date().toLocaleString());
  res.status(200).json({ username: 'example_user', email: 'user@example.com' });
};

export const updateUsername = (req, res) => {
  console.log('Update Username called at', new Date().toLocaleString());
  const { newUsername } = req.body;
  res.status(200).json({ message: `Username updated to ${newUsername}` });
};
